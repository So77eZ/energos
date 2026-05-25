import { httpRequest, bearerHeaders } from '@shared/api/http'
import type { ReviewEmoji } from '../model/emoji-types'

const BASE = '/api/reviews'

async function deleteNoBody(path: string, headers: Record<string, string>): Promise<void> {
  const baseUrl = typeof window === 'undefined' ? (process.env.API_ORIGIN ?? 'http://localhost') : ''
  const reqHeaders = {
    ...headers,
    ...(typeof window === 'undefined' ? { 'Origin': process.env.NEXT_PUBLIC_ORIGIN ?? 'http://localhost:3000' } : {}),
  }
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    headers: reqHeaders,
    credentials: 'include',
  })
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || res.statusText)
  }
}

export const reviewEmojiApi = {
  /** Публичный — список всех реакций на отзыв. */
  list: (reviewId: number): Promise<ReviewEmoji[]> =>
    httpRequest<ReviewEmoji[]>(`${BASE}/${reviewId}/emojis/`),

  /** Добавить реакцию (auth). emoji передаётся query-параметром. */
  add: (reviewId: number, emoji: string, token: string): Promise<ReviewEmoji> =>
    httpRequest<ReviewEmoji>(
      `${BASE}/${reviewId}/emojis/?emoji=${encodeURIComponent(emoji)}`,
      { method: 'POST', headers: bearerHeaders(token) },
    ),

  /** Убрать свою реакцию (auth). 204 если успешно, 404 если её не было. */
  remove: (reviewId: number, emoji: string, token: string): Promise<void> =>
    deleteNoBody(
      `${BASE}/${reviewId}/emojis/?emoji=${encodeURIComponent(emoji)}`,
      bearerHeaders(token),
    ),
}
