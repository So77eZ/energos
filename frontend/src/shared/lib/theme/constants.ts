import type { Accent, Motion, ThemePrefs } from './types'

export const ACCENT_MAP: Record<Accent, { rgb: string; hex: string }> = {
  cyan:   { rgb: '0,229,255',   hex: '#00e5ff' },
  pink:   { rgb: '255,46,136',  hex: '#ff2e88' },
  lime:   { rgb: '0,255,157',   hex: '#00ff9d' },
  amber:  { rgb: '251,191,36',  hex: '#fbbf24' },
  purple: { rgb: '192,132,252', hex: '#c084fc' },
}

export const DEFAULT_PREFS: ThemePrefs = {
  theme: 'dark',
  accent: 'cyan',
  liquidBg: true,
  grain: true,
  scanlines: true,
  motion: null,
  gachapon: true,
}

export const STORAGE_KEY = 'energos_theme'

/** Сохранённое значение анимаций → Motion. Старые значения: 'always' («Всегда вкл.») → 'on',
 *  'system' («По системе») и мусор → null (следовать системе). */
export function parseMotion(v: unknown): Motion | null {
  if (v === 'on' || v === 'always') return 'on'
  if (v === 'off') return 'off'
  return null
}
