import { httpRequest } from './http'

// Списки отзывов бэк отдаёт страницами (limit/offset, по умолчанию limit=20, верхней границы нет).
// Напитки — целиком одним запросом (drinkApi.list), им пагинация не нужна.
export const PAGE_SIZE = 20
const MAX_PAGES = 50 // предохранитель от бесконечного цикла, если бэк игнорирует offset

type FetchOpts = Parameters<typeof httpRequest>[1]

/** В `path` уже может быть строка запроса (`/reviews/?energy_drink_id=1`). */
const pageUrl = (path: string, page: number) =>
  `${path}${path.includes('?') ? '&' : '?'}limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`

/** Собирает все страницы списка по очереди, пока не придёт короткая.
 *  Одинаковые вызовы в одном рендере Next дедуплицирует. */
export async function fetchAllPages<T>(path: string, options?: FetchOpts): Promise<T[]> {
  const all: T[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const chunk = await httpRequest<T[]>(pageUrl(path, page), options)
    all.push(...chunk)
    if (chunk.length < PAGE_SIZE) break
  }
  return all
}
