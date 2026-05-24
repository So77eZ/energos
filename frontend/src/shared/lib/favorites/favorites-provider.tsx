'use client'

// Real-API провайдер избранных напитков. Состояние инициализируется initial-массивом
// из layout (server-side fetch с токеном). Toggle идёт через server action, который
// сам читает token из httpOnly-куки. Оптимистичный update + revert при ошибке.

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { useToast } from '@shared/lib/toast'
import { toggleFavoriteAction } from './actions'

interface FavoritesContextValue {
  /** Массив drink_id текущего юзера. Гость → пустой. */
  favorites: number[]
  isFavorite: (drinkId: number) => boolean
  /** Переключает избранное на бэке. Возвращает новое состояние (true = добавлено).
   *  Если гость — выдаёт info-toast и возвращает текущее состояние. */
  toggle: (drinkId: number, drinkName?: string) => Promise<boolean>
  /** true пока идёт хоть один in-flight toggle (для loading-стейтов). */
  isPending: boolean
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

interface FavoritesProviderProps {
  children: ReactNode
  initial?: number[]
  /** id текущего юзера. null → гость (toggle покажет toast вместо вызова). */
  userId?: number | null
}

export function FavoritesProvider({ children, initial = [], userId = null }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<number[]>(initial)
  const [pendingCount, setPendingCount] = useState(0)
  const { toast } = useToast()

  const isFavorite = useCallback(
    (drinkId: number): boolean => favorites.includes(drinkId),
    [favorites],
  )

  const toggle = useCallback(
    async (drinkId: number, drinkName?: string): Promise<boolean> => {
      if (userId == null) {
        toast({ kind: 'info', msg: 'Войди, чтобы добавить в избранное' })
        return false
      }

      const currentlyFav = favorites.includes(drinkId)
      // Оптимистично переключаем — UI отзывается мгновенно.
      setFavorites((prev) =>
        currentlyFav ? prev.filter((x) => x !== drinkId) : [...prev, drinkId],
      )
      setPendingCount((n) => n + 1)

      const result = await toggleFavoriteAction(drinkId, currentlyFav)
      setPendingCount((n) => n - 1)

      if (!result.ok) {
        // Откат — возвращаем предыдущее состояние.
        setFavorites((prev) =>
          currentlyFav ? [...prev, drinkId] : prev.filter((x) => x !== drinkId),
        )
        toast({ kind: 'err', msg: result.error || 'Не удалось обновить избранное' })
        return currentlyFav
      }

      const nowFav = result.nowFav
      toast({
        kind: nowFav ? 'love' : 'info',
        msg: drinkName
          ? (nowFav ? `«${drinkName}» в избранном` : `«${drinkName}» убран из избранного`)
          : (nowFav ? 'Добавлено в избранное' : 'Убрано из избранного'),
      })
      return nowFav
    },
    [favorites, userId, toast],
  )

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggle, isPending: pendingCount > 0 }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
