import React, { useState } from 'react'
import { Calendar, CloudSun, DollarSign, Clock, MapPin, Download, Share2, Plus, Trash2, Compass } from 'lucide-react'
import { exportToPDF, exportToICS } from '../utils/exportUtils'
import { useDestinationImage } from '../hooks/useDestinationImage'

export default function ItineraryView({ itinerary, onEditItinerary }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [copiedShare, setCopiedShare] = useState(false)
  const [newActivityTitle, setNewActivityTitle] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const heroPhoto = useDestinationImage(itinerary?.destination)

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <div className="wandermap-card p-12 rounded-3xl text-center border border-slate-200/80 shadow-soft-md space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-primary bg-[#0F766E] text-white flex items-center justify-center mx-auto mb-2 shadow-teal">
          <Compass className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 font-display">No Active Itinerary Generated Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Use the Conversational Assistant or fill out the Trip Specifications form to craft your adventurous multi-day itinerary.
        </p>
      </div>
    )
  }

  const days = itinerary.days
  const activeDay = days[selectedDayIndex] || days[0]
  const currencySymbol = itinerary.currency_symbol || '$'

  const handleCopyShareLink = () => {
    const link = `${window.location.origin}?share=${itinerary.share_token}`
    navigator.clipboard.writeText(link)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 3000)
  }

  const handleDeleteActivity = (actId) => {
    if (!onEditItinerary) return
    const updatedActivities = activeDay.activities.filter((a) => (a.id || a.title) !== actId)
    onEditItinerary(activeDay.day_number, updatedActivities)
  }

  const handleAddActivitySubmit = (e) => {
    e.preventDefault()
    if (!newActivityTitle.trim() || !onEditItinerary) return

    const newAct = {
      id: `custom-${Date.now()}`,
      sequence_order: activeDay.activities.length + 1,
      title: newActivityTitle.trim(),
      category: 'attraction',
      start_time: '15:00',
      end_time: '16:30',
      duration_mins: 90,
      cost_estimate: 15.00,
      description: 'Custom activity added by user.'
    }

    onEditItinerary(activeDay.day_number, [...activeDay.activities, newAct])
    setNewActivityTitle('')
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6">

      {/* Destination Photo Header Banner */}
      <div className="relative rounded-3xl overflow-hidden h-48 shadow-soft-md bg-slate-900">
        <img
          src={heroPhoto}
          alt={itinerary.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end text-white">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-primary bg-[#0F766E] text-white uppercase tracking-wider">
              {itinerary.duration_days}-Day Odyssey
            </span>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mt-1 leading-tight">
              {itinerary.title}
            </h2>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-white text-slate-900 shadow-sm">
            Est. {currencySymbol}{itinerary.total_estimated_cost}
          </span>
        </div>
      </div>

      {/* Boarding Pass Ticket Stub */}
      <div className="ticket-stub rounded-3xl shadow-soft-md border border-slate-200/90 overflow-hidden flex flex-col md:flex-row">
        <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-primary-light text-primary border border-primary/20">
                BOARDING PASS
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                REF: {itinerary.share_token ? itinerary.share_token.slice(0, 8).toUpperCase() : 'WS0001'}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-3">
              <span>DESTINATION: <strong className="text-slate-900">{itinerary.destination}</strong></span>
              <span>•</span>
              <span>DATES: <strong className="text-slate-900">{itinerary.start_date || 'Oct 10'} - {itinerary.end_date || 'Oct 14'}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportToPDF(itinerary)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => exportToICS(itinerary)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
            >
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>iCal (.ics)</span>
            </button>
            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold shadow-coral transition-all hover:scale-105"
            >
              <Share2 className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-bold">{copiedShare ? 'Copied Link!' : 'Share Trip'}</span>
            </button>
          </div>
        </div>

        {/* Ticket stub end with barcode */}
        <div className="ticket-perforation w-full md:w-36 shrink-0 bg-slate-50 flex md:flex-col items-center justify-center gap-2 p-4 border-t md:border-t-0 md:border-l border-slate-200">
          <span className="font-mono text-xs font-bold text-primary tracking-wider">
            {itinerary.share_token ? itinerary.share_token.slice(0, 6).toUpperCase() : 'WS0001'}
          </span>
          <div className="barcode h-6 w-20 md:w-24 opacity-80" />
        </div>
      </div>

      {/* Days Tabs — rounded WanderMap pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDayIndex(idx)}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold shrink-0 transition-all ${selectedDayIndex === idx
                ? 'bg-primary bg-[#0F766E] text-white shadow-teal'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            Day {day.day_number}
          </button>
        ))}
      </div>

      {/* Day Details Card */}
      <div className="wandermap-card p-6 rounded-3xl border border-slate-200/90 shadow-soft-md space-y-6">

        {/* Day Weather Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-display">
              Day {activeDay.day_number}: {activeDay.title || 'Sightseeing'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{activeDay.summary}</p>
          </div>
          {activeDay.weather && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs shadow-sm">
              <CloudSun className="w-4 h-4 text-amber-500" />
              <div>
                <span className="font-bold text-slate-800">{activeDay.weather.condition || 'Clear'}</span>
                <span className="text-[10px] block text-slate-400 font-medium">
                  {activeDay.weather.temp_max_c}°C / {activeDay.weather.temp_min_c}°C
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Activities Timeline List */}
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200">
          {activeDay.activities.map((act, idx) => (
            <div key={idx} className="relative flex items-start gap-4 pl-12 group">

              {/* Marker Badge in Secondary Coral */}
              <div className="absolute left-3 top-1 w-6 h-6 rounded-full bg-secondary bg-[#F97316] text-white font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-coral">
                {idx + 1}
              </div>

              {/* Card */}
              <div className="flex-1 p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-primary transition-all shadow-soft-sm hover:shadow-soft-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-primary-light text-primary">
                      {act.category || 'attraction'}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {act.start_time || '10:00'} - {act.end_time || '11:30'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteActivity(act.id || act.title)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-all"
                    title="Remove Activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2 font-display">{act.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{act.description}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {act.address || itinerary.destination}
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    Est: {currencySymbol}{act.cost_estimate || 0}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Add Activity Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 rounded-2xl border border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 text-slate-600 hover:text-primary text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Activity to Day {activeDay.day_number}</span>
        </button>

      </div>

      {/* Add Custom Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="wandermap-card w-full max-w-sm p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-display">Add Activity to Day {activeDay.day_number}</h3>
            <form onSubmit={handleAddActivitySubmit} className="space-y-3">
              <input
                type="text"
                required
                value={newActivityTitle}
                onChange={(e) => setNewActivityTitle(e.target.value)}
                placeholder="e.g. Visit Senso-ji Temple"
                className="w-full px-3.5 py-2.5 rounded-xl wandermap-input text-xs"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-secondary bg-[#F97316] text-xs font-bold text-white shadow-coral"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}