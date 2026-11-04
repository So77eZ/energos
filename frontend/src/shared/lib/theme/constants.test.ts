import { describe, it, expect } from 'vitest'
import { parseMotion, parseTint } from './constants'

it('ограничивает подмес и безопасно читает старые настройки', () => {
  expect([undefined, '7', NaN, -2, 7.4, 27].map(parseTint)).toEqual([0, 0, 0, 0, 7, 20])
})

describe('parseMotion', () => {
  it('новые значения как есть', () => {
    expect(parseMotion('on')).toBe('on')
    expect(parseMotion('off')).toBe('off')
  })

  it('старые: «Всегда вкл.» → вкл., «По системе» → не выбрано (следовать системе)', () => {
    expect(parseMotion('always')).toBe('on')
    expect(parseMotion('system')).toBeNull()
  })

  it('нет значения или мусор → не выбрано', () => {
    expect(parseMotion(undefined)).toBeNull()
    expect(parseMotion(42)).toBeNull()
  })
})
