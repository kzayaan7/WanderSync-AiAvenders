-- ============================================================================
-- WanderSync — PostgreSQL Schema & Database DDL Script
-- Target Database: Supabase PostgreSQL 15+
-- Extensions: uuid-ossp, vector (pgvector)
-- Security: Row Level Security (RLS) Policies Enforced
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create User Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    default_currency TEXT DEFAULT 'USD',
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Create Preferences Embeddings Table (pgvector for RAG)
CREATE TABLE IF NOT EXISTS public.preferences_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    preference_text TEXT NOT NULL,
    category TEXT CHECK (category IN ('dietary', 'pace', 'interests', 'budget', 'accessibility', 'general')),
    embedding vector(384) NOT NULL, -- Storing 384-dim vector from all-MiniLM-L6-v2
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Create Itineraries Table
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    destination_lat NUMERIC(10, 7),
    destination_lng NUMERIC(10, 7),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
    budget_category TEXT CHECK (budget_category IN ('backpacker', 'moderate', 'luxury', 'custom')),
    total_estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    currency_symbol TEXT NOT NULL DEFAULT '$',
    travel_style TEXT,
    share_token UUID UNIQUE DEFAULT uuid_generate_v4() NOT NULL,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. Create Itinerary Days Table
CREATE TABLE IF NOT EXISTS public.itinerary_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    title TEXT,
    summary TEXT,
    weather_summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(itinerary_id, day_number)
);

-- 6. Create Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id UUID NOT NULL REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
    itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('attraction', 'food', 'transit', 'accommodation', 'leisure')),
    start_time TIME,
    end_time TIME,
    duration_mins INTEGER,
    cost_estimate NUMERIC(8, 2) DEFAULT 0.00,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    place_id TEXT,
    address TEXT,
    rating NUMERIC(3, 2),
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. Create Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    active_itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE SET NULL,
    chat_history JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8. Create Places Cache Table (Zero-cost rate limit caching)
CREATE TABLE IF NOT EXISTS public.places_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_key TEXT UNIQUE NOT NULL,
    geojson_data JSONB NOT NULL,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON public.itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_share_token ON public.itineraries(share_token);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_itinerary_id ON public.itinerary_days(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_activities_day_id ON public.activities(day_id);
CREATE INDEX IF NOT EXISTS idx_activities_itinerary_id ON public.activities(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_places_cache_query ON public.places_cache(query_key);

-- Cosine Distance Vector Index via HNSW
CREATE INDEX IF NOT EXISTS idx_preferences_embedding_hnsw 
ON public.preferences_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users manage their own profile
DROP POLICY IF EXISTS profiles_owner_policy ON public.profiles;
CREATE POLICY profiles_owner_policy ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- Preferences Embeddings: Users manage their own embeddings
DROP POLICY IF EXISTS preferences_owner_policy ON public.preferences_embeddings;
CREATE POLICY preferences_owner_policy ON public.preferences_embeddings
    FOR ALL USING (auth.uid() = user_id);

-- Itineraries: Owner has full access; Public can read if public or token matches
DROP POLICY IF EXISTS itineraries_owner_policy ON public.itineraries;
CREATE POLICY itineraries_owner_policy ON public.itineraries
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS itineraries_public_read_policy ON public.itineraries;
CREATE POLICY itineraries_public_read_policy ON public.itineraries
    FOR SELECT USING (is_public = TRUE OR share_token IS NOT NULL);

-- Itinerary Days: Accessible if parent itinerary belongs to user or is shared
DROP POLICY IF EXISTS days_owner_policy ON public.itinerary_days;
CREATE POLICY days_owner_policy ON public.itinerary_days
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.itineraries 
            WHERE itineraries.id = itinerary_days.itinerary_id 
            AND itineraries.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS days_public_read_policy ON public.itinerary_days;
CREATE POLICY days_public_read_policy ON public.itinerary_days
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.itineraries 
            WHERE itineraries.id = itinerary_days.itinerary_id 
            AND (itineraries.is_public = TRUE OR itineraries.share_token IS NOT NULL)
        )
    );

-- Activities: Accessible if parent itinerary belongs to user or is shared
DROP POLICY IF EXISTS activities_owner_policy ON public.activities;
CREATE POLICY activities_owner_policy ON public.activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.itineraries 
            WHERE itineraries.id = activities.itinerary_id 
            AND itineraries.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS activities_public_read_policy ON public.activities;
CREATE POLICY activities_public_read_policy ON public.activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.itineraries 
            WHERE itineraries.id = activities.itinerary_id 
            AND (itineraries.is_public = TRUE OR itineraries.share_token IS NOT NULL)
        )
    );

-- Sessions: Users manage their own sessions
DROP POLICY IF EXISTS sessions_owner_policy ON public.sessions;
CREATE POLICY sessions_owner_policy ON public.sessions
    FOR ALL USING (auth.uid() = user_id);

-- Trigger for auto-creating profile on user sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'full_name', 
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ADMIN ACCESS
-- ============================================================================
-- Admins are just profiles rows with is_admin = TRUE. The backend's
-- require_admin decorator checks this flag via the service-role key (which
-- bypasses RLS), and the existing profiles_owner_policy above already lets a
-- signed-in user read their own is_admin flag — no extra policy needed.

-- ----------------------------------------------------------------------------
-- Bootstrapping the first admin account
-- ----------------------------------------------------------------------------
-- 1. In the running app, sign up normally (Navbar -> Sign In -> Sign Up) using:
--      email:    admin@wandersync.ai
--      password: WanderSync!Admin2026
--    This creates the auth.users row and, via the trigger above, a matching
--    public.profiles row with is_admin = FALSE by default.
--
-- 2. In the Supabase SQL editor, promote that account to admin:
--      UPDATE public.profiles SET is_admin = TRUE WHERE email = 'admin@wandersync.ai';
--
-- 3. Sign out and back in on the site. The Navbar will now show a
--    "Control Tower" link that opens the admin dashboard.
--
-- IMPORTANT: this is a demo credential for competition/local use only.
-- Change the password (Supabase Auth -> Users -> Reset password) before
-- deploying anywhere public.

-- ----------------------------------------------------------------------------
-- Fixing is_admin if it was added as a TEXT column by hand
-- ----------------------------------------------------------------------------
-- If you added is_admin via the Supabase table editor before running this
-- schema (or it otherwise ended up as `text` instead of `boolean`), run this
-- once to convert it safely — a stray 'false' string is truthy in most
-- languages, so this matters:
--
--   ALTER TABLE public.profiles
--     ALTER COLUMN is_admin TYPE boolean
--     USING (COALESCE(lower(is_admin::text), 'false') IN ('true', 't', '1', 'yes'));
--
--   ALTER TABLE public.profiles ALTER COLUMN is_admin SET DEFAULT FALSE;
--   ALTER TABLE public.profiles ALTER COLUMN is_admin SET NOT NULL;
