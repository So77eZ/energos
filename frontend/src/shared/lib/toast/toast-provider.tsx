'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icons } from '@shared/ui/icons'
import type { ToastInput, ToastItem } from './types'

interface ToastContextValue {
  /** Show a toast. Returns its id (use with dismiss). */
  toast: (input: ToastInput | string) => number
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_TTL = 3500

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const seq = useRef(1)
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
    const t = timers.current.get(id)
    if (t) {
      clearTimeout(t)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback((input: ToastInput | string) => {
    const opts: ToastInput = typeof input === 'string' ? { msg: input } : input
    const item: ToastItem = {
      id: seq.current++,
      msg: opts.msg,
      kind: opts.kind ?? 'info',
      ttl: opts.ttl ?? DEFAULT_TTL,
      action: opts.action,
    }
    setItems((prev) => [...prev, item])
    const timer = setTimeout(() => dismiss(item.id), item.ttl)
    timers.current.set(item.id, timer)
    return item.id
  }, [dismiss])

  // Clear all timers on unmount to avoid leaks in dev hot-reload.
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t))
      timers.current.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastHost items={items} onClose={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastHost({ items, onClose }: { items: ToastItem[]; onClose: (id: number) => void }) {
  return (
    <div className="toast-host" aria-live="polite" aria-atomic="false">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`} role="status">
          <span className="toast-icon">
            {t.kind === 'ok'   && <Icons.check w={14} />}
            {t.kind === 'err'  && <Icons.x w={14} />}
            {t.kind === 'info' && <Icons.bolt w={14} />}
            {t.kind === 'love' && <Icons.bolt w={14} />}
          </span>
          <span className="toast-msg">{t.msg}</span>
          {t.action && (
            <button
              type="button"
              className="toast-action"
              onClick={() => { t.action!.onClick(); onClose(t.id) }}
            >
              {t.action.label}
            </button>
          )}
          <button type="button" className="toast-close" onClick={() => onClose(t.id)} aria-label="Закрыть">
            <Icons.x w={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
