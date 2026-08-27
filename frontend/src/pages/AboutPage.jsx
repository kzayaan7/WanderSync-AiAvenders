import React from 'react'
import { Cpu, Database, MapPin, ShieldCheck, Mic, Sparkles, Compass } from 'lucide-react'

const STAGES = [
  {
    icon: Mic,
    title: 'Natural Language & Voice Input',
    text: 'Describe your trip by typing or speaking — the Web Speech API transcribes voice in real time, no separate speech backend needed.'
  },
  {
    icon: Cpu,
    title: 'Groq Llama 3.3 70B Extraction',
    text: 'The assistant parses your message into structured trip parameters (destination, dates, budget, interests), validated and auto-repaired if anything comes back malformed.'
  },
  {
    icon: MapPin,
    title: 'Live Data Aggregation',
    text: 'Real-time weather (Open-Meteo) and points of interest (OpenStreetMap Overpass) are fetched for your destination and dates.'
  },
  {
    icon: Sparkles,
    title: 'Itinerary Generation + Optimization',
    text: 'Groq generates a full day-by-day plan, which is then re-sequenced and validated to guarantee the right number of days and no scheduling gaps.'
  },
  {
    icon: Database,
    title: 'Personalization via pgvector',
    text: 'Every message you send is embedded and stored. Future chats and dedicated recommendations draw on that history via Supabase pgvector similarity search.'
  },
  {
    icon: ShieldCheck,
    title: 'Secured Behind Auth',
    text: 'Every service action (chat, generation, history, admin) requires a signed-in Supabase session — enforced server-side, not just hidden in the UI.'
  }
]

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner with Adventurous Photo Accent */}
      <div className="relative wandermap-card rounded-3xl overflow-hidden shadow-soft-md border border-slate-200/90 p-8 md:p-12 text-center bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80')`
          }}
        />
        <div className="relative z-10 text-white max-w-xl mx-auto space-y-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-teal">
            WANDERSYNC ARCHITECTURE
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">HOW WANDERSYNC WORKS</h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            Built on a Retrieval-Augmented Generation pipeline: conversational input, live external data,
            LLM reasoning, and embeddings-based memory — all wired end-to-end.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon
          return (
            <div key={idx} className="wandermap-card rounded-2xl p-6 border border-slate-200/90 shadow-soft-sm flex items-start gap-4 hover:border-primary transition-all">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold tracking-wider text-primary uppercase">
                  STAGE {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 font-display">{stage.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{stage.text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
