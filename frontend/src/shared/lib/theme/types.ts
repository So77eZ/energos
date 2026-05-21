export type Theme = 'dark' | 'light'
export type Accent = 'cyan' | 'pink' | 'lime' | 'amber' | 'purple'

export interface ThemePrefs {
  theme: Theme
  accent: Accent
  liquidBg: boolean
  grain: boolean
  scanlines: boolean
}
