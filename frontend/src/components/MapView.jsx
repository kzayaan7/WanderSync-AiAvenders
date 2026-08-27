import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation } from 'lucide-react'

// Custom Map Recenter Helper Component
function ChangeView({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, 13)
  }, [center, map])
  return null
}

// Create custom numeric SVG pin icons in WanderMap Primary Teal (#0F766E)
const createTealIcon = (number) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="40" viewBox="0 0 34 40">
      <path d="M17 0C7.611 0 0 7.611 0 17c0 13 17 23 17 23s17-10 17-23c0-9.389-7.611-17-17-17z" fill="#0F766E" stroke="#FFFFFF" stroke-width="1.5"/>
      <circle cx="17" cy="16" r="9" fill="#FFFFFF"/>
      <text x="17" y="20" font-size="11" font-weight="bold" font-family="system-ui, sans-serif" fill="#0F766E" text-anchor="middle">${number}</text>
    </svg>
  `
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [34, 40],
    iconAnchor: [17, 40],
    popupAnchor: [0, -34]
  })
}

export default function MapView({ itinerary }) {
  const centerLat = itinerary?.destination_lat || 35.6762
  const centerLng = itinerary?.destination_lng || 139.6503

  // Extract all activity points for the selected itinerary
  const activities = []
  if (itinerary && itinerary.days) {
    itinerary.days.forEach((day) => {
      if (day.activities) {
        day.activities.forEach((act) => {
          if (act.lat && act.lng) {
            activities.push(act)
          }
        })
      }
    })
  }

  const polylineCoords = activities.map((a) => [a.lat, a.lng])

  return (
    <div className="wandermap-card p-5 rounded-3xl overflow-hidden relative space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-display">
          <Navigation className="w-4 h-4 text-primary" /> Interactive Map & Points of Interest
        </h3>
        <span className="text-[11px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
          Teal Pins Enabled
        </span>
      </div>

      <div className="h-[440px] rounded-2xl overflow-hidden border border-slate-200 relative z-10 shadow-inner">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#F8FAFC' }}
        >
          <ChangeView center={[centerLat, centerLng]} />

          {/* OpenStreetMap CartoDB Voyager Light Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Route Polyline connecting daily activities in Teal */}
          {polylineCoords.length > 1 && (
            <Polyline
              positions={polylineCoords}
              color="#0F766E"
              weight={4}
              opacity={0.85}
              dashArray="6, 8"
            />
          )}

          {/* Activity Teal Markers */}
          {activities.map((act, idx) => (
            <Marker
              key={idx}
              position={[act.lat, act.lng]}
              icon={createTealIcon(idx + 1)}
            >
              <Popup className="custom-popup">
                <div className="p-1 text-slate-900 text-xs max-w-[200px]">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-primary/10 text-primary">
                    Stop #{idx + 1}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{act.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">{act.description}</p>
                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-secondary">
                      Est: ${act.cost_estimate || 0}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {act.start_time || '10:00'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}