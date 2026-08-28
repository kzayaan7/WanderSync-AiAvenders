import React, { useEffect, useState } from 'react'
import { RefreshCw, ShieldAlert, Mail } from 'lucide-react'
import { apiService } from '../../services/apiService'

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await apiService.getAdminMessages()
            setMessages(res.messages || [])
        } catch (err) {
            setError(
                err?.response?.status === 403
                    ? 'Admin access required for this account.'
                    : 'Could not load contact messages — backend or database may be offline.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    return (
        <div className="wandermap-card rounded-3xl border border-slate-200/90 shadow-soft-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 font-display">Contact Messages</h3>
                <button
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors disabled:opacity-40"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="m-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 font-medium">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="max-h-[32rem] overflow-y-auto divide-y divide-slate-100">
                {messages.length === 0 && !loading && (
                    <div className="p-8 text-center">
                        <Mail className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No messages submitted yet.</p>
                    </div>
                )}
                {messages.map((m) => (
                    <div key={m.id} className="px-6 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-bold text-slate-900">{m.subject || 'General Inquiry'}</p>
                            <p className="text-[10px] text-slate-400 font-mono shrink-0">
                                {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                            </p>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{m.name} • {m.email}</p>
                        <p className="text-xs text-slate-700 mt-2 leading-relaxed">{m.message}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}