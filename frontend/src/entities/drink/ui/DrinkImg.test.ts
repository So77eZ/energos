import { describe, it, expect } from 'vitest'
import { drinkImgSources } from './DrinkImg'

describe('drinkImgSources', () => {
  it('картинка напитка — через оптимизатор Next, копии 1× и 2×', () => {
    const { src, srcSet } = drinkImgSources('/drink-image/5', 96)
    expect(src).toContain('/_next/image?url=%2Fdrink-image%2F5&w=')
    expect(srcSet).toMatch(/w=96&q=75 1x, .*w=256&q=75 2x$/)
  })

  it('версия картинки (?v=) остаётся в адресе для оптимизатора', () => {
    const { src } = drinkImgSources('/drink-image/5?v=1792000000000', 96)
    expect(src).toContain('url=%2Fdrink-image%2F5%3Fv%3D1792000000000&w=')
  })

  it('превью из формы (blob:) и прочие адреса — как есть', () => {
    expect(drinkImgSources('blob:http://localhost/abc', 96)).toEqual({ src: 'blob:http://localhost/abc' })
    expect(drinkImgSources('/drink-image/5?x=1', 96)).toEqual({ src: '/drink-image/5?x=1' })
  })
})
