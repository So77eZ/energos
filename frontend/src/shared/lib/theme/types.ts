export type Theme = 'dark' | 'light'
export type Accent = 'cyan' | 'pink' | 'lime' | 'amber' | 'purple'
/** 'system' — уважать prefers-reduced-motion; 'always' — анимации вопреки системе. */
export type Motion = 'system' | 'always'

export interface ThemePrefs {
  theme: Theme
  accent: Accent
  liquidBg: boolean
  grain: boolean
  scanlines: boolean
  motion: Motion
  /** Показывать триггер гачапона (рулетки) в навигации. */
  gachapon: boolean
}
