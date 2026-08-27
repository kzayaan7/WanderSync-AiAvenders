import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/apiService'
import ItineraryView from '../components/ItineraryView'
import MapView from '../components/MapView'

export default function TripDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    apiService.getItineraryDetail(id)
      .then((res) => setItinerary(res.itinerary))
      .catch(() => setError('Could not load this trip — it may not exist or belong to a different account.'))
      .finally(() => setLoading(false))
  }, [id, user])

  return (
    <div className="space-y-6">
      <Link to="/history" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Trip History
      </Link>

      {loading && (
        <div className="wandermap-card rounded-3xl p-10 text-center text-xs text-slate-400 border border-slate-200">
          Loading trip...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && itinerary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ItineraryView itinerary={itinerary} onEditItinerary={() => {}} />
          </div>
          <div className="lg:col-span-5">
            <MapView itinerary={itinerary} />
          </div>
        </div>
      )}
    </div>
  )
}
