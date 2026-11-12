export interface Hsv { h: number; s: number; v: number }

export function normalizeHex(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const hex = value.trim()
  if (/^#[\da-f]{6}$/i.test(hex)) return hex.toUpperCase()
  if (/^#[\da-f]{3}$/i.test(hex)) return '#' + [...hex.slice(1)].map(c => c + c).join('').toUpperCase()
  return null
}

// Self-contained: this exact function is also embedded in the pre-hydration script.
export function getAccentColors(hex: string, theme: 'dark' | 'light', muted = false) {
  const fill = /^#[\da-f]{6}$/i.test(hex) ? hex.toUpperCase() : '#00E5FF'
  const rgb = [1, 3, 5].map(i => parseInt(fill.slice(i, i + 2), 16))
  const luminance = (channels: number[]) => {
    const linear = channels.map(c => c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
  }
  const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  const light = theme === 'light'
  // Conservative surface bounds for the current 0–20% tint and translucent panels.
  // Recheck these anchors if theme surface colors or maximum tint change.
  const backgrounds = light ? [[144, 154, 170], [255, 255, 255]] : [[10, 10, 18], [102, 102, 114]]
  const gray = (Math.max(...rgb) + Math.min(...rgb)) / 2
  const base = light && muted ? rgb.map(c => c * 0.65 + gray * 0.35) : rgb
  let foreground = rgb
  for (let step = 0; step <= 255; step++) {
    foreground = base.map(c => Math.round(c + ((light ? 0 : 255) - c) * step / 255))
    if (backgrounds.every(bg => ratio(luminance(foreground), luminance(bg)) >= 4.5)) break
  }
  const value = luminance(rgb)
  return {
    fill,
    rgb: rgb.join(','),
    foreground: '#' + foreground.map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase(),
    ink: ratio(value, 0) >= ratio(value, 1) ? '#000000' : '#FFFFFF',
  }
}

export function hexToHsv(hex: string): Hsv {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const delta = max - Math.min(r, g, b)
  const hue = delta === 0 ? 0 : max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  return { h: (hue * 60 + 360) % 360, s: max === 0 ? 0 : delta / max * 100, v: max * 100 }
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const hue = ((h % 360) + 360) % 360 / 60
  const sat = Math.min(100, Math.max(0, s)) / 100
  const val = Math.min(100, Math.max(0, v)) / 100
  const c = val * sat
  const x = c * (1 - Math.abs(hue % 2 - 1))
  const rgb = hue < 1 ? [c, x, 0] : hue < 2 ? [x, c, 0] : hue < 3 ? [0, c, x] : hue < 4 ? [0, x, c] : hue < 5 ? [x, 0, c] : [c, 0, x]
  return '#' + rgb.map(channel => Math.round((channel + val - c) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()
}
