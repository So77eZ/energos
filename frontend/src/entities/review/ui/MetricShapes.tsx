// Metric-themed dot icons: biohazard / candy / bubbles / flask / shell / rouble.
// Used on review cards (read-only) and inside review-form rating buttons.

import type { JSX } from 'react'
import type { ReviewMetrics } from '../model/types'

type ShapeFC = () => JSX.Element

export const MetricShapes: Record<keyof ReviewMetrics, ShapeFC> = {
  acidity: () => (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="4" r="2.2" />
      <circle cx="12" cy="20" r="2.2" />
      <circle cx="5" cy="8" r="2.2" />
      <circle cx="19" cy="8" r="2.2" />
      <circle cx="5" cy="16" r="2.2" />
      <circle cx="19" cy="16" r="2.2" />
    </svg>
  ),
  sweetness: () => (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <circle cx="12" cy="12" r="5" />
      <path d="M2 12c2-4 2-4 5-4M22 12c-2-4-2-4-5-4M2 12c2 4 2 4 5 4M22 12c-2 4-2 4-5 4" />
    </svg>
  ),
  carbonation: () => (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="14" r="3" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  ),
  concentration: () => (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 2v6L4 20a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-12V2" />
      <path d="M7 14h10" />
    </svg>
  ),
  aftertaste: () => (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <path d="M4 12a8 8 0 1 1 16 0c0 6-4 8-8 8s-8-2-8-8z" />
    </svg>
  ),
  price_quality: () => (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 20V4h6a4 4 0 1 1 0 8H4M4 16h11" />
    </svg>
  ),
}

export type MetricShapeKey = keyof typeof MetricShapes
