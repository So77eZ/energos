'use client'

// Содержимое настроек оформления — без floating-shell. Используется и в
// TweaksPanel (fab внизу справа), и в профиле пользователя (вкладка
// «Оформление»). Если изменишь секции тут — оба места обновятся.

import { FEATURES } from '@shared/config/features'
import { ACCENT_MAP, useTheme, type Accent } from '@shared/lib/theme'
import { FONTS, useUserPreferences, type FontId } from '@shared/lib/user-preferences'
import { Icons } from '@shared/ui/icons'

const ACCENTS: Accent[] = ['cyan', 'pink', 'lime', 'amber', 'purple']

export function TweaksBody() {
  const theme = useTheme()
  const { font, setFont } = useUserPreferences()

  return (
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
    </div>
  )
}
