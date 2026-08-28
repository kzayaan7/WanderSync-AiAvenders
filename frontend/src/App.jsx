import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import TravelGuideBot from './components/TravelGuideBot'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import TripDetailPage from './pages/TripDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import TermsPage from './pages/TermsPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminItinerariesPage from './pages/admin/AdminItinerariesPage'
import AdminMessagesPage from './pages/admin/AdminMessagesPage'
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
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="itineraries" element={<AdminItinerariesPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
          </Route>
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

          <div className="flex items-center gap-6 font-medium text-slate-500 flex-wrap justify-center">
            <Link to="/about" className="hover:text-primary transition-colors">How It Works</Link>
            <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
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