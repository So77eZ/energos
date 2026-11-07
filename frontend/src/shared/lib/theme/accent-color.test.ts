import { describe, expect, it } from 'vitest'
import { getAccentColors, hexToHsv, hsvToHex, normalizeHex } from './accent-color'

function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const [r, g, blue] = [1, 3, 5].map(i => {
      const channel = parseInt(hex.slice(i, i + 2), 16) / 255
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
    return r * 0.2126 + g * 0.7152 + blue * 0.0722
  }
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

it('принимает только непрозрачный HEX и нормализует короткую запись', () => {
  expect(normalizeHex('  #aB3  ')).toBe('#AABB33')
  expect(normalizeHex('#123456')).toBe('#123456')
  for (const input of [null, 42, '', 'red', 'rgb(1,2,3)', '#1234', '#12345678', '#GG0000']) {
    expect(normalizeHex(input)).toBeNull()
  }
})

describe('цветовые роли', () => {
  for (const theme of ['dark', 'light'] as const) {
    it(`сохраняет заливку и обеспечивает контраст в ${theme}`, () => {
      const background = theme === 'dark' ? '#565666' : '#A7AFBD'
      for (const r of [0, 64, 128, 192, 255]) {
        for (const g of [0, 64, 128, 192, 255]) {
          for (const b of [0, 64, 128, 192, 255]) {
            const source = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase()
            const colors = getAccentColors(source, theme)
            expect(colors.fill).toBe(source)
            expect(colors.rgb).toBe(`${r},${g},${b}`)
            expect(contrast(colors.ink, colors.fill)).toBeGreaterThanOrEqual(4.5)
            expect(contrast(colors.foreground, background)).toBeGreaterThanOrEqual(4.5)
          }
        }
      }
    })
  }

  it('не меняет точный цвет заливки при приглушении светлой темы', () => {
    const colors = getAccentColors('#FF00FF', 'light', true)
    expect(colors.fill).toBe('#FF00FF')
    expect(contrast(colors.foreground, '#A7AFBD')).toBeGreaterThanOrEqual(4.5)
  })
})

it('переводит HSV и HEX без потери исходного цвета', () => {
  for (const hex of ['#000000', '#FFFFFF', '#808080', '#FF0000', '#123456', '#00E5FF', '#12001F']) {
    expect(hsvToHex(hexToHsv(hex))).toBe(hex)
  }
  expect(hsvToHex({ h: 360, s: 100, v: 100 })).toBe('#FF0000')
  expect(hsvToHex({ h: 120, s: 100, v: 100 })).toBe('#00FF00')
})
