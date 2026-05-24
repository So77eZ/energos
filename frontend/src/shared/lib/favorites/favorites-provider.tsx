'use client'

// Mock-state Context для избранных напитков. До выкатки бэка
// /api/users/me/favorites держим { [userId]: drinkId[] } в localStorage.
// Замена на реальное API — точечная (подменить add/remove на fetch).

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useToast } from '@shared/lib/toast'

type FavoritesMap = Record<number, number[]>

const STORAGE_KEY = 'energos_favorites_mock'

interface FavoritesContextValue {
  /** All favorited drink ids for the given user. */
  getFor: (userId: number) => number[]
  /** Toggle membership. Returns the new state (true = now in favorites). */
  toggle: (userId: number, drinkId: number, drinkName?: string) => boolean
  isFavorite: (userId: number, drinkId: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

function loadInitial(): FavoritesMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FavoritesMap) : {}
  } catch {
    return {}
  }
}

function persist(map: FavoritesMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {}
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<FavoritesMap>({})
  const { toast } = useToast()

  useEffect(() => { setMap(loadInitial()) }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    persist(map)
  }, [map])

  const getFor = useCallback(
    (userId: number): number[] => map[userId] ?? [],
    [map],
  )

  const isFavorite = useCallback(
    (userId: number, drinkId: number): boolean => (map[userId] ?? []).includes(drinkId),
    [map],
  )

  const toggle = useCallback(
    (userId: number, drinkId: number, drinkName?: string): boolean => {
      const current = map[userId] ?? []
      const inList = current.includes(drinkId)
      const next = inList ? current.filter((x) => x !== drinkId) : [...current, drinkId]
      setMap((prev) => ({ ...prev, [userId]: next }))
      const nowFav = !inList
      toast({
        kind: nowFav ? 'love' : 'info',
        msg: drinkName
          ? (nowFav ? `«${drinkName}» в избранном` : `«${drinkName}» убран из избранного`)
          : (nowFav ? 'Добавлено в избранное' : 'Убрано из избранного'),
      })
      return nowFav
    },
    [map, toast],
  )

  return (
    <FavoritesContext.Provider value={{ getFor, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
