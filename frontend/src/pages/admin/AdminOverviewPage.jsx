import React, { useEffect, useState } from 'react'
import { Users, Map, Sparkles, Database, ShieldAlert, RefreshCw } from 'lucide-react'
import { apiService } from '../../services/apiService'

function StatCard({ icon: Icon, label, value, accent }) {
    return (
        <div className="wandermap-card rounded-2xl p-5 border border-slate-200/90 shadow-soft-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${accent}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="font-semibold text-[10px] tracking-wider text-slate-500 uppercase">{label}</p>
                <p className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-none mt-1">{value ?? '—'}</p>
            </div>
        </div>
    )
}

export default function AdminOverviewPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await apiService.getAdminStats()
            setStats(res.stats)
        } catch (err) {
            setError(
                err?.response?.status === 403
                    ? 'Admin access required for this account.'
                    : 'Could not load admin data — backend or database may be offline.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 font-display">Overview</h3>
                <button
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors disabled:opacity-40"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 font-medium">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <StatCard icon={Users} label="Total Users" value={stats?.total_users} accent="bg-primary/10 text-primary" />
                <StatCard icon={Map} label="Itineraries" value={stats?.total_itineraries} accent="bg-secondary/10 text-secondary" />
                <StatCard icon={Sparkles} label="Activities" value={stats?.total_activities} accent="bg-emerald-50 text-emerald-600" />
                <StatCard icon={Database} label="Preference Vectors" value={stats?.total_preferences_stored} accent="bg-tertiary/10 text-tertiary" />
            </div>
        </div>
    )
}