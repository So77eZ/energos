import { describe, it, expect } from 'vitest'
import { isActive, NAV_ITEMS, MOBILE_TABS, navItemsFor, sheetItemsFor } from './nav-items'

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

describe('sheetItemsFor', () => {
  it('исключает разделы, которые есть в bottom-tabs', () => {
    const hrefs = sheetItemsFor(false).map((i) => i.href)
    // Каталог и Сравнение — табы, их не должно быть в sheet
    expect(hrefs).not.toContain('/')
    expect(hrefs.some((h) => h.startsWith('/compare'))).toBe(false)
  })
  it('включает не-таб разделы (Tier, Словарь, Отзывы, Предложить)', () => {
    const labels = sheetItemsFor(false).map((i) => i.label)
    expect(labels).toContain('Tier list')
    expect(labels).toContain('Словарь')
  })
  it('admin-пункт только при isAdmin', () => {
    expect(sheetItemsFor(false).some((i) => i.adminOnly)).toBe(false)
    expect(sheetItemsFor(true).some((i) => i.adminOnly)).toBe(true)
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
