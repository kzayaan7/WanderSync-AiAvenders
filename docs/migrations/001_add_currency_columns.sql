-- ============================================================================
-- Migration 001: Add currency & currency_symbol columns to itineraries
-- ============================================================================
-- Problem: The itineraries table was created without currency tracking columns,
-- but the backend code attempts to upsert currency and currency_symbol fields.
-- This causes the entire Supabase upsert to fail silently, which is why
-- itineraries were never persisted to the database (and therefore never appeared
-- in user history or the admin dashboard).
--
-- Also: duration_days is a GENERATED ALWAYS column (computed from dates), so
-- the backend must NOT include it in INSERT/UPSERT statements — PostgreSQL
-- rejects writes to generated columns.
--
-- Run this in the Supabase SQL Editor before deploying the updated backend.
-- ============================================================================

-- 1. Add currency column (ISO 4217 code like "USD", "PKR", "EUR")
ALTER TABLE public.itineraries
    ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';

-- 2. Add currency_symbol column (display symbol like "$", "₨", "€")
ALTER TABLE public.itineraries
    ADD COLUMN IF NOT EXISTS currency_symbol TEXT NOT NULL DEFAULT '$';

-- 3. Create an index for currency filtering (useful for admin analytics)
CREATE INDEX IF NOT EXISTS idx_itineraries_currency ON public.itineraries(currency);

-- ============================================================================
-- Verification: confirm the columns exist
-- ============================================================================
-- Run this SELECT to verify after migration:
--   SELECT column_name, data_type, column_default, is_nullable
--   FROM information_schema.columns
--   WHERE table_name = 'itineraries' AND table_schema = 'public'
--   ORDER BY ordinal_position;
--
-- Expected output should include:
--   currency      | text | 'USD' | NO
--   currency_symbol | text | '$'  | NO
-- ============================================================================
