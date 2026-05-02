import { httpRequest, bearerHeaders } from '@shared/api/http'
import type { Review, ReviewCreate } from '../model/types'

const BASE = '/api/reviews'

export const reviewApi = {
  list: () =>
    httpRequest<Review[]>(`${BASE}/`),

  byDrink: (drinkId: number) =>
    httpRequest<Review[]>(`${BASE}/energy-drink/${drinkId}/`),

  create: (body: ReviewCreate, token: string) =>
    httpRequest<Review>(`${BASE}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...bearerHeaders(token) },
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Partial<ReviewCreate> & { energy_drink_id?: number; user_id?: number }, token: string) =>
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
