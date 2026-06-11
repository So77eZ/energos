'use client'

import dynamic from 'next/dynamic'

// three.js ~150 KB — грузим только на клиенте (ssr:false). Обёртка нужна, чтобы
// серверный page.tsx мог отрендерить компонент: dynamic({ssr:false}) запрещён
// напрямую в Server Component, но разрешён внутри client-границы.
const ThreeCans = dynamic(() => import('./ThreeCans').then((m) => m.ThreeCans), {
  ssr: false,
  loading: () => null,
})

export function ThreeCansLazy() {
  return <ThreeCans />
}
