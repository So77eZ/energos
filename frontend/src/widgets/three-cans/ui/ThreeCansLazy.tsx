'use client'

import dynamic from 'next/dynamic'
import { useTheme } from '@shared/lib/theme'
import { useMinWidth } from '@shared/lib/useMinWidth'

// three.js ~150 KB — грузим только на клиенте (ssr:false). Обёртка нужна, чтобы
// серверный page.tsx мог отрендерить компонент: dynamic({ssr:false}) запрещён
// напрямую в Server Component, но разрешён внутри client-границы.
const ThreeCans = dynamic(() => import('./ThreeCans').then((m) => m.ThreeCans), {
  ssr: false,
  loading: () => null,
})

// Ниже 1440px CSS прячет банки (`display: none`) — гейтим рендер, чтобы dynamic-import
// (а с ним и three.js-чанк) качался ТОЛЬКО когда вьюпорт дорос до брейкпоинта.
const THREE_CANS_MIN_WIDTH = 1440

// При слабой графике (gfx.ts) банок нет: WebGL без видеокарты рисуется на CPU.
export function ThreeCansLazy() {
  const wideEnough = useMinWidth(THREE_CANS_MIN_WIDTH)
  const { lowGfx } = useTheme()
  return wideEnough && !lowGfx ? <ThreeCans /> : null
}
