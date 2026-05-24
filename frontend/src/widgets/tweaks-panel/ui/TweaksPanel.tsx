'use client'

import { useEffect, useRef, useState } from 'react'
import { Icons } from '@shared/ui/icons'
import { TweaksBody } from './TweaksBody'

/**
 * Floating settings panel — пользовательский UI вокруг ThemeProvider.
 * Содержимое вынесено в [[TweaksBody]] чтобы переиспользоваться в профиле.
 */
export function TweaksPanel() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)

  // Close on outside click + Esc.
  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      const target = e.target as Node
      if (panelRef.current?.contains(target) || fabRef.current?.contains(target)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className={`twk-fab${open ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Настройки темы"
        aria-expanded={open}
        aria-controls="twk-panel"
      >
        {open ? <Icons.x w={18} /> : <Icons.sliders w={18} />}
      </button>

      {open && (
        <div
          ref={panelRef}
          id="twk-panel"
          className="twk-panel"
          role="dialog"
          aria-label="Настройки внешнего вида"
        >
          <header className="twk-head">
            <span className="twk-title">Настройки</span>
            <button
              type="button"
              className="twk-close"
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
            >
              <Icons.x w={14} />
            </button>
          </header>

          <TweaksBody />
        </div>
      )}
    </>
  )
}
