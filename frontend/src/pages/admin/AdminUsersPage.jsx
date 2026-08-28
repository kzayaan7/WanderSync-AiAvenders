import React, { useEffect, useState } from 'react'
import { RefreshCw, ShieldAlert } from 'lucide-react'
import { apiService } from '../../services/apiService'

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await apiService.getAdminUsers()
            setUsers(res.users || [])
        } catch (err) {
            setError(
                err?.response?.status === 403
                    ? 'Admin access required for this account.'
                    : 'Could not load users — backend or database may be offline.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    return (
        <div className="wandermap-card rounded-3xl border border-slate-200/90 shadow-soft-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 font-display">Registered Users</h3>
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
                {users.length === 0 && !loading && (
                    <p className="p-5 text-xs text-slate-400">No users found.</p>
                )}
                {users.map((u) => (
                    <div key={u.id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{u.email}</p>
                            {u.full_name && <p className="text-[11px] text-slate-500 truncate">{u.full_name}</p>}
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
    )
}