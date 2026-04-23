import { FiStar, FiX } from 'react-icons/fi'

export default function FavoriteCities({ favorites, onSelect, onRemove }) {
  if (!favorites.length) return null

  return (
    <div className="mb-5">
      <p className="text-[10px] text-neutral-700 uppercase tracking-widest mb-2">Favoritos</p>
      <div className="flex flex-wrap gap-2">
        {favorites.map(city => (
          <div key={city} className="flex items-center gap-1 group">
            <button
              onClick={() => onSelect(city)}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white border border-neutral-800 hover:border-neutral-600 px-2.5 py-1 rounded transition-colors"
            >
              <FiStar className="w-2.5 h-2.5" />
              {city}
            </button>
            <button
              onClick={() => onRemove(city)}
              aria-label={`Quitar ${city} de favoritos`}
              className="text-neutral-800 hover:text-neutral-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <FiX className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
