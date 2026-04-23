const WIND_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']

export const windDegToDir = (deg) =>
  deg == null ? '—' : WIND_DIRS[Math.round(deg / 45) % 8]

export const formatVisibility = (m) =>
  m == null ? '—' : m >= 1000 ? `${(m / 1000).toFixed(0)} km` : `${m} m`

export const formatUnixTime = (ts) =>
  ts ? new Date(ts * 1000).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—'

export const formatForecastTime = (ts) =>
  ts ? new Date(ts * 1000).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—'

export const formatDayName = (dateStr, short = true) =>
  dateStr
    ? new Date(dateStr + 'T12:00:00').toLocaleDateString('es-MX', { weekday: short ? 'short' : 'long' })
    : '—'

export const formatHistoryDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })

// Punto de rocío aproximado (Magnus formula simplificada)
export const computeDewPoint = (temp, humidity) =>
  temp != null && humidity != null
    ? Math.round(temp - (100 - humidity) / 5)
    : null

const AQI_LABELS = ['', 'Bueno', 'Aceptable', 'Moderado', 'Malo', 'Muy malo']
export const getAqiLabel = (aqi) => AQI_LABELS[aqi] ?? '—'

export const inferAlerts = (weather) => {
  if (!weather) return []
  const alerts = []
  const { wind_speed, wind_gust, temperature, visibility, hourly } = weather

  if (wind_gust != null && wind_gust >= 15) alerts.push(`Ráfagas intensas: ${Math.round(wind_gust)} m/s`)
  else if (wind_speed != null && wind_speed >= 10) alerts.push(`Viento fuerte: ${Math.round(wind_speed)} m/s`)

  if (temperature != null && temperature >= 38) alerts.push(`Calor extremo: ${Math.round(temperature)}°C`)
  if (temperature != null && temperature < 0) alerts.push(`Temperatura bajo cero: ${Math.round(temperature)}°C`)

  if (visibility != null && visibility < 1000) alerts.push(`Visibilidad reducida: ${visibility} m`)

  if (hourly?.length) {
    const maxPop = Math.max(...hourly.map(h => h.pop ?? 0))
    if (maxPop >= 70) alerts.push(`Alta probabilidad de lluvia: ${maxPop}%`)
  }

  return alerts
}
