import { describe, expect, it, vi } from 'vitest'
import { scaledSize, shrinkToFit } from './compress-image'

const blob = (size: number) => new Blob([new Uint8Array(size)])

describe('scaledSize', () => {
  it('вписывает по длинной стороне, пропорции сохраняются', () => {
    expect(scaledSize(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 })
    expect(scaledSize(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 })
  })

  it('маленькую картинку не увеличивает', () => {
    expect(scaledSize(800, 600, 1600)).toEqual({ width: 800, height: 600 })
  })
})

describe('shrinkToFit', () => {
  it('берёт первый шаг, который укладывается в лимит', async () => {
    const encode = vi.fn().mockResolvedValueOnce(blob(500))
    expect((await shrinkToFit(encode, 1000))?.size).toBe(500)
    expect(encode).toHaveBeenCalledTimes(1)
    expect(encode).toHaveBeenCalledWith(1600, 0.85)
  })

  it('не уложились — уменьшает сильнее', async () => {
    const encode = vi.fn().mockResolvedValueOnce(blob(2000)).mockResolvedValueOnce(blob(900))
    expect((await shrinkToFit(encode, 1000))?.size).toBe(900)
    expect(encode).toHaveBeenNthCalledWith(2, 1200, 0.8)
  })

  it('не уложились ни на одном шаге (или кодек отказал) — null', async () => {
    const encode = vi.fn().mockResolvedValueOnce(blob(5000)).mockResolvedValueOnce(null).mockResolvedValueOnce(blob(1500))
    expect(await shrinkToFit(encode, 1000)).toBeNull()
    expect(encode).toHaveBeenCalledTimes(3)
  })
})
