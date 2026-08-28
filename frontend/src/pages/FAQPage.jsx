import React, { useState } from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'

const FAQS = [
    {
        q: 'How does WanderSync generate an itinerary?',
        a: "You describe (or fill in a form for) your destination, dates, budget, and interests. WanderSync geocodes the destination, pulls a live weather forecast and nearby points of interest, then hands all of that to an AI planner which builds a day-by-day schedule, which we then re-optimize for a sensible route."
    },
    {
        q: 'Is my trip data saved?',
        a: "Yes — once you're signed in, every generated itinerary is saved to your account and appears under Trip History. You can revisit, export, or share any past trip at any time."
    },
    {
        q: 'Can I change the currency my budget is shown in?',
        a: "Yes — pick your currency in the trip planning form before generating a trip. The itinerary's activity costs and totals will be generated and displayed in that currency."
    },
    {
        q: 'Can I share an itinerary with someone else?',
        a: "Yes — every itinerary gets a shareable link (via its share token) that opens a read-only view, no account required on the recipient's end."
    },
    {
        q: 'Can I export my itinerary?',
        a: 'Yes — you can export any itinerary as a PDF document or as a calendar (.ics) file you can import into Google Calendar, Outlook, or Apple Calendar.'
    },
    {
        q: 'What is the "Control Tower" / Admin panel?',
        a: 'It\'s an internal dashboard for site administrators to view usage statistics, registered users, generated itineraries, and contact form messages. It is only visible to accounts flagged is_admin in the database.'
    },
    {
        q: 'What happens if I ask for a destination WanderSync doesn\'t recognize?',
        a: "We use open map and geocoding services to resolve almost any place name. If a destination genuinely can't be found, you'll be prompted to refine or double-check the spelling."
    },
]

function FAQItem({ faq, isOpen, onToggle }) {
    return (
        <div className="wandermap-card rounded-2xl border border-slate-200/90 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
                <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed">
                    {faq.a}
                </div>
            )}
        </div>
    )
}

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState(0)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="wandermap-card p-8 rounded-3xl border border-slate-200/90 shadow-soft-md text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="w-6 h-6" />
                </div>
                <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">FREQUENTLY ASKED QUESTIONS</h1>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Answers to common questions about planning trips with WanderSync.
                </p>
            </div>

            <div className="space-y-3">
                {FAQS.map((faq, idx) => (
                    <FAQItem
                        key={idx}
                        faq={faq}
                        isOpen={openIndex === idx}
                        onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                    />
                ))}
            </div>
        </div>
    )
}