import { getWeatherIcon } from '../utils/weatherIcons'
import { formatDayName } from '../utils/weatherHelpers'
import { convertTemp, unitLabel } from '../utils/units'
import { useUnit } from '../context/UnitContext'
import { DailySkeleton } from './Skeleton'

export default function DailyForecast({ daily, loading }) {
  const { unit } = useUnit()

  if (loading) return <DailySkeleton />
  if (!daily?.length) return null

  const u       = unitLabel(unit)
  const allMin  = Math.min(...daily.map((d) => d.temp_min))
  const allMax  = Math.max(...daily.map((d) => d.temp_max))
  const range   = allMax - allMin || 1

  return (
    <div>
      <p className="text-[10px] text-neutral-700 uppercase tracking-widest mb-4">
        Pronóstico 5 días
      </p>
      <div className="divide-y divide-neutral-900">
        {daily.slice(0, 5).map((d, i) => {
          const Icon     = getWeatherIcon(d.icon, d.main)
          const isToday  = i === 0
          const barLeft  = ((d.temp_min - allMin) / range) * 100
          const barWidth = ((d.temp_max - d.temp_min) / range) * 100

          return (
            <div key={d.date} className="flex items-center gap-4 py-3.5">
              <p className={`text-xs w-12 flex-shrink-0 capitalize ${isToday ? 'text-white font-medium' : 'text-neutral-500'}`}>
                {isToday ? 'Hoy' : formatDayName(d.date)}
              </p>

              <Icon className="text-xl text-neutral-600 flex-shrink-0 w-6" />

              <p className="text-xs text-neutral-700 flex-1 truncate hidden sm:block capitalize">
                {d.description}
              </p>

              {/* Barra de rango de temperatura */}
              <div className="flex-1 relative h-px bg-neutral-900 mx-2 hidden md:block">
                <div
                  className="absolute top-0 h-full bg-neutral-600"
                  style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                />
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 tabular-nums">
                <p className="text-xs text-neutral-600 w-10 text-right">
                  {convertTemp(d.temp_min, unit)}{u}
                </p>
                <p className={`text-sm w-10 text-right ${isToday ? 'text-white' : 'text-neutral-400'}`}>
                  {convertTemp(d.temp_max, unit)}{u}
                </p>
                <p className="text-xs text-neutral-700 w-8 text-right">
                  {d.pop > 0 ? `${d.pop}%` : '—'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
