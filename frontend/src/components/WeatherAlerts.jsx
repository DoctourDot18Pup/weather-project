import { FiAlertTriangle } from 'react-icons/fi'

export default function WeatherAlerts({ alerts }) {
  if (!alerts?.length) return null

  return (
    <div className="mt-6 space-y-2">
      {alerts.map((msg, i) => (
        <div key={i} className="flex items-start gap-2.5 border-l-2 border-neutral-500 pl-3 py-0.5">
          <FiAlertTriangle className="w-3 h-3 text-neutral-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-400">{msg}</p>
        </div>
      ))}
    </div>
  )
}
