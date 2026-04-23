import { useState, useEffect, useCallback } from 'react'
import SearchBar      from './components/SearchBar'
import WeatherCard    from './components/WeatherCard'
import ExtraStats     from './components/ExtraStats'
import AirQuality     from './components/AirQuality'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast  from './components/DailyForecast'
import HistoryList    from './components/HistoryList'
import FavoriteCities from './components/FavoriteCities'
import WeatherAlerts  from './components/WeatherAlerts'
import HistoryStats   from './components/HistoryStats'
import WeatherMap     from './components/WeatherMap'
import { useUnit }    from './context/UnitContext'
import { useFavorites } from './hooks/useFavorites'
import { inferAlerts } from './utils/weatherHelpers'
import {
  getWeather, getWeatherByCoords,
  getHistory, deleteHistoryEntry, clearHistory,
} from './services/weatherApi'

const SECTION = 'py-8 border-b border-neutral-900'
const WRAP    = 'max-w-4xl mx-auto px-5 sm:px-8'

function readCityFromUrl() {
  return new URLSearchParams(window.location.search).get('city') || null
}

export default function App() {
  const { unit, toggleUnit } = useUnit()
  const { favorites, toggleFavorite, removeFavorite, isFavorite } = useFavorites()

  const [weather, setWeather]               = useState(null)
  const [history, setHistory]               = useState([])
  const [historyMeta, setHistoryMeta]       = useState(null)
  const [currentPage, setCurrentPage]       = useState(1)
  const [statsKey, setStatsKey]             = useState(0)
  const [loading, setLoading]               = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError]                   = useState(null)

  const fetchHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true)
    try {
      const res = await getHistory(page)
      setHistory(res.data.data ?? [])
      setHistoryMeta(res.data.meta ?? null)
      setCurrentPage(page)
    } catch { /* silencioso */ }
    finally { setHistoryLoading(false) }
  }, [])

  useEffect(() => { fetchHistory(1) }, [fetchHistory])

  const applyWeather = (data) => {
    setWeather(data)
    fetchHistory(1)
    setStatsKey(k => k + 1)
  }

  const handleSearch = useCallback(async (city) => {
    setLoading(true); setError(null)
    try {
      const data = (await getWeather(city)).data
      applyWeather(data)
      window.history.pushState(null, '', `?city=${encodeURIComponent(city)}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Ciudad no encontrada.')
      setWeather(null)
      window.history.pushState(null, '', window.location.pathname)
    }
    finally { setLoading(false) }
  }, [])

  const handleGeolocate = async (lat, lon) => {
    setLoading(true); setError(null)
    try {
      const data = (await getWeatherByCoords(lat, lon)).data
      applyWeather(data)
      window.history.pushState(null, '', `?city=${encodeURIComponent(data.city)}`)
    } catch {
      setError('No se pudo obtener el clima para tu ubicación.')
      setWeather(null)
    }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteHistoryEntry(id)
      fetchHistory(history.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage)
      setStatsKey(k => k + 1)
    } catch { /* silencioso */ }
  }

  const handleClear = async () => {
    try {
      await clearHistory()
      setHistory([]); setHistoryMeta(null); setCurrentPage(1)
      setStatsKey(k => k + 1)
    } catch { /* silencioso */ }
  }

  useEffect(() => {
    const city = readCityFromUrl()
    if (city) handleSearch(city)
  }, [])

  const hasWeather = !!weather && !loading
  const alerts     = hasWeather ? inferAlerts(weather) : []

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Header ── */}
      <header className="border-b border-neutral-900 sticky top-0 bg-black z-10">
        <div className={`${WRAP} py-5 flex items-center justify-between`}>
          <h1 className="text-sm font-medium text-white tracking-tight">Weather Dashboard</h1>
          <button
            onClick={toggleUnit}
            className="text-xs text-neutral-600 hover:text-white border border-neutral-800 hover:border-neutral-600 px-3 py-1 rounded transition-colors tabular-nums"
            title={`Cambiar a °${unit === 'C' ? 'F' : 'C'}`}
          >
            °{unit} → °{unit === 'C' ? 'F' : 'C'}
          </button>
        </div>
      </header>

      {/* ── Búsqueda ── */}
      <section className={SECTION}>
        <div className={WRAP}>
          <FavoriteCities
            favorites={favorites}
            onSelect={handleSearch}
            onRemove={removeFavorite}
          />
          <SearchBar onSearch={handleSearch} onGeolocate={handleGeolocate} loading={loading} />
          {error && <p className="mt-3 text-xs text-neutral-600">{error}</p>}
        </div>
      </section>

      {/* ── Clima actual + Detalles ── */}
      <section className={SECTION}>
        <div className={`${WRAP} grid grid-cols-1 lg:grid-cols-2 gap-12`}>
          <WeatherCard
            weather={weather}
            loading={loading}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
          <ExtraStats weather={hasWeather ? weather : null} loading={loading} />
        </div>

        {/* Alertas inferidas */}
        {hasWeather && alerts.length > 0 && (
          <div className={`${WRAP} mt-0`}>
            <WeatherAlerts alerts={alerts} />
          </div>
        )}
      </section>

      {/* ── Calidad del aire ── */}
      {(loading || (hasWeather && weather.aqi != null)) && (
        <section className={SECTION}>
          <div className={WRAP}>
            <AirQuality aqi={weather?.aqi} components={weather?.aqi_components} />
          </div>
        </section>
      )}

      {/* ── Pronóstico horario ── */}
      {(loading || hasWeather) && (
        <section className={SECTION}>
          <div className={WRAP}>
            <HourlyForecast hourly={weather?.hourly} loading={loading} />
          </div>
        </section>
      )}

      {/* ── Pronóstico diario ── */}
      {(loading || hasWeather) && (
        <section className={SECTION}>
          <div className={WRAP}>
            <DailyForecast daily={weather?.daily} loading={loading} />
          </div>
        </section>
      )}

      {/* ── Mapa ── */}
      {hasWeather && weather.lat != null && (
        <section className={SECTION}>
          <div className={WRAP}>
            <WeatherMap lat={weather.lat} lon={weather.lon} city={weather.city} />
          </div>
        </section>
      )}

      {/* ── Estadísticas del historial ── */}
      <section className={SECTION}>
        <div className={WRAP}>
          <HistoryStats refreshKey={statsKey} />
        </div>
      </section>

      {/* ── Historial ── */}
      <section className="py-8">
        <div className={WRAP}>
          <HistoryList
            history={history}
            meta={historyMeta}
            loading={historyLoading}
            currentPage={currentPage}
            onPageChange={fetchHistory}
            onDelete={handleDelete}
            onClear={handleClear}
            onSelectCity={handleSearch}
          />
        </div>
      </section>

    </div>
  )
}
