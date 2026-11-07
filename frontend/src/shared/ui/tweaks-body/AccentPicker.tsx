'use client'

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { ACCENT_MAP, getAccentColors, hexToHsv, hsvToHex, normalizeHex, useTheme, type Hsv } from '@shared/lib/theme'

const ACCENTS = ['cyan', 'pink', 'lime', 'amber', 'purple'] as const
const LABELS = ['Голубой', 'Розовый', 'Зелёный', 'Янтарный', 'Фиолетовый']

export function AccentPicker({ compact }: { compact: boolean }) {
  const theme = useTheme()
  const [editing, setEditing] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = () => { setEditing(false); trigger.current?.focus() }
  useEffect(() => { setEditing(false) }, [theme.accentSelection])

  return (
    <section className="twk-section">
      <span className="twk-section-title">Акцент</span>
      <div className="twk-accents" role="radiogroup" aria-label="Цвет акцента">
        {ACCENTS.map((accent, index) => (
          <button
            key={accent} type="button" role="radio" aria-checked={theme.accent === accent}
            aria-label={accent} title={LABELS[index]}
            className={`twk-accent${theme.accent === accent ? ' active' : ''}`}
            style={{ '--swatch': ACCENT_MAP[accent].hex } as CSSProperties}
            onClick={() => { setEditing(false); theme.setAccent(accent) }}
          >{theme.accent === accent && <span aria-hidden="true">✓</span>}</button>
        ))}
        {!compact && (
          <button ref={trigger} type="button" className={`twk-accent accent-custom-trigger${theme.accent === 'custom' ? ' active' : ''}`} aria-label="Свой цвет" aria-expanded={editing} aria-pressed={theme.accent === 'custom'} onClick={() => editing ? close() : setEditing(true)}>
            <span>Свой</span>
          </button>
        )}
      </div>
      {!compact && (
        <>
          {editing && <AccentEditor onClose={close} />}
          <button type="button" className="accent-reset" aria-label="Сбросить акцент" onClick={() => { setEditing(false); theme.setAccent('cyan') }}>Вернуть стандартный акцент</button>
        </>
      )}
      {compact && theme.accent === 'custom' && <span className="accent-current"><span className="accent-custom-swatch" style={{ background: theme.customAccent }} aria-hidden="true" />Свой цвет · {theme.customAccent}</span>}
    </section>
  )
}

function AccentEditor({ onClose }: { onClose: () => void }) {
  const { accent, customAccent, mutedLightAccent, previewAccent, setCustomAccent } = useTheme()
  const initial = accent === 'custom' ? customAccent : ACCENT_MAP[accent].hex
  const [hex, setHex] = useState(initial.toUpperCase())
  const [hsv, setHsv] = useState(() => hexToHsv(initial))
  const [blurred, setBlurred] = useState(false)
  const committed = useRef(false)
  const valid = normalizeHex(hex)

  useEffect(() => {
    if (!valid) return
    const frame = requestAnimationFrame(() => previewAccent(valid))
    return () => cancelAnimationFrame(frame)
  }, [valid, previewAccent])

  useEffect(() => () => {
    if (!committed.current) previewAccent(null)
  }, [previewAccent])

  function changeHsv(next: Hsv) {
    setHsv(next)
    setHex(hsvToHex(next))
  }

  function pick(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const s = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100))
    const v = Math.max(0, Math.min(100, 100 - (event.clientY - rect.top) / rect.height * 100))
    changeHsv({ ...hsv, s, v })
  }

  return (
    <div className="accent-editor" role="group" aria-label="Редактор акцента" onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); onClose() }
    }}>
      <div className="accent-editor-controls">
      <div
        className="accent-sv" aria-hidden="true" style={{ '--hue': hsv.h } as CSSProperties}
        onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); pick(event) }}
        onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) pick(event) }}
        onPointerUp={event => { event.currentTarget.releasePointerCapture(event.pointerId) }}
      >
        <span className="accent-sv-thumb" style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, background: valid ?? initial }} />
      </div>
      <label className="accent-field">
        <span>Оттенок</span>
        <input className="accent-hue" type="range" min="0" max="359" value={Math.round(hsv.h)} onChange={event => changeHsv({ ...hsv, h: event.currentTarget.valueAsNumber })} />
      </label>
      <div className="accent-numbers">
        {(['s', 'v'] as const).map((key, index) => (
          <label className="accent-field" key={key}>
            <span>{index === 0 ? 'Насыщенность, %' : 'Яркость, %'}</span>
            <input type="number" min="0" max="100" value={Math.round(hsv[key])} onChange={event => {
              const number = event.currentTarget.valueAsNumber
              if (Number.isFinite(number)) changeHsv({ ...hsv, [key]: Math.max(0, Math.min(100, number)) })
            }} />
          </label>
        ))}
      </div>
      <label className="accent-field">
        <span>HEX</span>
        <input
          type="text" value={hex} spellCheck={false} autoComplete="off" aria-invalid={blurred && !valid || undefined}
          aria-describedby="accent-hex-help" onBlur={() => setBlurred(true)}
          onChange={event => {
            const value = event.currentTarget.value
            setHex(value)
            const parsed = normalizeHex(value)
            if (parsed) setHsv(hexToHsv(parsed))
          }}
        />
      </label>
      <p className="accent-help" id="accent-hex-help">{blurred && !valid ? 'Введи HEX: например, #7C3AED. Прозрачность не поддерживается.' : 'Точный цвет — для заливки. Текст и ссылки адаптируются для читаемости.'}</p>
      </div>
      <div className="accent-previews">
        <AccentPreview hex={valid ?? hsvToHex(hsv)} theme="dark" muted={mutedLightAccent} />
        <AccentPreview hex={valid ?? hsvToHex(hsv)} theme="light" muted={mutedLightAccent} />
      </div>
      <div className="accent-editor-actions">
        <button type="button" aria-label="Отменить цвет" onClick={onClose}>Отменить</button>
        <button type="button" aria-label="Применить цвет" disabled={!valid} onClick={() => {
          if (!valid) return
          committed.current = true
          setCustomAccent(valid)
          onClose()
        }}>Применить</button>
      </div>
    </div>
  )
}

function AccentPreview({ hex, theme, muted }: { hex: string; theme: 'dark' | 'light'; muted: boolean }) {
  const colors = getAccentColors(hex, theme, muted)
  return (
    <section className={`accent-preview accent-preview-${theme}`} aria-label={`Пример: ${theme === 'dark' ? 'тёмная' : 'светлая'} тема`} style={{ '--preview-fill': colors.fill, '--preview-ink': colors.ink, '--preview-accent': colors.foreground } as CSSProperties}>
      <span>{theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
      <button type="button" className="accent-preview-button">Оставить отзыв</button>
      <span className="accent-preview-link">Пример ссылки</span>
      <label className="accent-preview-check"><input type="checkbox" defaultChecked />Выбрано</label>
      <input type="text" readOnly value="Поле ввода" aria-label={`Пример поля: ${theme}`} />
    </section>
  )
}
