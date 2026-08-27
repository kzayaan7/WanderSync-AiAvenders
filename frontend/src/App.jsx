import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import TravelGuideBot from './components/TravelGuideBot'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import TripDetailPage from './pages/TripDetailPage'
import AdminPage from './pages/AdminPage'
import AboutPage from './pages/AboutPage'
import { useAuth } from './context/AuthContext'
import { Compass, Heart } from 'lucide-react'

function Shell() {
  const { isAuthOpen, closeAuth, setUser, user, openAuth } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/trip/:id" element={<TripDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>

      <footer className="mt-16 border-t border-slate-200/80 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-700">WanderSync</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Adventurous Travel Discovery</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-500">
            <Link to="/about" className="hover:text-primary transition-colors">How It Works</Link>
            <Link to="/admin" className="hover:text-primary transition-colors">Control Tower</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={closeAuth}
        onAuthSuccess={(user) => {
          setUser(user)
          closeAuth()
        }}
      />

      <TravelGuideBot user={user} onRequireAuth={openAuth} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  )
}
