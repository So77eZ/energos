'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export interface MobileNavState {
  moreOpen: boolean
  searchOpen: boolean
  tabsHidden: boolean
  setMoreOpen: (v: boolean) => void
  setSearchOpen: (v: boolean) => void
}

export function useMobileNav(): MobileNavState {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [tabsHidden, setTabsHidden] = useState(false)

  // Сброс оверлеев на смену маршрута.
  useEffect(() => {
    setMoreOpen(false)
    setSearchOpen(false)
  }, [pathname])

  // Scroll-hide таб-бара: прячем при скролле вниз, показываем при вверх/остановке.
  const lastY = useRef(0)
  const ticking = useRef(false)
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const overlayOpen = moreOpen || searchOpen

  useEffect(() => {
    if (overlayOpen) {
      setTabsHidden(false)
      return
    }
    function onScroll() {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (y > lastY.current && y > 80) setTabsHidden(true)
        else setTabsHidden(false)
        lastY.current = y
        ticking.current = false
        clearTimeout(idle.current)
        idle.current = setTimeout(() => setTabsHidden(false), 150)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(idle.current)
    }
  }, [overlayOpen])

  return { moreOpen, searchOpen, tabsHidden, setMoreOpen, setSearchOpen }
}
