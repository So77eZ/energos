import type { ReactNode } from 'react'

export type ToastKind = 'info' | 'ok' | 'err' | 'love'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastInput {
  msg: string
  kind?: ToastKind
  /** Auto-dismiss time in ms. Default 3500. */
  ttl?: number
  action?: ToastAction
  /** Кастомная иконка (напр. медаль ачивки). Перебивает kind-иконку. */
  icon?: ReactNode
}

export interface ToastItem extends Required<Omit<ToastInput, 'action' | 'icon'>> {
  id: number
  action?: ToastAction
  icon?: ReactNode
}
