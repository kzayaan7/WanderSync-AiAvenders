import React from 'react'
import { FileText } from 'lucide-react'

const SECTIONS = [
    {
        title: '1. Acceptance of Terms',
        body: 'By accessing or using WanderSync ("the Service"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Service.'
    },
    {
        title: '2. Description of Service',
        body: 'WanderSync is an AI-assisted travel planning tool that generates suggested itineraries using third-party data sources (mapping, weather, and points-of-interest providers) and a large language model. Generated content is a planning aid, not a guarantee of accuracy, availability, pricing, or safety at any destination.'
    },
    {
        title: '3. Accounts',
        body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us promptly of any unauthorized use.'
    },
    {
        title: '4. Generated Content & Accuracy',
        body: "Itineraries, cost estimates, weather forecasts, and points of interest are generated using automated systems and may be incomplete, outdated, or inaccurate. Always independently verify critical details — opening hours, prices, visa/entry requirements, and safety conditions — before you travel."
    },
    {
        title: '5. Budgets & Currency',
        body: 'Cost estimates are approximations in the currency you select when generating a trip. They are not bookings, quotes, or guarantees of actual travel cost, and do not account for real-time exchange rate fluctuations, taxes, or fees.'
    },
    {
        title: '6. Acceptable Use',
        body: "You agree not to misuse the Service — including attempting to disrupt it, submitting unlawful or harmful content through the chat assistant or contact form, or trying to circumvent any access controls (including admin-only areas)."
    },
    {
        title: '7. Third-Party Services',
        body: 'The Service relies on third-party APIs (mapping, weather, image, and AI providers) that are outside our control and may change, rate-limit, or become unavailable without notice.'
    },
    {
        title: '8. Limitation of Liability',
        body: 'The Service is provided "as is" without warranties of any kind. To the fullest extent permitted by law, WanderSync and its operators are not liable for any indirect, incidental, or consequential damages arising from your use of the Service or reliance on generated content.'
    },
    {
        title: '9. Changes to These Terms',
        body: 'We may update these Terms from time to time. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms.'
    },
    {
        title: '10. Contact',
        body: 'Questions about these Terms can be sent via the Contact page.'
    },
]

export default function TermsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="wandermap-card p-8 rounded-3xl border border-slate-200/90 shadow-soft-md text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6" />
                </div>
                <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">TERMS & CONDITIONS</h1>
                <p className="text-xs text-slate-500 mt-1">Last updated: 2026</p>
            </div>

            <div className="wandermap-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-soft-md space-y-6">
                {SECTIONS.map((s, idx) => (
                    <div key={idx}>
                        <h2 className="text-sm font-extrabold text-slate-900 font-display mb-1.5">{s.title}</h2>
                        <p className="text-xs text-slate-600 leading-relaxed">{s.body}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}