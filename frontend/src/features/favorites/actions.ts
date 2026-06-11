'use server'

import { favoritesApi } from '@entities/user'
import { getToken } from '@shared/lib/session'

export type ToggleFavoriteResult =
  | { ok: true; nowFav: boolean }
  | { ok: false; error: string }

/**
 * Server action — переключает избранное на бэке.
 * Токен берётся серверно из httpOnly-куки; клиент его не видит.
 *
 * @param drinkId  id напитка
 * @param currentlyFav  текущее состояние (true = снять, false = добавить)
 */
export async function toggleFavoriteAction(
  drinkId: number,
  currentlyFav: boolean,
): Promise<ToggleFavoriteResult> {
  const token = await getToken()
  if (!token) return { ok: false, error: 'Не авторизован' }

  try {
    if (currentlyFav) {
      await favoritesApi.remove(drinkId, token)
      return { ok: true, nowFav: false }
    } else {
      await favoritesApi.add(drinkId, token)
      return { ok: true, nowFav: true }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Ошибка сервера'
    return { ok: false, error: msg }
  }
}
