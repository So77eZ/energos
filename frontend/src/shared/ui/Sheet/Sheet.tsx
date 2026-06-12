'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useScrollLock } from '@shared/lib/useScrollLock'
import { Icons } from '@shared/ui/icons'

export interface SheetProps {
  open: boolean
  onClose: () => void
  /** bottom = слайд снизу (default), center = модалка по центру. */
  variant?: 'bottom' | 'center'
  /** Есть → шапка (title + close-x). Нет → голая панель. */
  title?: string
  /** aria-label диалога. Default = title. */
  ariaLabel?: string
  /** Клик по scrim закрывает. Default true. */
  closeOnScrim?: boolean
  /** Esc закрывает. Default true. */
  closeOnEsc?: boolean
  /** Морозить body-скролл пока open. Default true. */
  lockScroll?: boolean
  /** max-width панели, px. Default 440. */
  width?: number
  /** z-index scrim'а; панель = zIndex+1. Default 940. */
  zIndex?: number
  /** Доп. класс на панель (контент-стайлинг фичи). */
  className?: string
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Sheet({
  open,
  onClose,
  variant = 'bottom',
  title,
  ariaLabel,
  closeOnScrim = true,
  closeOnEsc = true,
  lockScroll = true,
  width = 440,
  zIndex = 940,
  className,
  children,
}: SheetProps) {
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  // onClose в ref → keydown-listener стабилен (не пересоздаётся на каждый инлайн-onClose
  // из родителя), нет окна, где Esc проваливается между remove/add listener.
  const onCloseRef = useRef(onClose)

  useEffect(() => setMounted(true), [])
  useEffect(() => { onCloseRef.current = onClose })

  // Тот же отлаженный хук, что у MobileNav/Gachapon (морозит document.body, чинит scrollY).
  useScrollLock(open && lockScroll)

  // a11y-варн: role=dialog требует имени.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !title && !ariaLabel) {
      console.warn('Sheet: задай title или ariaLabel — role=dialog нужно имя.')
    }
  }, [title, ariaLabel])

  // Esc + focus-trap (пересбор focusables на каждый Tab — контент панели меняется) + focus-return.
  useEffect(() => {
    if (!open) {
      lastFocus.current?.focus?.()
      lastFocus.current = null
      return
    }
    lastFocus.current = document.activeElement as HTMLElement
    const panel = panelRef.current
    const getFocusables = () =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)) : []
    getFocusables()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onCloseRef.current()
        return
      }
      if (e.key === 'Tab') {
        const f = getFocusables()
        if (f.length === 0) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closeOnEsc])

  if (!mounted) return null

  const oc = open ? ' open' : ''
  return createPortal(
    // var-scope: --sheet-z/--sheet-w наследуются детьми; обёртка без layout (дети fixed).
    <div
      className="sheet-layer"
      style={{ '--sheet-z': zIndex, '--sheet-w': `${width}px` } as CSSProperties}
    >
      <div className={`sheet-scrim${oc}`} onClick={closeOnScrim ? onClose : undefined} />
      <div
        ref={panelRef}
        className={`sheet sheet--${variant}${oc}${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
      >
        {variant === 'bottom' && <div className="sheet-grab" />}
        {title && (
          <div className="sheet-hd">
            <h3>{title}</h3>
            <button type="button" className="sheet-close" onClick={onClose} aria-label="Закрыть">
              <Icons.x w={15} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}
