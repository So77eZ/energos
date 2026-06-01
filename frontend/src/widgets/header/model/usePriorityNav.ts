'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import type { NavItem } from './nav-items'
import { computeVisibleCount } from './priority-nav'

const SEARCH_RESERVE = 220 // px под поиск, чтобы не схлопывался

export interface PriorityNavResult {
  visible: NavItem[]
  overflow: NavItem[]
  showMore: boolean
  navRef: RefObject<HTMLDivElement | null>
  measureRef: RefObject<HTMLDivElement | null>
}

export function usePriorityNav(items: NavItem[]): PriorityNavResult {
  const navRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<HTMLDivElement | null>(null)
  const [visibleCount, setVisibleCount] = useState(items.length)

  useLayoutEffect(() => {
    const nav = navRef.current
    const measure = measureRef.current
    if (!nav || !measure) return
    const inner = nav.closest('.hdr-inner') as HTMLElement | null
    if (!inner) return

    let raf = 0
    function recompute() {
      if (!nav || !measure || !inner) return
      if (getComputedStyle(nav).display === 'none') return // мобилка — не считаем

      const cs = getComputedStyle(inner)
      const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0)
      const gap = parseFloat(cs.columnGap || cs.gap) || 0
      const logo = inner.querySelector('.logo') as HTMLElement | null
      const logoW = logo ? logo.offsetWidth : 0
      const trail = inner.querySelector('.hdr-nav-trail') as HTMLElement | null
      const trailW = trail ? trail.offsetWidth : 0

      const contentW = inner.clientWidth - padX
      const available = contentW - logoW - SEARCH_RESERVE - gap * 2 - trailW - 8

      const itemEls = Array.from(measure.querySelectorAll<HTMLElement>('[data-mi]'))
      const moreEl = measure.querySelector<HTMLElement>('[data-mm]')
      const moreWidth = moreEl ? moreEl.offsetWidth + 2 : 82
      const itemWidths = itemEls.map((el) => el.offsetWidth + 2)

      const count = computeVisibleCount({ itemWidths, moreWidth, available, pinMore: false })
      setVisibleCount((prev) => (prev === count ? prev : count))
    }

    function schedule() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(recompute)
    }

    schedule()
    const ro = new ResizeObserver(schedule)
    ro.observe(inner)
    window.addEventListener('resize', schedule)
    if (document.fonts?.ready) document.fonts.ready.then(schedule).catch(() => {})

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [items.length])

  return {
    visible: items.slice(0, visibleCount),
    overflow: items.slice(visibleCount),
    showMore: visibleCount < items.length,
    navRef,
    measureRef,
  }
}
