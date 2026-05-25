import { httpRequest, bearerHeaders } from '@shared/api/http'

// Бэк: backend/src/api/auth.py
//   GET    /api/auth/me/favorites/             → response_model=list[int] (массив drink_id)
//   POST   /api/auth/me/favorites/{drink_id}/  → 201 { message }
//   DELETE /api/auth/me/favorites/{drink_id}/  → 204 (no body)
//
// Примечание: GET у бэка декларирует list[int], но физически вернёт массив
// EnergyDrink (SQLAlchemy объекты) — Pydantic должен сериализовать через .id.
// Если получим что-то иное (объекты целиком), нормализуем здесь.

async function requestNoBody(method: 'PUT' | 'DELETE', path: string, headers: Record<string, string>): Promise<void> {
  const baseUrl = typeof window === 'undefined' ? (process.env.API_ORIGIN ?? 'http://localhost') : ''
  const reqHeaders = {
    ...headers,
    ...(typeof window === 'undefined' ? { 'Origin': process.env.NEXT_PUBLIC_ORIGIN ?? 'http://localhost:3000' } : {}),
  }
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: reqHeaders,
    credentials: 'include',
  })
  if (!res.ok && res.status !== 404 && res.status !== 204) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || res.statusText)
  }
}

export const favoritesApi = {
  /** Возвращает массив drink_id из избранного текущего юзера. Требует auth. */
  list: async (token: string): Promise<number[]> => {
    const raw = await httpRequest<unknown>('/api/auth/me/favorites/', {
      headers: bearerHeaders(token),
    })
    if (!Array.isArray(raw)) return []
    return raw
      .map((item): number | null => {
        if (typeof item === 'number') return item
        if (item && typeof item === 'object' && 'id' in item && typeof (item as { id: unknown }).id === 'number') {
          return (item as { id: number }).id
        }
        return null
      })
      .filter((x): x is number => x != null)
  },

  /** 204 если успешно. Идемпотентно. */
  add: (drinkId: number, token: string): Promise<void> =>
    requestNoBody('PUT', `/api/auth/me/favorites/${drinkId}/`, bearerHeaders(token)),

  /** 204 если удалено, 404 если не было. */
  remove: (drinkId: number, token: string): Promise<void> =>
    requestNoBody('DELETE', `/api/auth/me/favorites/${drinkId}/`, bearerHeaders(token)),
}
