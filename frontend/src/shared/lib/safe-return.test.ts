import { describe, it, expect } from 'vitest'
import { safeReturnPath, returnPathFromReferer } from './safe-return'

describe('safeReturnPath', () => {
  it('валидный относительный путь — как есть', () => {
    expect(safeReturnPath('/drinks?id=5')).toBe('/drinks?id=5')
    expect(safeReturnPath('/tier')).toBe('/tier')
    expect(safeReturnPath('/foo')).toBe('/foo')
  })
  it('null/undefined/пустая → /', () => {
    expect(safeReturnPath(null)).toBe('/')
    expect(safeReturnPath(undefined)).toBe('/')
    expect(safeReturnPath('')).toBe('/')
  })
  it('не-/ начало (абсолютный URL) → /', () => {
    expect(safeReturnPath('https://evil.com')).toBe('/')
    expect(safeReturnPath('evil')).toBe('/')
  })
  it('protocol-relative //host и /\\host → /', () => {
    expect(safeReturnPath('//evil.com')).toBe('/')
    expect(safeReturnPath('/\\evil.com')).toBe('/')
  })
  it('control-байты (таб/перевод строки) → /', () => {
    expect(safeReturnPath('/foo\tbar')).toBe('/')
    expect(safeReturnPath('/foo\nbar')).toBe('/')
  })
  it('/javascript: и прочие /scheme: → /', () => {
    expect(safeReturnPath('/javascript:alert(1)')).toBe('/')
    expect(safeReturnPath('/data:text/html')).toBe('/')
  })
})

describe('returnPathFromReferer', () => {
  const own = 'https://own.app'
  it('свой origin → относительный path+search', () => {
    expect(returnPathFromReferer('https://own.app/tier?x=1', own)).toBe('/tier?x=1')
    expect(returnPathFromReferer('https://own.app/drinks?id=5', own)).toBe('/drinks?id=5')
  })
  it('чужой origin → / (не утечь)', () => {
    expect(returnPathFromReferer('https://evil.com/tier', own)).toBe('/')
  })
  it('null / мусор → /', () => {
    expect(returnPathFromReferer(null, own)).toBe('/')
    expect(returnPathFromReferer('не-url', own)).toBe('/')
  })
})
