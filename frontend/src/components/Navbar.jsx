import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Compass, User, LogOut, ShieldCheck, History as HistoryIcon, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Plan Trip', icon: Compass, end: true },
  { to: '/history', label: 'Trip History', icon: HistoryIcon },
  { to: '/about', label: 'How It Works', icon: Info },
]

export default function Navbar() {
  const { user, isAdmin, openAuth, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-soft-sm px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-teal shrink-0 group-hover:scale-105 transition-transform border border-slate-200/80 bg-white flex items-center justify-center">
            <img src="/logo.jpg" alt="WanderSync Logo" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                WANDERSYNC
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-light text-primary border border-primary/20 rounded-full">
                AI TRAVEL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">
              Adventurous Destination Planner
            </p>
          </div>
        </Link>

        {/* Page Nav */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-full border border-slate-200">
          {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary bg-[#0F766E] text-white shadow-teal'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isActive
                        ? 'bg-primary-light text-primary border-primary/30'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-primary/40'
                    }`
                  }
                >
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Control Tower</span>
                </NavLink>
              )}
              <span className="text-xs font-medium text-slate-700 hidden lg:inline max-w-[160px] truncate bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuth}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-extrabold shadow-coral transition-all hover:scale-105 active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile page nav */}
      <nav className="flex md:hidden items-center gap-1.5 mt-3 bg-slate-100 p-1.5 rounded-full border border-slate-200 overflow-x-auto">
        {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition-colors ${
                isActive ? 'bg-primary bg-[#0F766E] text-white shadow-teal' : 'text-slate-700'
              }`
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
