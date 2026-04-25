import { httpRequest } from '@shared/api/http'
import type { Review, ReviewCreate } from '../model/types'

const BASE = '/api/reviews'
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` })

export const reviewApi = {
  list: () =>
    httpRequest<Review[]>(`${BASE}/`),

  byDrink: (drinkId: number) =>
    httpRequest<Review[]>(`${BASE}/energy-drink/${drinkId}/`),

  create: (body: ReviewCreate, token: string) =>
    httpRequest<Review>(`${BASE}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...bearer(token) },
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Partial<ReviewCreate>, token: string) =>
    httpRequest<Review>(`${BASE}/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...bearer(token) },
      body: JSON.stringify(body),
    }),

  remove: (id: number, token: string) =>
    httpRequest<Review>(`${BASE}/${id}/`, {
      method: 'DELETE',
      headers: bearer(token),
    }),

  myReviews: (token: string) =>
    httpRequest<Review[]>(`${BASE}/user/`, {
      headers: bearer(token),
    }),
}
