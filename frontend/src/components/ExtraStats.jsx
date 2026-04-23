import { windDegToDir, formatVisibility, computeDewPoint } from '../utils/weatherHelpers'
import { convertTemp, unitLabel } from '../utils/units'
import { useUnit } from '../context/UnitContext'
import { StatsSkeleton } from './Skeleton'

export default function ExtraStats({ weather, loading }) {
  const { unit } = useUnit()

  if (loading) return <StatsSkeleton />
  if (!weather) return null

  const u   = unitLabel(unit)
  const dew = computeDewPoint(weather.temperature, weather.humidity)

  const rows = [
    [
      { label: 'Viento',         value: `${weather.wind_speed} m/s`, sub: windDegToDir(weather.wind_deg) },
      { label: 'Presión',        value: `${weather.pressure ?? '—'} hPa`, sub: weather.pressure > 1013 ? 'Alta' : 'Baja' },
    ],
    [
      { label: 'Visibilidad',    value: formatVisibility(weather.visibility) },
      { label: 'Nubosidad',      value: `${weather.clouds ?? '—'}%` },
    ],
    [
      { label: 'Punto de rocío', value: dew != null ? `${convertTemp(dew, unit)}${u}` : '—' },
      { label: 'Ráfaga',         value: weather.wind_gust != null ? `${weather.wind_gust} m/s` : '—' },
    ],
  ]

  return (
    <div>
      <p className="text-[10px] text-neutral-700 uppercase tracking-widest mb-4">Detalles</p>
      <div className="divide-y divide-neutral-900">
        {rows.map((pair, i) => (
          <div key={i} className="grid grid-cols-2 gap-x-6 py-4">
            {pair.map((s) => (
              <div key={s.label}>
                <p className="text-[10px] text-neutral-600 uppercase tracking-wider">{s.label}</p>
                <p className="text-sm text-white mt-1">{s.value}</p>
                {s.sub && <p className="text-[10px] text-neutral-700 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
