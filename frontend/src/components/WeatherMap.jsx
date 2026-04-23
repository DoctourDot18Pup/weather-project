import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const LAYERS = [
  { key: 'clouds_new',        label: 'Nubes' },
  { key: 'precipitation_new', label: 'Lluvia' },
  { key: 'temp_new',          label: 'Temp.' },
  { key: 'wind_new',          label: 'Viento' },
]

const markerIcon = L.divIcon({
  className: '',
  html: '<div style="width:8px;height:8px;background:white;border-radius:50%;box-shadow:0 0 0 2px rgba(255,255,255,0.3)"></div>',
  iconSize: [8, 8],
  iconAnchor: [4, 4],
})

function MapController({ lat, lon }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lon], map.getZoom()) }, [lat, lon, map])
  return null
}

export default function WeatherMap({ lat, lon, city }) {
  const [activeLayer, setActiveLayer] = useState('clouds_new')

  if (!lat || !lon) return null

  const owmUrl = `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] text-neutral-700 uppercase tracking-widest">Mapa</p>
        <div className="flex gap-1">
          {LAYERS.map(l => (
            <button
              key={l.key}
              onClick={() => setActiveLayer(l.key)}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                activeLayer === l.key
                  ? 'text-white border border-neutral-600'
                  : 'text-neutral-700 border border-neutral-900 hover:border-neutral-700 hover:text-neutral-400'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded overflow-hidden" style={{ height: 320 }}>
        <MapContainer
          center={[lat, lon]}
          zoom={8}
          style={{ height: '100%', width: '100%', background: '#000' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <TileLayer
            url={owmUrl}
            opacity={0.7}
          />
          <Marker position={[lat, lon]} icon={markerIcon} />
          <MapController lat={lat} lon={lon} />
        </MapContainer>
      </div>

      {city && (
        <p className="text-[10px] text-neutral-800 mt-2 text-right">{city} · {lat.toFixed(2)}, {lon.toFixed(2)}</p>
      )}
    </div>
  )
}
