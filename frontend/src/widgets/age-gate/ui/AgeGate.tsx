'use client'

import { useEffect, useState } from 'react'
import { Icons } from '@shared/ui/icons'
import { useScrollLock } from '@shared/lib/useScrollLock'

/**
 * Soft age gate. Federal law in RU does not restrict energy drink sales by
 * age, but several regions (Moscow и др.) запрещают продажу несовершеннолетним —
 * заглушка прикрывает по доброй вере.
 *
 * Persisted via `localStorage` only — это «good faith» проверка, не серверная.
 * Под индексацию SSR-страницы рендерятся как обычно, гейт уже на клиенте.
 */

const STORAGE_KEY = 'energos_age_verified'

type View = 'loading' | 'asking' | 'denied' | 'verified'

export function AgeGate() {
  const [view, setView] = useState<View>('loading')

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      setView(v === 'true' ? 'verified' : 'asking')
    } catch {
      // localStorage недоступен (private mode и т.п.) — показываем гейт
      setView('asking')
    }
  }, [])

  // Блокируем скролл пока гейт перекрывает вьюпорт (общий хук — iOS-safe).
  useScrollLock(view === 'asking' || view === 'denied')

  if (view === 'loading' || view === 'verified') return null

  function confirm() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {}
    setView('verified')
  }

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className="age-gate-grid" aria-hidden="true" />

      <div className="age-gate-card">
        {view === 'asking' ? (
          <>
            <div className="age-gate-logo">
              <span className="logo-bolt">
                <Icons.bolt w={22} />
              </span>
              <span className="age-gate-logo-word">ENERGOS</span>
            </div>

            <span className="age-gate-badge">18+</span>

            <h1 id="age-gate-title" className="age-gate-title">
              Подтвердите свой возраст
            </h1>
            <p className="age-gate-blurb">
              Сайт содержит информацию об энергетических напитках. В ряде регионов России
              их продажа ограничена для лиц младше 18 лет.
            </p>

            <div className="age-gate-actions">
              <button type="button" className="cta-primary" onClick={confirm}>
                <Icons.check w={14} /> Мне есть 18
              </button>
              <button type="button" className="cta-ghost" onClick={() => setView('denied')}>
                Мне меньше
              </button>
            </div>

            <p className="age-gate-foot">ВЫБОР СОХРАНЯЕТСЯ ЛОКАЛЬНО</p>
          </>
        ) : (
          <div className="age-gate-denied">
            <div className="age-gate-denied-icon">
              <Icons.lock w={28} />
            </div>
            <h1 id="age-gate-title" className="age-gate-title">
              Доступ ограничен
            </h1>
            <p className="age-gate-blurb">
              Контент сайта доступен только пользователям старше 18 лет.
              Возвращайтесь, когда подойдёте по возрасту.
            </p>
            <button
              type="button"
              className="age-gate-denied-link"
              onClick={() => setView('asking')}
            >
              Вернуться к проверке
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
