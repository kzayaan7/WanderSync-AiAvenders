import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Map, Sparkles, Database, ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react'
import { apiService } from '../services/apiService'

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

export default function AdminDashboard({ onExit }) {
  const navigate = useNavigate()
  const handleExit = onExit || (() => navigate('/'))
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, usersRes, itinsRes] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAdminUsers(),
        apiService.getAdminItineraries()
      ])
      setStats(statsRes.stats)
      setUsers(usersRes.users || [])
      setItineraries(itinsRes.itineraries || [])
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

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="wandermap-card p-6 rounded-3xl border border-slate-200/90 shadow-soft-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExit}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
            title="Back to WanderSync"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              CONTROL TOWER
            </span>
            <h2 className="font-display font-extrabold text-3xl text-slate-900 mt-1 tracking-tight">ADMIN DASHBOARD</h2>
          </div>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 font-medium">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.total_users} accent="bg-primary/10 text-primary" />
        <StatCard icon={Map} label="Itineraries" value={stats?.total_itineraries} accent="bg-secondary/10 text-secondary" />
        <StatCard icon={Sparkles} label="Activities" value={stats?.total_activities} accent="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Database} label="Preference Vectors" value={stats?.total_preferences_stored} accent="bg-tertiary/10 text-tertiary" />
      </div>

      {/* Two-column tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Users Table */}
        <div className="wandermap-card rounded-3xl border border-slate-200/90 shadow-soft-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-extrabold text-slate-900 font-display">Registered Users</h3>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {users.length === 0 && !loading && (
              <p className="p-5 text-xs text-slate-400">No users found.</p>
            )}
            {users.map((u) => (
              <div key={u.id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{u.email}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}
                  </p>
                </div>
                {u.is_admin && (
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold shrink-0">
                    ADMIN
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Itineraries Table */}
        <div className="wandermap-card rounded-3xl border border-slate-200/90 shadow-soft-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-extrabold text-slate-900 font-display">Recent Itineraries</h3>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {itineraries.length === 0 && !loading && (
              <p className="p-5 text-xs text-slate-400">No itineraries generated yet.</p>
            )}
            {itineraries.map((it) => (
              <div key={it.id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{it.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{it.destination}</p>
                </div>
                <span className="font-extrabold text-xs text-primary shrink-0">
                  ${it.total_estimated_cost}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
