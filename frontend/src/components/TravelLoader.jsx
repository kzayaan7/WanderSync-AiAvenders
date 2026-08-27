import React, { useState, useEffect } from 'react'
import { Compass, Navigation, Plane, Sparkles, MapPin, Sun, CloudSun, Luggage } from 'lucide-react'

const LOADING_MESSAGES = [
  { icon: Plane, text: 'Mapping flight paths and scenic routes...' },
  { icon: CloudSun, text: 'Fetching live destination weather forecasts...' },
  { icon: MapPin, text: 'Discovering authentic points of interest & local gems...' },
  { icon: Luggage, text: 'Optimizing daily activity timings & budget estimates...' },
  { icon: Sparkles, text: 'Synthesizing your personalized WanderSync itinerary...' }
]

export default function TravelLoader({ destination = 'your destination', fullScreen = true }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(12)

  useEffect(() => {
    // Cycle through travel messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 1800)

    // Smooth progress bar simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92
        return prev + Math.floor(Math.random() * 8) + 4
      })
    }, 400)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const CurrentMessageIcon = LOADING_MESSAGES[messageIndex].icon

  const content = (
    <div className="wandermap-card max-w-md w-full p-8 rounded-3xl border border-slate-200/90 shadow-2xl text-center space-y-6 relative overflow-hidden bg-white">
      {/* Background ambient radial glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Animated Flight Path Radar */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        {/* Pulsing Radar Ring */}
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-ripple pointer-events-none" />
        
        {/* Outer Compass Dial Ring */}
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center relative animate-spin-slow">
          <div className="w-20 h-20 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50">
            <Compass className="w-8 h-8 text-primary opacity-30" />
          </div>
        </div>

        {/* Center Flying Airplane Icon */}
        <div className="absolute inset-0 flex items-center justify-center animate-plane-fly">
          <div className="w-12 h-12 rounded-2xl bg-secondary bg-[#F97316] text-white flex items-center justify-center shadow-coral transform -rotate-45">
            <Plane className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Title & Destination Badge */}
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-light text-primary border border-primary/20 tracking-wide uppercase">
          DESTINATION: {destination}
        </span>
        <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
          PREPARING YOUR ODYSSEY
        </h3>
      </div>

      {/* Rotating Travel Message */}
      <div className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-all duration-300">
        <CurrentMessageIcon className="w-4 h-4 text-primary shrink-0 animate-bounce" />
        <span className="truncate">{LOADING_MESSAGES[messageIndex].text}</span>
      </div>

      {/* Animated Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 tracking-wide">
          <span>BOARDING STATUS</span>
          <span className="text-primary font-mono">{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-primary via-teal-500 to-secondary rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="text-[11px] text-slate-400 font-medium tracking-normal">
        Synthesizing real-time Groq Llama 3.3 70B reasoning & map routes...
      </p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
        {content}
      </div>
    )
  }

  return content
}
