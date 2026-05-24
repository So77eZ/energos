import { httpRequest, bearerHeaders } from '@shared/api/http'

// Бэк: backend/src/api/auth.py
//   GET    /api/auth/me/favorites/             → response_model=list[int] (массив drink_id)
//   POST   /api/auth/me/favorites/{drink_id}/  → 201 { message }
//   DELETE /api/auth/me/favorites/{drink_id}/  → 204 (no body)
//
// Примечание: GET у бэка декларирует list[int], но физически вернёт массив
// EnergyDrink (SQLAlchemy объекты) — Pydantic должен сериализовать через .id.
// Если получим что-то иное (объекты целиком), нормализуем здесь.

async function deleteNoBody(path: string, headers: Record<string, string>): Promise<void> {
  // httpRequest всегда дёргает res.json(), а DELETE возвращает 204 без тела —
  // используем нативный fetch без парсинга.
  const baseUrl = typeof window === 'undefined' ? (process.env.API_ORIGIN ?? 'http://localhost') : ''
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  })
  if (!res.ok && res.status !== 404) {
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

  /** 201 если успешно, 400 если уже в избранном. */
  add: (drinkId: number, token: string): Promise<{ message: string }> =>
    httpRequest<{ message: string }>(`/api/auth/me/favorites/${drinkId}/`, {
      method: 'POST',
      headers: bearerHeaders(token),
    }),

  /** 204 если удалено, 404 если не было. */
  remove: (drinkId: number, token: string): Promise<void> =>
    deleteNoBody(`/api/auth/me/favorites/${drinkId}/`, bearerHeaders(token)),
}
