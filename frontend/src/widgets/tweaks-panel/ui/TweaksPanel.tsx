'use client'

import { useEffect, useRef, useState } from 'react'
import { ACCENT_MAP, useTheme, type Accent } from '@shared/lib/theme'
import { Icons } from '@shared/ui/icons'

const ACCENTS: Accent[] = ['cyan', 'pink', 'lime', 'amber', 'purple']

/**
 * Floating settings panel — пользовательский UI вокруг ThemeProvider.
 * До этого тема/акцент менялись только через DevTools.
 */
export function TweaksPanel() {
  const theme = useTheme()
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

          <div className="twk-body">
            <section className="twk-section">
              <span className="twk-section-title">Тема</span>
              <div className="twk-seg" role="radiogroup" aria-label="Тема">
                <button
                  type="button"
                  role="radio"
                  aria-checked={theme.theme === 'dark'}
                  className={`twk-seg-btn${theme.theme === 'dark' ? ' active' : ''}`}
                  onClick={() => theme.setTheme('dark')}
                >
                  <Icons.moon w={14} /> Тёмная
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={theme.theme === 'light'}
                  className={`twk-seg-btn${theme.theme === 'light' ? ' active' : ''}`}
                  onClick={() => theme.setTheme('light')}
                >
                  <Icons.sun w={14} /> Светлая
                </button>
              </div>
            </section>

            <section className="twk-section">
              <span className="twk-section-title">Акцент</span>
              <div className="twk-accents" role="radiogroup" aria-label="Цвет акцента">
                {ACCENTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    role="radio"
                    aria-checked={theme.accent === a}
                    aria-label={a}
                    className={`twk-accent${theme.accent === a ? ' active' : ''}`}
                    style={{ ['--swatch' as string]: ACCENT_MAP[a].hex }}
                    onClick={() => theme.setAccent(a)}
                  />
                ))}
              </div>
            </section>

            <section className="twk-section">
              <span className="twk-section-title">Эффекты</span>
              <label className="twk-toggle">
                <span className="twk-toggle-label">Цветной фон</span>
                <input
                  type="checkbox"
                  checked={theme.liquidBg}
                  onChange={(e) => theme.setLiquidBg(e.target.checked)}
                />
                <span className="twk-toggle-track"><span className="twk-toggle-thumb" /></span>
              </label>
              <label className="twk-toggle">
                <span className="twk-toggle-label">Шум (grain)</span>
                <input
                  type="checkbox"
                  checked={theme.grain}
                  onChange={(e) => theme.setGrain(e.target.checked)}
                />
                <span className="twk-toggle-track"><span className="twk-toggle-thumb" /></span>
              </label>
              <label className="twk-toggle">
                <span className="twk-toggle-label">Сканлайны</span>
                <input
                  type="checkbox"
                  checked={theme.scanlines}
                  onChange={(e) => theme.setScanlines(e.target.checked)}
                />
                <span className="twk-toggle-track"><span className="twk-toggle-thumb" /></span>
              </label>
            </section>
          </div>
        </div>
      )}
    </>
  )
}
