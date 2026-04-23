import { useState, useRef, useLayoutEffect } from 'react'
import { getWeatherIcon } from '../utils/weatherIcons'
import { formatForecastTime, windDegToDir } from '../utils/weatherHelpers'
import { convertTemp, unitLabel } from '../utils/units'
import { useUnit } from '../context/UnitContext'
import { HourlySkeleton } from './Skeleton'

const CHART_H = 92
const BAR_H   = 24
const PAD_Y   = 20

// ── SVG de temperatura + precipitación ────────────────────────────────────────
function TempChart({ hourly, unit, activeIdx, colW }) {
  const u     = unitLabel(unit)
  const temps = hourly.map(h => convertTemp(h.temp, unit))
  const minT  = Math.min(...temps)
  const maxT  = Math.max(...temps)
  const range = maxT - minT || 1
  const W     = colW * hourly.length

  const cx = (i) => colW / 2 + i * colW
  const cy = (t) => CHART_H - PAD_Y - ((t - minT) / range) * (CHART_H - PAD_Y * 2)
  const pts = temps.map((t, i) => [cx(i), cy(t)])

  const curvePath = pts.reduce((d, [px, py], i) => {
    if (i === 0) return `M ${px} ${py}`
    const [prevX, prevY] = pts[i - 1]
    const mid = (prevX + px) / 2
    return `${d} C ${mid} ${prevY}, ${mid} ${py}, ${px} ${py}`
  }, '')

  const fillPath = `${curvePath} L ${pts[pts.length - 1][0]} ${CHART_H} L ${pts[0][0]} ${CHART_H} Z`

  return (
    <svg
      width={W}
      height={CHART_H + BAR_H}
      viewBox={`0 0 ${W} ${CHART_H + BAR_H}`}
      style={{ display: 'block', cursor: 'crosshair' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.09" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Líneas de referencia min/max */}
      <line x1="0" y1={cy(minT)} x2={W} y2={cy(minT)} stroke="rgb(35,35,35)" strokeWidth="1" strokeDasharray="3,4" />
      <line x1="0" y1={cy(maxT)} x2={W} y2={cy(maxT)} stroke="rgb(35,35,35)" strokeWidth="1" strokeDasharray="3,4" />
      <text x="4" y={cy(maxT) - 4}  fill="rgb(65,65,65)" fontSize="10" fontFamily="ui-monospace,monospace">{maxT}{u} máx</text>
      <text x="4" y={cy(minT) + 11} fill="rgb(65,65,65)" fontSize="10" fontFamily="ui-monospace,monospace">{minT}{u} mín</text>

      {/* Columna activa — fondo sutil */}
      {activeIdx != null && (
        <rect
          x={cx(activeIdx) - colW / 2} y={0}
          width={colW} height={CHART_H + BAR_H}
          fill="white" fillOpacity="0.03"
        />
      )}

      {/* Línea cursor vertical */}
      {activeIdx != null && (
        <line
          x1={cx(activeIdx)} y1={4}
          x2={cx(activeIdx)} y2={CHART_H - 2}
          stroke="rgb(90,90,90)" strokeWidth="1" strokeDasharray="2,3"
        />
      )}

      <path d={fillPath} fill="url(#tg)" />
      <path d={curvePath} fill="none" stroke="rgb(110,110,110)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Puntos + etiquetas de temperatura */}
      {pts.map(([px, py], i) => {
        const isActive = i === activeIdx
        const isFirst  = i === 0
        const isLast   = i === pts.length - 1
        const anchor   = isFirst ? 'start' : isLast ? 'end' : 'middle'
        const lx       = isFirst ? px + 2 : isLast ? px - 2 : px
        return (
          <g key={i}>
            <circle
              cx={px} cy={py}
              r={isActive ? 5 : 2.5}
              fill={isActive ? 'white' : isFirst ? 'rgb(180,180,180)' : 'rgb(100,100,100)'}
              style={{ transition: 'r 0.1s, fill 0.1s' }}
            />
            <text
              x={lx} y={py - 8}
              textAnchor={anchor}
              fill={isActive ? 'white' : isFirst ? 'rgb(200,200,200)' : 'rgb(120,120,120)'}
              fontSize="10"
              fontFamily="ui-monospace,monospace"
              fontWeight={isActive || isFirst ? '600' : '400'}
            >
              {temps[i]}{u}
            </text>
          </g>
        )
      })}

      {/* Barras de precipitación */}
      {hourly.map((h, i) => {
        const pop  = h.pop ?? 0
        const bH   = Math.max((pop / 100) * (BAR_H - 6), pop > 0 ? 3 : 0)
        const bX   = cx(i) - 7
        const bY   = CHART_H + (BAR_H - bH)
        const isActive = i === activeIdx
        return pop > 0 ? (
          <g key={`p${i}`}>
            <rect x={bX} y={bY} width={14} height={bH}
              fill={isActive ? 'rgb(140,140,140)' : 'rgb(55,55,55)'} rx="1.5" />
            <text x={cx(i)} y={CHART_H + BAR_H - 1}
              textAnchor="middle"
              fill={isActive ? 'rgb(160,160,160)' : 'rgb(75,75,75)'}
              fontSize="8" fontFamily="ui-monospace,monospace">
              {pop}%
            </text>
          </g>
        ) : null
      })}
    </svg>
  )
}

// ── Tarjeta tooltip ────────────────────────────────────────────────────────
function Tooltip({ entry, unit, isNow, xRatio }) {
  if (!entry) return null
  const u    = unitLabel(unit)
  const Icon = getWeatherIcon(entry.icon, entry.main)
  const side = xRatio > 0.55 ? { right: 8 } : { left: 8 }

  return (
    <div
      style={{ position: 'absolute', top: 6, pointerEvents: 'none', zIndex: 30, ...side }}
      className="w-48 bg-black border border-neutral-800 rounded shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-neutral-900">
        <div>
          <p className="text-[10px] text-neutral-600 uppercase tracking-widest">
            {isNow ? 'Ahora' : formatForecastTime(entry.dt)}
          </p>
          <p className="text-xs text-neutral-300 capitalize mt-0.5 leading-tight">{entry.description}</p>
        </div>
        <Icon className="text-2xl text-neutral-500 flex-shrink-0 ml-2" />
      </div>

      <div className="px-3 py-2.5 space-y-2">
        <TooltipRow label="Temperatura"      value={`${convertTemp(entry.temp, unit)}${u}`} highlight />
        <TooltipRow label="Sensación térmica" value={`${convertTemp(entry.feels_like, unit)}${u}`}
          sub={tempFeelDesc(convertTemp(entry.temp, unit), convertTemp(entry.feels_like, unit))} />
        <TooltipRow label="Humedad"          value={`${entry.humidity}%`}     sub={humidityDesc(entry.humidity)} />
        {(entry.pop ?? 0) > 0 && (
          <TooltipRow label="Prob. de lluvia" value={`${entry.pop}%`}         sub={popDesc(entry.pop)} />
        )}
        {entry.wind_speed != null && (
          <TooltipRow label="Viento"
            value={`${entry.wind_speed} m/s${entry.wind_deg != null ? ` ${windDegToDir(entry.wind_deg)}` : ''}`}
            sub={windDesc(entry.wind_speed)} />
        )}
        {entry.clouds != null && (
          <TooltipRow label="Nubosidad"      value={`${entry.clouds}%`}       sub={cloudsDesc(entry.clouds)} />
        )}
      </div>
    </div>
  )
}

function TooltipRow({ label, value, sub, highlight }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-neutral-700">{label}</span>
        <span className={`text-[11px] tabular-nums font-medium ${highlight ? 'text-white' : 'text-neutral-400'}`}>{value}</span>
      </div>
      {sub && <p className="text-[9px] text-neutral-700 mt-0.5 text-right">{sub}</p>}
    </div>
  )
}

const tempFeelDesc = (t, f) => {
  const diff = f - t
  if (Math.abs(diff) < 2) return 'Similar a la temperatura real'
  return diff > 0 ? `Se siente ${Math.abs(Math.round(diff))}° más caliente` : `Se siente ${Math.abs(Math.round(diff))}° más frío`
}
const humidityDesc = (h) => {
  if (h < 30) return 'Ambiente seco'
  if (h < 60) return 'Confortable'
  if (h < 80) return 'Ambiente húmedo'
  return 'Muy húmedo'
}
const popDesc = (p) => {
  if (p < 20) return 'Poco probable'
  if (p < 50) return 'Posibilidad leve'
  if (p < 75) return 'Bastante probable'
  return 'Muy probable'
}
const windDesc = (s) => {
  if (s < 1)  return 'Calma'
  if (s < 6)  return 'Brisa suave'
  if (s < 11) return 'Brisa moderada'
  if (s < 17) return 'Viento fresco'
  if (s < 25) return 'Viento fuerte'
  return 'Viento muy fuerte'
}
const cloudsDesc = (c) => {
  if (c < 10) return 'Despejado'
  if (c < 30) return 'Poco nublado'
  if (c < 70) return 'Parcialmente nublado'
  if (c < 90) return 'Muy nublado'
  return 'Cielo cubierto'
}

// ── Componente principal ───────────────────────────────────────────────────
export default function HourlyForecast({ hourly, loading }) {
  const { unit }                  = useUnit()
  const [activeIdx, setActiveIdx] = useState(null)
  const containerRef              = useRef(null)
  const svgWrapRef                = useRef(null)
  const [colW, setColW]           = useState(80)

  useLayoutEffect(() => {
    if (!containerRef.current || !hourly?.length) return
    const update = () => {
      const w = containerRef.current.offsetWidth
      if (w > 0) setColW(w / hourly.length)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [hourly?.length])

  if (loading) return <HourlySkeleton />
  if (!hourly?.length) return null

  const handleMouseMove = (e) => {
    const rect = svgWrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const relX = e.clientX - rect.left
    const idx  = Math.min(Math.max(0, Math.round((relX - colW / 2) / colW)), hourly.length - 1)
    setActiveIdx(idx)
  }

  const xRatio = activeIdx != null ? (activeIdx + 0.5) / hourly.length : 0

  return (
    <div ref={containerRef}>
      <p className="text-[10px] text-neutral-700 uppercase tracking-widest mb-3">Próximas 24 horas</p>

      <div
        ref={svgWrapRef}
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActiveIdx(null)}
      >
        <TempChart hourly={hourly} unit={unit} activeIdx={activeIdx} colW={colW} />

        {activeIdx != null && (
          <Tooltip entry={hourly[activeIdx]} unit={unit} isNow={activeIdx === 0} xRatio={xRatio} />
        )}
      </div>

      {/* Columnas: hora + icono + viento */}
      <div className="flex border-t border-neutral-900">
        {hourly.map((h, i) => {
          const Icon     = getWeatherIcon(h.icon, h.main)
          const isNow    = i === 0
          const isActive = i === activeIdx
          return (
            <div
              key={h.dt}
              style={{ width: colW, flexShrink: 0 }}
              className={`
                flex flex-col items-center gap-2 py-3 transition-colors
                ${i > 0 ? 'border-l border-neutral-900' : ''}
                ${isActive ? 'bg-white/[0.02]' : ''}
              `}
            >
              <p className={`text-[10px] tabular-nums ${isNow ? 'text-white font-medium' : isActive ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {isNow ? 'Ahora' : formatForecastTime(h.dt)}
              </p>
              <Icon className={`text-lg transition-colors ${isActive ? 'text-neutral-300' : isNow ? 'text-neutral-400' : 'text-neutral-700'}`} />
              <p className={`text-[10px] tabular-nums ${isActive ? 'text-neutral-500' : 'text-neutral-800'}`}>
                {h.wind_speed != null ? `${h.wind_speed} m/s` : '—'}
              </p>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-5 mt-3 flex-wrap">
        <LegendItem
          icon={<svg width="18" height="8" aria-hidden="true"><path d="M0 4 Q4.5 0 9 4 Q13.5 8 18 4" fill="none" stroke="rgb(110,110,110)" strokeWidth="1.5"/></svg>}
          label="Temperatura"
        />
        <LegendItem icon={<span className="inline-block w-2.5 h-3.5 bg-neutral-700 rounded-sm" />} label="Prob. lluvia" />
        <LegendItem icon={<span className="text-[10px] text-neutral-600">↑</span>} label="Viento (m/s)" />
      </div>
    </div>
  )
}

function LegendItem({ icon, label }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-neutral-700">
      {icon}{label}
    </span>
  )
}
