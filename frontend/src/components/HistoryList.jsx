import { FiTrash2, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { getWeatherIcon } from '../utils/weatherIcons'
import { getAqiLabel, formatHistoryDate } from '../utils/weatherHelpers'
import { convertTemp, unitLabel } from '../utils/units'
import { useUnit } from '../context/UnitContext'
import LoadingSpinner from './LoadingSpinner'

export default function HistoryList({
  history, meta, loading, currentPage,
  onPageChange, onDelete, onClear, onSelectCity,
}) {
  const { unit } = useUnit()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-neutral-700 uppercase tracking-widest">Historial</p>
          {meta?.total > 0 && (
            <p className="text-[10px] text-neutral-800">{meta.total} entradas</p>
          )}
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-[11px] text-neutral-700 hover:text-neutral-400 transition-colors"
          >
            <FiTrash2 className="w-3 h-3" />
            Limpiar todo
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><LoadingSpinner /></div>
      ) : history.length === 0 ? (
        <p className="text-sm text-neutral-800 py-8 text-center">Sin búsquedas previas</p>
      ) : (
        <div className="divide-y divide-neutral-900">
          {history.map((entry) => {
            const Icon = getWeatherIcon(entry.icon, entry.main)
            return (
              <div key={entry.id} className="flex items-center gap-4 py-3 group">
                <Icon className="text-xl text-neutral-700 flex-shrink-0" />

                <button
                  onClick={() => onSelectCity(entry.city)}
                  className="flex-1 min-w-0 text-left hover:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-neutral-300 truncate">{entry.city}</p>
                    {entry.country && (
                      <span className="text-[10px] text-neutral-700 uppercase flex-shrink-0">
                        {entry.country}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-700 mt-0.5">{formatHistoryDate(entry.created_at)}</p>
                </button>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {entry.aqi != null && (
                    <p className="text-[10px] text-neutral-700 hidden sm:block">
                      AQI&nbsp;{entry.aqi}&nbsp;·&nbsp;{getAqiLabel(entry.aqi)}
                    </p>
                  )}
                  <p className="text-sm text-neutral-500 tabular-nums w-12 text-right">
                    {convertTemp(entry.temperature, unit)}{unitLabel(unit)}
                  </p>
                </div>

                <button
                  onClick={() => onDelete(entry.id)}
                  aria-label={`Eliminar ${entry.city}`}
                  className="p-1 text-neutral-800 hover:text-neutral-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-900">
          <p className="text-[11px] text-neutral-700">{currentPage} / {meta.last_page}</p>
          <div className="flex gap-1">
            <PageBtn onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} icon={<FiChevronLeft />} label="Anterior" />
            <PageBtn onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === meta.last_page} icon={<FiChevronRight />} label="Siguiente" />
          </div>
        </div>
      )}
    </div>
  )
}

function PageBtn({ onClick, disabled, icon, label }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label}
      className="p-1.5 text-neutral-700 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
    >
      {icon}
    </button>
  )
}
