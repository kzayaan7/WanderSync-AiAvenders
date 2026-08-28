import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { X, Mail, Lock, Sparkles, KeyRound } from 'lucide-react'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  // Retry with timeout — handles Supabase wake-up delays and transient network issues
  const withRetry = async (fn, { retries = 2, timeoutMs = 8000 } = {}) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await Promise.race([
          fn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeoutMs)
          )
        ])
      } catch (err) {
        if (attempt === retries) throw err
        // Wait before retrying (1s, 2s...)
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (useMagicLink) {
        const { error } = await withRetry(() => supabase.auth.signInWithOtp({ email }))
        if (error) throw error
        setSuccessMsg('Magic link sent to your email! Check your inbox.')
      } else if (isSignUp) {
        const { data, error } = await withRetry(() => supabase.auth.signUp({ email, password }))
        if (error) throw error
        setSuccessMsg('Account created successfully! You are now logged in.')
        if (data.user) onAuthSuccess(data.user)
      } else {
        const { data, error } = await withRetry(() => supabase.auth.signInWithPassword({ email, password }))
        if (error) throw error
        if (data.user) onAuthSuccess(data.user)
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('timeout')) {
        setErrorMsg('Could not reach Supabase after multiple attempts. Your production app at Vercel should work fine — this is a local network issue. Try: (1) restarting your router, (2) using a mobile hotspot, or (3) opening the Vercel production URL instead.')
      } else {
        setErrorMsg(msg || 'Authentication failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="wandermap-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 font-display">
            {useMagicLink ? 'Passwordless Sign In' : isSignUp ? 'Create WanderSync Account' : 'Welcome Back'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-6 font-medium">
          Sign in to save trip itineraries, view trip history, and chat with AI.
        </p>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl wandermap-input text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          {!useMagicLink && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl wandermap-input text-xs sm:text-sm font-medium"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-secondary hover:bg-secondary-600 text-white font-extrabold text-sm shadow-coral transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : useMagicLink ? 'Send Magic Link' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2 text-center text-xs font-medium text-slate-500">
          <button
            type="button"
            onClick={() => setUseMagicLink(!useMagicLink)}
            className="text-primary hover:underline flex items-center justify-center gap-1 font-semibold"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {useMagicLink ? 'Use Password Sign In' : 'Use Passwordless Magic Link'}
          </button>
          {!useMagicLink && (
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-600 hover:text-slate-900 hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
