import {
  WiDaySunny,
  WiNightClear,
  WiCloud,
  WiCloudy,
  WiDayCloudy,
  WiNightAltCloudy,
  WiRain,
  WiNightRain,
  WiSnow,
  WiThunderstorm,
  WiSprinkle,
  WiFog,
} from 'react-icons/wi'

export function getWeatherIcon(iconCode, main) {
  const isNight = iconCode?.endsWith('n')

  if (iconCode === '01d') return WiDaySunny
  if (iconCode === '01n') return WiNightClear
  if (iconCode?.startsWith('02')) return isNight ? WiNightAltCloudy : WiDayCloudy
  if (iconCode?.startsWith('03')) return WiCloud
  if (iconCode?.startsWith('04')) return WiCloudy
  if (iconCode?.startsWith('09')) return WiSprinkle
  if (iconCode?.startsWith('10')) return isNight ? WiNightRain : WiRain
  if (iconCode?.startsWith('11')) return WiThunderstorm
  if (iconCode?.startsWith('13')) return WiSnow
  if (iconCode?.startsWith('50')) return WiFog

  switch (main?.toLowerCase()) {
    case 'clear':        return isNight ? WiNightClear : WiDaySunny
    case 'clouds':       return WiCloud
    case 'rain':         return WiRain
    case 'drizzle':      return WiSprinkle
    case 'snow':         return WiSnow
    case 'thunderstorm': return WiThunderstorm
    default:             return WiFog
  }
}
