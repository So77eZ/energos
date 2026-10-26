import { describe, it, expect } from 'vitest'
import { parseMotion } from './constants'

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
