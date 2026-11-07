'use client'

import { FEATURES } from '@shared/config/features'
import { useTheme } from '@shared/lib/theme'
import { FONTS, useUserPreferences, type FontId } from '@shared/lib/user-preferences'
import { Icons } from '@shared/ui/icons'
import { AccentPicker } from './AccentPicker'

export function TweaksBody({ compact = false }: { compact?: boolean }) {
  const theme = useTheme()

  return (
    <div className={`twk-body${compact ? '' : ' twk-body-full'}`}>
      <div className="twk-appearance-primary">
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

      <AccentPicker compact={compact} />
      </div>
      {!compact && <div className="twk-appearance-details"><AppearanceDetails /></div>}
    </div>
  )
}

function AppearanceDetails() {
  const theme = useTheme()
  const { font, setFont } = useUserPreferences()

  return (
    <>
      <section className="twk-section">
        <span className="twk-section-title">Подмес акцента в фон</span>
        <p className="twk-hint">Переключай тему, чтобы сразу увидеть её подмес на странице.</p>
        {(['tintDark', 'tintLight'] as const).map((key) => (
          <label key={key} className="twk-range">
            <span>{key === 'tintDark' ? 'Тёмная тема' : 'Светлая тема'}</span>
            <input
              type="range"
              min={0}
              max={20}
              value={theme[key]}
              aria-valuetext={`${theme[key]}%`}
              onChange={(e) => theme.update({ [key]: e.currentTarget.valueAsNumber })}
            />
            <span aria-hidden="true">{theme[key]}%</span>
          </label>
        ))}
        <label className="twk-toggle">
          <span className="twk-toggle-label">Подкрашивать карточки</span>
          <input type="checkbox" checked={theme.tintCards} onChange={(e) => theme.update({ tintCards: e.target.checked })} />
          <span className="twk-toggle-track"><span className="twk-toggle-thumb" /></span>
        </label>
        <label className="twk-toggle">
          <span className="twk-toggle-label">Приглушённый акцент в светлой теме</span>
          <input type="checkbox" checked={theme.mutedLightAccent} onChange={(e) => theme.update({ mutedLightAccent: e.target.checked })} />
          <span className="twk-toggle-track"><span className="twk-toggle-thumb" /></span>
        </label>
      </section>

      <section className="twk-section">
        <span className="twk-section-title">Шрифт</span>
        <select
          className="twk-select"
          value={font}
          onChange={(e) => setFont(e.target.value as FontId)}
          aria-label="Шрифт интерфейса"
        >
          {FONTS.map((f) => (
            <option key={f.id} value={f.id} style={{ fontFamily: `"${f.id}"` }}>
              {f.label}
            </option>
          ))}
        </select>
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
        {FEATURES.gachapon && (
          <label className="twk-toggle">
            <span className="twk-toggle-label">Кнопка Гачапон</span>
            <input
              type="checkbox"
              checked={theme.gachapon}
              onChange={(e) => theme.setGachapon(e.target.checked)}
            />
            <span className="twk-toggle-track"><span className="twk-toggle-thumb" /></span>
          </label>
        )}
      </section>

      <section className="twk-section">
        <span className="twk-section-title">Анимации</span>
        <div className="twk-seg" role="radiogroup" aria-label="Анимации">
          <button
            type="button"
            role="radio"
            aria-checked={theme.motionOn}
            className={`twk-seg-btn${theme.motionOn ? ' active' : ''}`}
            onClick={() => theme.setMotion('on')}
          >
            Вкл.
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!theme.motionOn}
            className={`twk-seg-btn${!theme.motionOn ? ' active' : ''}`}
            onClick={() => theme.setMotion('off')}
          >
            Выкл.
          </button>
        </div>
        <p className="twk-hint">
          Движение фона, 3D-банок и прочие анимации. Пока не выбрано — как в системе
          («уменьшить движение»). Выключение помогает, если сайт тормозит.
        </p>
      </section>
    </>
  )
}
