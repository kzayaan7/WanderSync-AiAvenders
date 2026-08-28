import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Map, Compass, Sparkles, AlertCircle, ArrowRight, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/apiService'
import { useDestinationImage } from '../hooks/useDestinationImage'

function TripCard({ it, onOpen }) {
  const img = useDestinationImage(it.destination)
  const currencySymbol = it.currency_symbol || '$'
  return (
    <button
      onClick={onOpen}
      className="w-full text-left wandermap-card rounded-2xl overflow-hidden flex flex-col sm:flex-row items-stretch hover:shadow-soft-xl hover:border-primary transition-all group"
    >
      <div className="sm:w-40 h-28 sm:h-auto relative overflow-hidden shrink-0">
        <img src={img} alt={it.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent sm:hidden" />
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            {it.duration_days ? `${it.duration_days}-Day Trip` : 'Itinerary'}
          </span>
          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-primary transition-colors font-display line-clamp-1">
            {it.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{it.destination}</p>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-900">{currencySymbol}{it.total_estimated_cost}</span>
          <span className="font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
            View Trip <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </button>
  )
}

export default function HistoryPage() {
  const { user, openAuth } = useAuth()
  const navigate = useNavigate()
  const [itineraries, setItineraries] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [recsLoading, setRecsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setRecsLoading(false)
      return
    }

    apiService.getItineraryHistory()
      .then((res) => setItineraries(res.itineraries || []))
      .catch(() => setError('Could not load your trip history — backend may be offline.'))
      .finally(() => setLoading(false))

    apiService.getRecommendations()
      .then((res) => setRecommendations(res.recommendations || []))
      .catch(() => { })
      .finally(() => setRecsLoading(false))
  }, [user])

  if (!user) {
    return (
      <div className="wandermap-card rounded-3xl p-10 border border-slate-200 text-center max-w-lg mx-auto mt-10 shadow-soft-md space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900">SIGN IN TO VIEW HISTORY</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Your trip history and personalized recommendations are securely stored in your account.
        </p>
        <button
          onClick={openAuth}
          className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary-600 text-white text-xs font-extrabold shadow-coral transition-all hover:scale-105"
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="wandermap-card p-8 rounded-3xl border border-slate-200/90 shadow-soft-md">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
          TRAVEL LOG
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mt-2 tracking-tight">YOUR TRIP HISTORY</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">Every itinerary you've generated, plus recommendations built from your travel patterns.</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Past Trips */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-display">
            <Map className="w-4 h-4 text-primary" /> Saved Itineraries
          </h2>

          {loading && (
            <div className="wandermap-card rounded-3xl p-8 text-center text-xs text-slate-400 border border-slate-200">
              Loading your trips...
            </div>
          )}

          {!loading && itineraries.length === 0 && (
            <div className="wandermap-card rounded-3xl p-8 text-center border border-slate-200 space-y-3">
              <p className="text-xs text-slate-500">No saved trips generated yet.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary hover:bg-secondary-600 text-white text-xs font-extrabold shadow-coral transition-all"
              >
                Plan your first trip <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {itineraries.map((it) => (
              <TripCard key={it.id} it={it} onOpen={() => navigate(`/trip/${it.id}`)} />
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-display">
            <Sparkles className="w-4 h-4 text-tertiary" /> Recommended For You
          </h2>

          {recsLoading && (
            <div className="wandermap-card rounded-3xl p-8 text-center text-xs text-slate-400 border border-slate-200">
              Analyzing your travel preferences...
            </div>
          )}

          {!recsLoading && recommendations.length === 0 && (
            <div className="wandermap-card rounded-3xl p-6 text-center border border-slate-200">
              <p className="text-xs text-slate-500">
                Generate a trip or chat with the assistant first — recommendations refine as your travel history grows.
              </p>
            </div>
          )}

          {recommendations.map((rec, idx) => (
            <div key={idx} className="wandermap-card rounded-2xl p-5 border border-slate-200/90 shadow-soft-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <p className="text-sm font-extrabold text-slate-900 font-display">{rec.destination}</p>
                {rec.suggested_duration_days && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {rec.suggested_duration_days} Days
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{rec.reason}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}