import { httpRequest, bearerHeaders } from '@shared/api/http'
import type { Review, ReviewCreate, ReviewUpdate } from '../model/types'

const BASE = '/api/reviews'

export const reviewApi = {
  list: () =>
    httpRequest<Review[]>(`${BASE}/`, { next: { revalidate: 60, tags: ['reviews'] } }),

  byDrink: (drinkId: number) =>
    httpRequest<Review[]>(`${BASE}/energy-drink/${drinkId}/`, { next: { revalidate: 60, tags: ['reviews'] } }),

  create: (body: ReviewCreate, token: string, extraHeaders?: Record<string, string>) =>
    httpRequest<Review>(`${BASE}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...bearerHeaders(token), ...extraHeaders },
      body: JSON.stringify(body),
    }),

  update: (id: number, body: ReviewUpdate, token: string) =>
    httpRequest<Review>(`${BASE}/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...bearerHeaders(token) },
      body: JSON.stringify(body),
    }),

  remove: (id: number, token: string) =>
    httpRequest<Review>(`${BASE}/${id}/`, {
      method: 'DELETE',
      headers: bearerHeaders(token),
    }),

  myReviews: (token: string) =>
    httpRequest<Review[]>(`${BASE}/user/`, {
      headers: bearerHeaders(token),
    }),
}
