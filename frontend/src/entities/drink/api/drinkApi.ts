import { httpRequest } from '@shared/api/http'
import type { Drink, DrinkCreate, DrinkUpdate } from '../model/types'

const BASE = '/api/energy-drinks'
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` })

export const drinkApi = {
  list: () =>
    httpRequest<Drink[]>(`${BASE}/`),

  get: (id: number) =>
    httpRequest<Drink>(`${BASE}/${id}/`),

  create: (body: DrinkCreate, token: string) =>
    httpRequest<Drink>(`${BASE}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...bearer(token) },
      body: JSON.stringify(body),
    }),

  update: (id: number, body: DrinkUpdate, token: string) =>
    httpRequest<Drink>(`${BASE}/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...bearer(token) },
      body: JSON.stringify(body),
    }),

  remove: (id: number, token: string) =>
    httpRequest<Drink>(`${BASE}/${id}/`, {
      method: 'DELETE',
      headers: bearer(token),
    }),

  uploadImage: (id: number, file: File, token: string) => {
    const form = new FormData()
    form.append('file', file)
    return httpRequest<Drink>(`${BASE}/${id}/upload-image/`, {
      method: 'POST',
      headers: bearer(token),
      body: form,
    })
  },
}
