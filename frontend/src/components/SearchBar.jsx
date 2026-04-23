import { useState, useRef, useEffect, useCallback } from 'react'
import { FiSearch, FiMapPin } from 'react-icons/fi'
import { geocodeCity } from '../services/weatherApi'
import LoadingSpinner from './LoadingSpinner'

const CITY_RE = /^[a-zA-ZÀ-ÿ\s\-]{2,}$/

export default function SearchBar({ onSearch, onGeolocate, loading }) {
  const [value, setValue]           = useState('')
  const [error, setError]           = useState('')
  const [locating, setLocating]     = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen]             = useState(false)
  const debounceRef                 = useRef(null)
  const wrapRef                     = useRef(null)

  const validate = (v) => {
    const t = v.trim()
    if (t.length < 2) return 'Mínimo 2 caracteres'
    if (!CITY_RE.test(t)) return 'Solo letras, espacios y guiones'
    return ''
  }

  const fetchSuggestions = useCallback((q) => {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await geocodeCity(q)
        setSuggestions(res.data ?? [])
        setOpen((res.data ?? []).length > 0)
      } catch { setSuggestions([]); setOpen(false) }
    }, 400)
  }, [])

  const handleChange = (e) => {
    const v = e.target.value
    setValue(v)
    if (error) setError('')
    fetchSuggestions(v)
  }

  const selectSuggestion = (s) => {
    const city = s.name
    setValue(city)
    setSuggestions([])
    setOpen(false)
    onSearch(city)
  }

  const submit = (e) => {
    e.preventDefault()
    const msg = validate(value)
    if (msg) { setError(msg); return }
    setError('')
    setSuggestions([])
    setOpen(false)
    onSearch(value.trim())
  }

  const handleLocate = () => {
    if (!navigator.geolocation) { setError('Tu navegador no soporta geolocalización'); return }
    setLocating(true); setError('')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocating(false); onGeolocate(coords.latitude, coords.longitude) },
      () => { setLocating(false); setError('No se pudo obtener tu ubicación') },
      { timeout: 10000 }
    )
  }

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const busy = loading || locating

  return (
    <div ref={wrapRef} className="relative">
      <form onSubmit={submit} noValidate>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Ciudad..."
            disabled={busy}
            aria-label="Ciudad"
            autoComplete="off"
            className="
              flex-1 bg-transparent text-white text-sm placeholder-neutral-700
              border-b border-neutral-800 focus:border-neutral-500
              pb-2 outline-none transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          />

          <button
            type="button"
            onClick={handleLocate}
            disabled={busy}
            aria-label="Usar mi ubicación"
            title="Usar mi ubicación"
            className="p-2 text-neutral-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            {locating ? <LoadingSpinner size="sm" /> : <FiMapPin className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={busy || !value.trim()}
            className="
              flex items-center gap-2 px-4 py-1.5 text-sm font-medium flex-shrink-0
              border border-neutral-700 text-neutral-300 rounded
              hover:border-white hover:text-white
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {loading ? <LoadingSpinner size="sm" /> : <FiSearch className="w-3.5 h-3.5" />}
            Buscar
          </button>
        </div>

        {error && <p className="mt-2 text-xs text-neutral-600">{error}</p>}
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-neutral-950 border border-neutral-800 rounded z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => selectSuggestion(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-900 transition-colors flex items-center gap-2"
              >
                <span>{s.name}</span>
                <span className="text-[10px] text-neutral-700 uppercase">
                  {s.state ? `${s.state}, ` : ''}{s.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
