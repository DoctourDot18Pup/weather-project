import { useState, useEffect } from 'react'
import { getWeatherStats } from '../services/weatherApi'
import { convertTemp, unitLabel } from '../utils/units'
import { useUnit } from '../context/UnitContext'

export default function HistoryStats({ refreshKey }) {
  const { unit } = useUnit()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getWeatherStats()
      .then(r => setStats(r.data))
      .catch(() => {})
  }, [refreshKey])

  if (!stats || stats.total === 0) return null

  const u = unitLabel(unit)

  return (
    <div>
      <p className="text-[10px] text-neutral-700 uppercase tracking-widest mb-4">Estadísticas</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
        <Stat label="Búsquedas" value={stats.total} />
        <Stat label="Más buscada" value={stats.most_searched?.city ?? '—'} sub={stats.most_searched ? `${stats.most_searched.count} veces` : undefined} />
        <Stat label="Temp. promedio" value={`${convertTemp(stats.avg_temp, unit)}${u}`} />
        <Stat label="Rango" value={`${convertTemp(stats.min_temp, unit)}${u} – ${convertTemp(stats.max_temp, unit)}${u}`} />
      </div>

      {stats.conditions?.length > 0 && (
        <div>
          <p className="text-[10px] text-neutral-800 uppercase tracking-widest mb-2">Condiciones</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {stats.conditions.map(c => (
              <span key={c.label} className="text-xs text-neutral-600">
                {c.label} <span className="text-neutral-800">{c.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div>
      <p className="text-[10px] text-neutral-700 uppercase tracking-widest">{label}</p>
      <p className="text-sm text-neutral-300 mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-neutral-700 mt-0.5">{sub}</p>}
    </div>
  )
}
