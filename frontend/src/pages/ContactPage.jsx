import React, { useState } from 'react'
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { apiService } from '../services/apiService'

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
    const [status, setStatus] = useState('idle') // idle | sending | success | error
    const [errorMsg, setErrorMsg] = useState('')

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('sending')
        setErrorMsg('')
        try {
            await apiService.submitContactMessage(form)
            setStatus('success')
            setForm({ name: '', email: '', subject: '', message: '' })
        } catch (err) {
            setStatus('error')
            setErrorMsg(err?.response?.data?.message || 'Could not send your message — please try again shortly.')
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="wandermap-card p-8 rounded-3xl border border-slate-200/90 shadow-soft-md text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6" />
                </div>
                <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">GET IN TOUCH</h1>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Questions, feedback, or partnership ideas — send us a message and we'll get back to you.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="wandermap-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-soft-md space-y-4">
                {status === 'success' && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Thanks for reaching out — we'll get back to you soon.</span>
                    </div>
                )}
                {status === 'error' && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block">Your Name</label>
                        <input
                            name="name" required value={form.name} onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Jane Doe"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block">Email Address</label>
                        <input
                            name="email" type="email" required value={form.email} onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="jane@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Subject</label>
                    <input
                        name="subject" value={form.subject} onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="How can we help?"
                    />
                </div>

                <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Message</label>
                    <textarea
                        name="message" required rows={5} value={form.message} onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        placeholder="Tell us what's on your mind..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary-600 text-white text-xs font-extrabold shadow-coral transition-all disabled:opacity-50"
                >
                    <Send className="w-3.5 h-3.5" />
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    )
}