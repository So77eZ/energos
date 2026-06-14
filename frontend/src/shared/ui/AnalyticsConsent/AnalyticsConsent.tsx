'use client'

import { useEffect, useState } from 'react'

// 152-ФЗ / GDPR: Яндекс.Метрику (webvisor пишет клики/движения/ввод = перс.данные)
// грузим ТОЛЬКО после явного согласия (opt-in). До согласия — никакого трекинга.
const YM_ID = 109003264
const KEY = 'energos_analytics_consent' // 'granted' | 'denied'

type Ym = ((...args: unknown[]) => void) & { a?: unknown[]; l?: number }
declare global {
  interface Window {
    ym?: Ym
  }
}

function loadMetrika() {
  if (typeof window === 'undefined' || window.ym) return
  // Стандартный лоадер Метрики (очередь до загрузки tag.js), вызывается лишь по согласию.
  const stub: Ym = ((...args: unknown[]) => { (stub.a = stub.a || []).push(args) }) as Ym
  stub.l = Date.now()
  window.ym = stub

  const s = document.createElement('script')
  s.async = true
  s.src = `https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}`
  const first = document.getElementsByTagName('script')[0]
  first?.parentNode?.insertBefore(s, first)

  window.ym(YM_ID, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    accurateTrackBounce: true,
    trackLinks: true,
  })
}

export function AnalyticsConsent() {
  const [decided, setDecided] = useState(true) // до mount считаем «решено» → не мигаем баннером в SSR

  useEffect(() => {
    let v: string | null = null
    try { v = localStorage.getItem(KEY) } catch {}
    if (v === 'granted') { loadMetrika(); setDecided(true); return }
    if (v === 'denied') { setDecided(true); return }
    setDecided(false) // не решено → показать баннер
  }, [])

  function choose(granted: boolean) {
    try { localStorage.setItem(KEY, granted ? 'granted' : 'denied') } catch {}
    if (granted) loadMetrika()
    setDecided(true)
  }

  if (decided) return null

  return (
    <div className="consent-banner" role="dialog" aria-label="Согласие на аналитику" aria-live="polite">
      <p className="consent-text">
        Сайт использует <strong>Яндекс.Метрику</strong> (cookie) для аналитики посещаемости.
        Без согласия счётчик не загружается.
      </p>
      <div className="consent-actions">
        <button type="button" className="cta-ghost" onClick={() => choose(false)}>Отклонить</button>
        <button type="button" className="cta-primary" onClick={() => choose(true)}>Принять</button>
      </div>
    </div>
  )
}
