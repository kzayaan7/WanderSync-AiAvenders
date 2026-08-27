# WanderSync — Generative AI Travel Itinerary Planner 🌍✈️

[![Zero-Cost Stack](https://img.shields.io/badge/Stack-100%25%20Zero--Cost-brightgreen.svg)](#zero-cost-tech-stack-compliance)
[![LLM Powered](https://img.shields.io/badge/LLM-Groq%20Llama%203.3%2070B-orange.svg)](https://groq.com)
[![Database](https://img.shields.io/badge/Database-Supabase%20Postgres%20%2B%20pgvector-blue.svg)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**WanderSync** is a production-grade, full-stack Generative AI travel itinerary planner engineered for the **TECHWIZ 6 Competition (SRS v1.0)**. It transforms natural language trip descriptions into optimized, multi-day, personalized travel itineraries featuring real-time weather integration, dynamic routing, and interactive Leaflet maps.

---

## 🌟 Key Features

- 💬 **Conversational AI Interface:** Describe your dream trip in plain language. WanderSync extracts travel parameters (destination, dates, budget, interests) using Meta's **Llama 3.3 70B** via Groq.
- ⚡ **Ultra-Fast Generation:** Day-by-day routing generated in under 3 seconds using Groq's high-speed LPU infrastructure.
- 🌤️ **Live Weather Integration:** Real-time daily weather forecasts per location integrated via the **Open-Meteo Forecast API**.
- 📍 **POIs & Places Data:** Automated extraction of attractions, local restaurants, and historical sites via **OpenStreetMap (Nominatim & Overpass API)**.
- 🗺️ **Interactive Maps & Polylines:** Dynamic rendering of numbered daily activity markers and travel routes using **Leaflet.js + OpenStreetMap tiles**.
- 🧠 **Personalization & RAG:** User travel preferences stored as 384-dimensional embeddings in **Supabase PostgreSQL** via `pgvector` for personalized recommendation retrieval.
- ✏️ **Dynamic Multi-Day Editing:** Add, reorder, or remove activities with real-time recalculation of travel times and costs.
- 📄 **100% Free Client Export:** Download complete itineraries as formatted PDF documents (`jsPDF`) or `.ics` iCal calendar invites directly in the browser.
- 🔗 **Public Trip Sharing:** Share view-only itinerary links via unique UUID tokens.
- 🔒 **Zero-Cost Security:** Built-in Supabase Auth (email/password & magic link) and Row Level Security (RLS) policies enforcing zero data leakage across users.

---

## 📁 Repository Structure

```
wandersync/
├── backend/                         # Flask Backend API
│   ├── app/
│   │   ├── __init__.py              # Application Factory & CORS
│   │   ├── config.py                # Environment Configuration
│   │   ├── middleware/              # Supabase JWT Auth Middleware
│   │   ├── services/
│   │   │   ├── groq_service.py      # Groq LLM API Client & Injection Guardrails
│   │   │   ├── weather_service.py   # Open-Meteo Weather Service
│   │   │   ├── places_service.py    # OSM Nominatim & Overpass POI Service
│   │   │   ├── optimizer_service.py # Greedy Route & Cost Optimizer
│   │   │   └── vector_service.py    # Local Sentence Embeddings + pgvector RAG
│   │   ├── routes/
│   │   │   ├── chat_routes.py       # Conversational Intent Parsing API
│   │   │   └── itinerary_routes.py  # Generation, Edit, Share APIs
│   │   └── utils/
│   │       └── validators.py        # Pydantic Schemas & Sanitization
│   ├── tests/                       # Pytest Automated Test Suite
│   │   ├── test_optimizer.py
│   │   ├── test_validators.py
│   │   └── test_api.py
│   ├── requirements.txt
│   ├── wsgi.py
│   └── .env.example
├── frontend/                        # React + Vite Frontend App
│   ├── src/
│   │   ├── components/              # Chat, Itinerary, Map, Auth Modals
│   │   ├── services/                # Supabase Client & API Client
│   │   ├── utils/                   # PDF & ICS Export Utilities
│   │   ├── App.jsx
│   │   ├── index.css                # Glassmorphic Tailwind Design Tokens
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── docs/                            # Documentation & Security Audits
│   ├── supabase_schema.sql          # Executable SQL DDL & RLS Policies
│   └── qa_security_audit_report.md  # Comprehensive QA & Audit Report
├── notebooks/                       # Mandatory Jupyter Notebook Deliverable
│   └── WanderSync_AI_RAG_Pipeline.ipynb # Groq Prompt Engineering & Vector RAG Pipeline
├── .env.example
└── README.md
```

---

## 🛠️ Quickstart Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- A free [Groq API Key](https://console.groq.com) (No credit card required)
- A free [Supabase Account](https://supabase.com) (No credit card required)

### Step 1: Database Setup (Supabase)
1. Log into your Supabase Dashboard and create a new project.
2. Open the **SQL Editor** tab.
3. Copy the contents of [`docs/supabase_schema.sql`](docs/supabase_schema.sql) and click **Run**.
4. Retrieve your **Supabase URL** and **Anon Key** from `Project Settings -> API`.

### Step 2: Backend Setup (Flask)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` with your API credentials:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
PORT=5000
```

Start the Flask backend development server:
```bash
python wsgi.py
```
Backend server will run at `http://localhost:5000`.

### Step 3: Frontend Setup (React + Vite)
```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the React development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running the Test Suite

```bash
cd backend
pytest tests/ -v
```

Tests cover:
- Pydantic schema validation & input sanitization.
- Prompt injection filter verification.
- Greedy route optimization algorithm correctness.
- API route status responses and fallback weather/POI mocking.

---

## 📢 AI Asset & Generation Disclosure

Per SRS submission requirements:
- **LLM Reasoning & Output:** Text itineraries and parameter extractions are generated dynamically using Meta's `llama-3.3-70b-versatile` via Groq LPU hardware.
- **Visual Assets & Map Tiles:** Map tiles are open-source OpenStreetMap layers rendered client-side via Leaflet.js. UI icons are provided by Lucide React.
