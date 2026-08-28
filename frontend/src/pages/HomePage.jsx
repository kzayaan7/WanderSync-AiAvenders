import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ChatInterface from '../components/ChatInterface'
import ItineraryForm from '../components/ItineraryForm'
import ItineraryView from '../components/ItineraryView'
import MapView from '../components/MapView'
import TravelLoader from '../components/TravelLoader'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/apiService'
import { Sparkles, AlertCircle, History, MapPin, Compass, ArrowRight, Sun, Calendar } from 'lucide-react'
import { FEATURED_DESTINATIONS } from '../utils/destinationImages'
import { useDestinationImage } from '../hooks/useDestinationImage'

function FeaturedDestinationCard({ dest, onSelect }) {
  const img = useDestinationImage(dest.name)
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer wandermap-card rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={img}
          alt={dest.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm tracking-wide">
          {dest.tag}
        </span>
        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary bg-[#F97316] text-white shadow-coral tracking-wide">
          {dest.budget}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors tracking-wide">{dest.name}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed tracking-normal">{dest.description}</p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-primary tracking-wide">
          <span>{dest.duration} Trip</span>
          <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Select <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user, requireAuth, openAuth } = useAuth()
  const [extractedParams, setExtractedParams] = useState(null)
  const [itinerary, setItinerary] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleGenerateItinerary = (params) => {
    requireAuth(async () => {
      setIsGenerating(true)
      setErrorMsg('')

      try {
        const res = await apiService.generateItinerary(params)
        if (res && res.itinerary) {
          setItinerary(res.itinerary)
        }
      } catch (err) {
        console.warn('[HomePage Warning] Backend API error, initializing fallback itinerary:', err)
        setItinerary({
          id: 'fallback-demo-uuid',
          title: `Discovery Trip to ${params.destination}`,
          destination: params.destination,
          destination_lat: 35.6762,
          destination_lng: 139.6503,
          start_date: params.start_date,
          end_date: params.end_date,
          duration_days: 4,
          total_estimated_cost: params.total_budget || 1200.0,
          currency_symbol: params.currency_symbol || '$',
          share_token: 'demo-share-token-123',
          days: [
            {
              day_number: 1,
              date: params.start_date,
              title: `Arrival & Central ${params.destination} Exploration`,
              summary: 'Discover historic streets, artisan cafes, and landmark attractions.',
              weather: { temp_max_c: 22.0, temp_min_c: 15.0, condition: 'Clear & Sunny' },
              activities: [
                {
                  id: 'act-1',
                  sequence_order: 1,
                  title: 'Historic Heritage Quarter Walking Tour',
                  category: 'attraction',
                  start_time: '10:00',
                  end_time: '12:30',
                  duration_mins: 150,
                  cost_estimate: 0.0,
                  lat: 35.6983,
                  lng: 139.7731,
                  address: `Central Plaza, ${params.destination}`,
                  description: 'Walk through historic landmarks, architectural wonders, and lively open plazas.'
                },
                {
                  id: 'act-2',
                  sequence_order: 2,
                  title: 'Artisan Gourmet Tasting Lunch',
                  category: 'food',
                  start_time: '13:00',
                  end_time: '14:30',
                  duration_mins: 90,
                  cost_estimate: 25.0,
                  lat: 35.7001,
                  lng: 139.7715,
                  address: `Culinary Market, ${params.destination}`,
                  description: 'Sample authentic regional specialties and traditional local dining stalls.'
                }
              ]
            }
          ]
        })
      } finally {
        setIsGenerating(false)
      }
    })
  }

  const handleEditItinerary = (dayNumber, newActivities) => {
    if (!itinerary) return
    const updatedDays = itinerary.days.map((day) =>
      day.day_number === dayNumber ? { ...day, activities: newActivities } : day
    )
    setItinerary({ ...itinerary, days: updatedDays })
  }

  const handleQuickDestinationSelect = (destName) => {
    setExtractedParams((prev) => ({
      ...prev,
      destination: destName
    }))
  }

  return (
    <div className="space-y-10">

      {/* Travel Loading Animation Modal when Generating Itinerary */}
      {isGenerating && (
        <TravelLoader
          destination={extractedParams?.destination || 'your destination'}
          fullScreen={true}
        />
      )}

      {/* Hero — Photo-Rich Adventurous Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-soft-xl border border-slate-200/80 min-h-[440px] flex items-center bg-slate-900">
        {/* Background Destination Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80')`
          }}
        />
        {/* Ambient Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent" />

        <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-3xl text-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary bg-[#0F766E] text-white shadow-teal flex items-center gap-1.5 tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> WanderMap AI System
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md tracking-wide">
              Groq Llama 3.3 70B
            </span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-wide leading-[1.08]">
            EXPLORE THE WORLD,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-200 to-amber-300">
              TAILORED IN SECONDS.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-200 mt-5 leading-relaxed font-normal max-w-2xl tracking-normal">
            Describe your dream destination, dates, and interests. WanderSync orchestrates live weather forecasts, map points of interest, and AI reasoning into a photo-rich day-by-day itinerary.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 border-t border-white/15 pt-5 tracking-wide">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Weather + OSM
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-300" /> Interactive Teal Pin Routes
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-300" /> iCal & PDF Exports
            </span>
          </div>
        </div>
      </div>

      {/* Featured Destination Exploration Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 font-display tracking-wide">
              <Compass className="w-5 h-5 text-primary" /> Popular Featured Destinations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tracking-normal">Click any destination card to instantly pre-fill your trip specs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_DESTINATIONS.map((dest, idx) => (
            <FeaturedDestinationCard key={idx} dest={dest} onSelect={() => handleQuickDestinationSelect(dest.name)} />
          ))}
        </div>
      </div>

      {!user ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 shadow-soft-sm tracking-wide">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Browse freely — sign in when you're ready to chat with the AI assistant or generate an itinerary.</span>
        </div>
      ) : (
        <Link
          to="/history"
          className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 text-slate-700 text-xs hover:border-primary hover:text-primary transition-all shadow-soft-sm group tracking-wide"
        >
          <span className="flex items-center gap-2 font-medium">
            <History className="w-4 h-4 text-primary" />
            View your saved trip history and personalized recommendations
          </span>
          <span className="font-bold group-hover:translate-x-1 transition-transform">View History →</span>
        </Link>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 tracking-normal">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input & Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ChatInterface
            user={user}
            onRequireAuth={openAuth}
            onExtractedParams={(params) => setExtractedParams(params)}
            isGenerating={isGenerating}
          />
        </div>
        <div className="lg:col-span-5">
          <ItineraryForm
            user={user}
            onRequireAuth={openAuth}
            extractedParams={extractedParams}
            onGenerate={handleGenerateItinerary}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      {/* Output & Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        <div className="lg:col-span-7">
          <ItineraryView itinerary={itinerary} onEditItinerary={handleEditItinerary} />
        </div>
        <div className="lg:col-span-5">
          <MapView itinerary={itinerary} />
        </div>
      </div>

    </div>
  )
}