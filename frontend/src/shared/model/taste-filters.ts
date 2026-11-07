/** Общие ключи вкусовых диапазонов: shared-контекст не зависит от entities/review. */
export type TasteMetric = 'acidity' | 'sweetness' | 'carbonation' | 'concentration' | 'aftertaste' | 'price_quality'
export type TasteFilters = Partial<Record<TasteMetric, [number, number]>>
