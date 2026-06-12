import { describe, it, expect } from 'vitest'
import { pickAvatarColor, AVATAR_COLORS } from './avatar-color'

describe('pickAvatarColor', () => {
  it('детерминирован', () => {
    expect(pickAvatarColor(7)).toBe(pickAvatarColor(7))
    expect(pickAvatarColor('neon_drift')).toBe(pickAvatarColor('neon_drift'))
  })
  it('всегда из палитры', () => {
    for (const seed of [1, 42, 'a', 'volt_x', 'zzz']) expect(AVATAR_COLORS).toContain(pickAvatarColor(seed))
  })
  it('число и строка одного значения дают один цвет', () => {
    expect(pickAvatarColor(7)).toBe(pickAvatarColor('7'))
  })
})
