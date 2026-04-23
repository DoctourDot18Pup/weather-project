import { useState, useCallback } from 'react'

const KEY     = 'wdash_favorites'
const MAX_FAV = 8

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? [] }
  catch { return [] }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load)

  const save = (next) => {
    setFavorites(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  const addFavorite = useCallback((city) => {
    setFavorites(prev => {
      if (prev.includes(city) || prev.length >= MAX_FAV) return prev
      const next = [city, ...prev]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeFavorite = useCallback((city) => {
    setFavorites(prev => {
      const next = prev.filter(c => c !== city)
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const toggleFavorite = useCallback((city) => {
    setFavorites(prev => {
      const next = prev.includes(city)
        ? prev.filter(c => c !== city)
        : prev.length >= MAX_FAV ? prev : [city, ...prev]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback((city) => favorites.includes(city), [favorites])

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }
}
