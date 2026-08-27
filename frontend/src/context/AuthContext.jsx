import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { apiService } from '../services/apiService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCheckError, setAdminCheckError] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthChecked(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setIsAdmin(false)
        setAdminCheckError('')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    setAdminCheckError('')
    apiService.checkAdminStatus()
      .then((res) => setIsAdmin(!!res.is_admin))
      .catch((err) => {
        setIsAdmin(false)
        // Distinguish "backend/DB unreachable" from "confirmed not admin" so
        // the UI never tells someone they're not an admin when the truth is
        // we simply couldn't check.
        const status = err?.response?.status
        if (status === 502 || status === 503 || !err?.response) {
          setAdminCheckError(
            err?.response?.data?.message ||
            'Could not reach the backend to verify admin status. Is the Flask server running and configured with SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY?'
          )
        }
      })
  }, [user])

  const openAuth = () => setIsAuthOpen(true)
  const closeAuth = () => setIsAuthOpen(false)

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }

  // Every "service" action across every page routes through this. Signed-in
  // users run the action immediately; everyone else sees the login modal and
  // the action never fires — pages stay fully browsable either way.
  const requireAuth = (action) => {
    if (!user) {
      openAuth()
      return false
    }
    action()
    return true
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, adminCheckError, authChecked, isAuthOpen, openAuth, closeAuth, signOut, requireAuth, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
