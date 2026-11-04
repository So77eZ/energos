export type Theme = 'dark' | 'light'
export type Accent = 'cyan' | 'pink' | 'lime' | 'amber' | 'purple'
/** Анимации, выбранные пользователем. null — ещё не выбирал: следуем системной настройке
 *  «уменьшить движение» (reduce → выкл.). Выбор сохраняется, только когда нажали Вкл/Выкл. */
export type Motion = 'on' | 'off'

export interface ThemePrefs {
  theme: Theme
  accent: Accent
  tintDark: number
  tintLight: number
  tintCards: boolean
  mutedLightAccent: boolean
  liquidBg: boolean
  grain: boolean
  scanlines: boolean
  motion: Motion | null
  /** Показывать триггер гачапона (рулетки) в навигации. */
  gachapon: boolean
}
