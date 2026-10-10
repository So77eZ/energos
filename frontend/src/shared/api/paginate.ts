import { httpRequest } from './http'

// Бэк отдаёт списки страницами (limit/offset, по умолчанию limit=20, верхней границы нет).
// Размер страницы — 20, как договорились с бэкендером: ответ напитка включает отзывы,
// большие страницы «перегружают».
export const PAGE_SIZE = 20
const MAX_PAGES = 50 // предохранитель от бесконечного цикла, если бэк игнорирует offset

type FetchOpts = Parameters<typeof httpRequest>[1]

const pageUrl = (path: string, page: number) => `${path}?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`

/** Общее число записей из `GET .../count` → `{ "count": n }`; `null`, если эндпоинт недоступен. */
async function fetchCount(countPath: string, options?: FetchOpts): Promise<number | null> {
  try {
    const body = await httpRequest<{ count?: unknown }>(countPath, options)
    return typeof body?.count === 'number' && body.count >= 0 ? body.count : null
  } catch {
    return null
  }
}

/** Собирает все страницы списка. Одинаковые вызовы в одном рендере Next дедуплицирует.
 *
 *  Если передан `countPath`, число страниц считается по нему и страницы грузятся параллельно.
 *  Без него (или если счётчик недоступен) идём по страницам по очереди до короткой. */
export async function fetchAllPages<T>(path: string, options?: FetchOpts, countPath?: string): Promise<T[]> {
  const total = countPath ? await fetchCount(countPath, options) : null

  const all: T[] = []
  let next = 0

  if (total !== null) {
    const pages = Math.min(Math.ceil(total / PAGE_SIZE), MAX_PAGES)
    const chunks = await Promise.all(
      Array.from({ length: pages }, (_, page) => httpRequest<T[]>(pageUrl(path, page), options)),
    )
    for (const chunk of chunks) all.push(...chunk)
    next = pages
    // Пока грузили, могли добавить записи: если последняя страница полная — дочитываем по очереди.
    if (pages === 0 || chunks[pages - 1].length < PAGE_SIZE) return all
  }

  for (let page = next; page < MAX_PAGES; page++) {
    const chunk = await httpRequest<T[]>(pageUrl(path, page), options)
    all.push(...chunk)
    if (chunk.length < PAGE_SIZE) break
  }
  return all
}
