import React, { useState } from 'react'
import { ShieldCheck, LogIn, Copy, Check, Terminal, WifiOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AdminDashboard from '../../components/AdminDashboard'

const PROMOTE_SQL = `UPDATE public.profiles SET is_admin = TRUE WHERE email = 'YOUR_EMAIL_HERE';`

export default function AdminPage() {
  const { user, isAdmin, adminCheckError, authChecked, openAuth } = useAuth()
  const [copied, setCopied] = useState(false)

  const copySql = () => {
    navigator.clipboard.writeText(PROMOTE_SQL.replace('YOUR_EMAIL_HERE', user?.email || 'YOUR_EMAIL_HERE'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!authChecked) return null

  // Not signed in at all
  if (!user) {
    return (
      <div className="wandermap-card rounded-3xl p-10 border border-slate-200 text-center max-w-lg mx-auto mt-10 shadow-soft-md space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900">SIGN IN REQUIRED</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          You need a WanderSync account before this page can check your admin status.
        </p>
        <button
          onClick={openAuth}
          className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary-600 text-white text-xs font-extrabold shadow-coral transition-all"
        >
          Sign In
        </button>
      </div>
    )
  }

  if (adminCheckError) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="wandermap-card rounded-3xl p-8 border border-red-200 text-center space-y-2">
          <WifiOff className="w-8 h-8 text-red-500 mx-auto" />
          <h2 className="font-display font-extrabold text-2xl text-slate-900">COULDN'T VERIFY ADMIN STATUS</h2>
          <p className="text-xs font-semibold text-red-600">{adminCheckError}</p>
          <p className="text-[11px] text-slate-500 mt-2">
            The backend couldn't be reached, so your account's actual is_admin value was not checked.
          </p>
        </div>

        <div className="wandermap-card rounded-3xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-extrabold text-slate-900 font-display">Things to check</h3>
          </div>
          <ul className="p-6 space-y-3 text-xs text-slate-600 leading-relaxed list-disc list-inside">
            <li>Is the Python Flask backend running (<span className="font-mono text-slate-900 font-bold">python wsgi.py</span>)?</li>
            <li>Does the backend <span className="font-mono text-slate-900 font-bold">.env</span> have real <span className="font-mono text-slate-900">SUPABASE_URL</span> and <span className="font-mono text-slate-900">SUPABASE_SERVICE_ROLE_KEY</span>?</li>
            <li>Does the frontend <span className="font-mono text-slate-900 font-bold">.env</span> point <span className="font-mono text-slate-900">VITE_API_BASE_URL</span> at that backend?</li>
          </ul>
        </div>
      </div>
    )
  }

  // Signed in, backend reachable, but confirmed not an admin
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="wandermap-card rounded-3xl p-8 border border-slate-200 text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="font-display font-extrabold text-2xl text-slate-900">NOT AN ADMIN YET</h2>
          <p className="text-xs text-slate-500">
            Signed in as <span className="text-slate-800 font-mono font-bold">{user.email}</span> — this account doesn't have Control Tower access.
          </p>
        </div>

        <div className="wandermap-card rounded-3xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-extrabold text-slate-900 font-display">How to promote your account</h3>
          </div>
          <ol className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
            <li>
              <span className="font-bold text-primary mr-2">1.</span>
              Open your Supabase project's <strong className="text-slate-900">SQL Editor</strong>.
            </li>
            <li>
              <span className="font-bold text-primary mr-2">2.</span>
              Run this command to promote <span className="font-mono text-slate-900 font-bold">{user.email}</span>:
              <div className="mt-2 relative">
                <pre className="bg-slate-900 rounded-xl p-3.5 font-mono text-[11px] text-teal-300 overflow-x-auto border border-slate-800">
{PROMOTE_SQL.replace('YOUR_EMAIL_HERE', user.email)}
                </pre>
                <button
                  onClick={copySql}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy SQL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </li>
            <li>
              <span className="font-bold text-primary mr-2">3.</span>
              Sign out and back in on WanderSync. The "Control Tower" page will unlock automatically.
            </li>
          </ol>
        </div>
      </div>
    )
  }

  // Is an admin
  return <AdminDashboard onExit={null} />
}
