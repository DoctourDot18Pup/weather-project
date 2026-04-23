import { getAqiLabel } from '../utils/weatherHelpers'

const POLLUTANTS = [
  { key: 'pm2_5', label: 'PM2.5', safe: 12  },
  { key: 'pm10',  label: 'PM10',  safe: 54  },
  { key: 'o3',    label: 'O₃',    safe: 100 },
  { key: 'co',    label: 'CO',    safe: 400 },
]

export default function AirQuality({ aqi, components }) {
  if (aqi == null) return null

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-baseline justify-between mb-6">
        <p className="text-[10px] text-neutral-700 uppercase tracking-widest">Calidad del aire</p>
        <p className="text-xs text-neutral-500">{getAqiLabel(aqi)}</p>
      </div>

      {/* AQI + barra */}
      <div className="flex items-center gap-6 mb-6">
        <p className="text-5xl font-thin text-white tabular-nums w-10 flex-shrink-0">{aqi}</p>
        <div className="flex-1 flex gap-1 items-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`flex-1 h-px transition-colors ${n <= aqi ? 'bg-white' : 'bg-neutral-800'}`}
            />
          ))}
        </div>
        <span className="text-[10px] text-neutral-600 w-14 text-right">5 = Muy malo</span>
      </div>

      {/* Contaminantes */}
      {components && (
        <div className="grid grid-cols-4 divide-x divide-neutral-900">
          {POLLUTANTS.map(({ key, label, safe }) => {
            const val = components[key]
            const high = val != null && val > safe
            return (
              <div key={key} className="px-4 first:pl-0 last:pr-0">
                <p className="text-[10px] text-neutral-700 uppercase tracking-wide">{label}</p>
                <p className={`text-sm mt-1 tabular-nums ${high ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {val != null ? val.toFixed(1) : '—'}
                </p>
                <p className="text-[9px] text-neutral-800 mt-0.5">µg/m³</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
