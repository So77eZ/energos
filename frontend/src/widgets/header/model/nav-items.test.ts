import { describe, it, expect } from 'vitest'
import { isActive, NAV_ITEMS, MOBILE_TABS, navItemsFor } from './nav-items'

describe('isActive', () => {
  it('корень совпадает только точно', () => {
    expect(isActive('/', '/')).toBe(true)
    expect(isActive('/tier', '/')).toBe(false)
  })
  it('точное совпадение раздела', () => {
    expect(isActive('/tier', '/tier')).toBe(true)
  })
  it('вложенный путь активирует раздел', () => {
    expect(isActive('/admin/drinks/5/edit', '/admin/drinks')).toBe(true)
  })
  it('игнорирует query в href', () => {
    expect(isActive('/compare', '/compare')).toBe(true)
  })
  it('чужой раздел не активен', () => {
    expect(isActive('/glossary', '/tier')).toBe(false)
  })
})

describe('navItemsFor', () => {
  it('гость не видит admin-пункт', () => {
    expect(navItemsFor(false).some((i) => i.adminOnly)).toBe(false)
  })
  it('admin видит admin-пункт', () => {
    expect(navItemsFor(true).some((i) => i.adminOnly)).toBe(true)
  })
})

describe('конфиг', () => {
  it('mobile-табов ровно 4', () => {
    expect(MOBILE_TABS).toHaveLength(4)
  })
  it('NAV_ITEMS: «Предложить» в хвосте перед admin (низкий приоритет)', () => {
    const labels = NAV_ITEMS.map((i) => i.label)
    expect(labels.indexOf('Предложить')).toBeGreaterThan(labels.indexOf('Каталог'))
  })
})
