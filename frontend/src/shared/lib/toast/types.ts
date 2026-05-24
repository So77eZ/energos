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
}

export interface ToastItem extends Required<Omit<ToastInput, 'action'>> {
  id: number
  action?: ToastAction
}
