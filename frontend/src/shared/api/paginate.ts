import { httpRequest } from './http'

// Бэк отдаёт списки страницами (limit/offset, по умолчанию limit=20). Верхний предел
// limit в docs/api.md не указан — берём 100 и идём до короткой страницы.
// Вопрос бэкендеру: максимальный limit — docs/mvp-backend-questions.md.
const PAGE_SIZE = 100
const MAX_PAGES = 50 // предохранитель от бесконечного цикла, если бэк игнорирует offset

type FetchOpts = Parameters<typeof httpRequest>[1]

/** Собирает все страницы списка. Одинаковые вызовы в одном рендере Next дедуплицирует. */
export async function fetchAllPages<T>(path: string, options?: FetchOpts): Promise<T[]> {
  const all: T[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const chunk = await httpRequest<T[]>(
      `${path}?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
      options,
    )
    all.push(...chunk)
    if (chunk.length < PAGE_SIZE) break
  }
  return all
}
