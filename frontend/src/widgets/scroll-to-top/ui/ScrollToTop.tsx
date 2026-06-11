'use client'

import { useEffect, useState } from 'react'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    // Семплируем направление/позицию раз в кадр — scroll-событий за кадр
    // прилетает пачка, лишние setState не нужны (rAF-throttle).
    function update() {
      const currentY = window.scrollY
      setVisible(currentY < lastY && currentY > 300)
      lastY = currentY
      ticking = false
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Кнопка всегда в DOM; видимость/анимация входа-выхода — через класс
  // `.is-visible` (CSS fade+scale), без framer-motion.
  return (
    <button
      type="button"
      className={`up-fab${visible ? ' is-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Наверх"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
