import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export const getWeather = (city) =>
  api.get(`/weather/${encodeURIComponent(city)}`)

export const getWeatherByCoords = (lat, lon) =>
  api.get('/weather/by-coords', { params: { lat, lon } })

export const getHistory = (page = 1) =>
  api.get('/weather-history', { params: { page } })

export const getHistoryEntry = (id) =>
  api.get(`/weather-history/${id}`)

export const deleteHistoryEntry = (id) =>
  api.delete(`/weather-history/${id}`)

export const clearHistory = () =>
  api.delete('/weather-history')

export const geocodeCity = (q) =>
  api.get('/geocode', { params: { q } })

export const getWeatherStats = () =>
  api.get('/weather-stats')
