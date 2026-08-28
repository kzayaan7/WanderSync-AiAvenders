import React, { useEffect, useState } from 'react'
import { RefreshCw, ShieldAlert } from 'lucide-react'
import { apiService } from '../../services/apiService'

export default function AdminItinerariesPage() {
    const [itineraries, setItineraries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await apiService.getAdminItineraries()
            setItineraries(res.itineraries || [])
        } catch (err) {
            setError(
                err?.response?.status === 403
                    ? 'Admin access required for this account.'
                    : 'Could not load itineraries — backend or database may be offline.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    return (
        <div className="wandermap-card rounded-3xl border border-slate-200/90 shadow-soft-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 font-display">All Itineraries</h3>
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
                {itineraries.length === 0 && !loading && (
                    <p className="p-5 text-xs text-slate-400">No itineraries generated yet.</p>
                )}
                {itineraries.map((it) => (
                    <div key={it.id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{it.title}</p>
                            <p className="text-[11px] text-slate-500 truncate">{it.destination}</p>
                            {it.is_public && (
                                <span className="text-[10px] font-bold text-emerald-600">PUBLIC</span>
                            )}
                        </div>
                        <span className="font-extrabold text-xs text-primary shrink-0">
                            {it.currency_symbol || '$'}{it.total_estimated_cost}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}