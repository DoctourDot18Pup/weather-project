import { FiStar } from 'react-icons/fi'
import { getWeatherIcon } from '../utils/weatherIcons'
import { formatUnixTime } from '../utils/weatherHelpers'
import { convertTemp, unitLabel } from '../utils/units'
import { useUnit } from '../context/UnitContext'
import { WeatherSkeleton } from './Skeleton'

export default function WeatherCard({ weather, loading, isFavorite, onToggleFavorite }) {
  const { unit } = useUnit()

  if (loading) return <WeatherSkeleton />

  if (!weather) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-neutral-700">Busca una ciudad para comenzar</p>
      </div>
    )
  }

  const Icon = getWeatherIcon(weather.icon, weather.main)
  const u    = unitLabel(unit)
  const fav  = isFavorite?.(weather.city)

  return (
    <div>
      {/* Ciudad */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-semibold text-white tracking-tight">{weather.city}</h2>
            <button
              onClick={() => onToggleFavorite?.(weather.city)}
              aria-label={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              className="text-neutral-700 hover:text-white transition-colors flex-shrink-0 mt-1"
            >
              <FiStar className={`w-4 h-4 ${fav ? 'fill-white text-white' : ''}`} />
            </button>
          </div>
          {weather.country && (
            <p className="text-xs text-neutral-700 mt-1 uppercase tracking-widest">
              {weather.country} · {weather.main}
            </p>
          )}
        </div>
        <span className="text-xs text-neutral-600 capitalize mt-1 ml-4 flex-shrink-0 max-w-[120px] text-right leading-relaxed">
          {weather.description}
        </span>
      </div>

      {/* Temperatura */}
      <div className="flex items-end justify-between mb-2">
        <p className="text-[6rem] sm:text-[8rem] font-thin text-white leading-none tracking-tighter">
          {convertTemp(weather.temperature, unit)}{u}
        </p>
        <Icon className="text-6xl sm:text-7xl text-neutral-600 flex-shrink-0 mb-2" />
      </div>

      {/* Sensación + rango */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-8">
        {weather.feels_like != null && (
          <p className="text-sm text-neutral-500">
            Sensación&nbsp;
            <span className="text-neutral-300">{convertTemp(weather.feels_like, unit)}{u}</span>
          </p>
        )}
        {weather.temp_min != null && (
          <p className="text-sm text-neutral-600">
            ↓&nbsp;{convertTemp(weather.temp_min, unit)}{u}
            &nbsp;·&nbsp;
            ↑&nbsp;{convertTemp(weather.temp_max, unit)}{u}
          </p>
        )}
        {weather.rain_1h != null && (
          <p className="text-sm text-neutral-500">
            Lluvia&nbsp;<span className="text-neutral-300">{weather.rain_1h}&nbsp;mm/h</span>
          </p>
        )}
        {weather.snow_1h != null && (
          <p className="text-sm text-neutral-500">
            Nieve&nbsp;<span className="text-neutral-300">{weather.snow_1h}&nbsp;mm/h</span>
          </p>
        )}
      </div>

      {/* Fila inferior */}
      <div className="grid grid-cols-3 border-t border-neutral-900 pt-5">
        <BottomStat label="Humedad"   value={`${weather.humidity}%`} />
        <BottomStat label="Amanecer"  value={formatUnixTime(weather.sunrise)} center />
        <BottomStat label="Atardecer" value={formatUnixTime(weather.sunset)}  right  />
      </div>
    </div>
  )
}

function BottomStat({ label, value, center, right }) {
  const align = right ? 'text-right' : center ? 'text-center' : 'text-left'
  return (
    <div className={align}>
      <p className="text-[10px] text-neutral-700 uppercase tracking-widest">{label}</p>
      <p className="text-sm text-neutral-400 mt-1">{value}</p>
    </div>
  )
}
