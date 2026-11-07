import { METRIC_KEYS } from '@entities/review'
import type { TasteFilters, TasteMetric } from '@shared/model/taste-filters'

export function isActiveTasteRange(range: [number, number] | undefined): range is [number, number] {
  return !!range && Number.isInteger(range[0]) && Number.isInteger(range[1]) &&
    range[0] >= 1 && range[1] <= 5 && range[0] <= range[1] &&
    (range[0] !== 1 || range[1] !== 5)
}

export function countTasteFilters(filters: TasteFilters): number {
  return METRIC_KEYS.filter((key) => isActiveTasteRange(filters[key])).length
}

export function changeTasteRange(filters: TasteFilters, key: TasteMetric, bound: 0 | 1, value: number): TasteFilters {
  const current = filters[key] ?? [1, 5]
  const range: [number, number] = bound === 0
    ? [value, Math.max(value, current[1])]
    : [Math.min(current[0], value), value]
  const next = { ...filters }
  if (isActiveTasteRange(range)) next[key] = range
  else delete next[key]
  return next
}

export function parseTasteFilters(params: Pick<URLSearchParams, 'get'>): TasteFilters {
  const filters: TasteFilters = {}
  for (const key of METRIC_KEYS) {
    const value = params.get(`taste_${key}`)
    if (!value || !/^[1-5]-[1-5]$/.test(value)) continue
    const [lo, hi] = value.split('-').map(Number)
    const range: [number, number] = [lo, hi]
    if (isActiveTasteRange(range)) filters[key] = range
  }
  return filters
}

export function writeTasteFilters(params: URLSearchParams, filters: TasteFilters): void {
  for (const key of METRIC_KEYS) {
    const name = `taste_${key}`
    const range = filters[key]
    if (isActiveTasteRange(range)) params.set(name, `${range[0]}-${range[1]}`)
    else params.delete(name)
  }
}
