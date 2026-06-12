import { describe, it, expect } from 'vitest'
import { identiconData, AVATAR_PRESET_SEEDS } from './avatar-identicon'

// Тестируем ЧИСТУЮ детерминированную часть (identiconData). makeIdenticon (canvas+toDataURL)
// в jsdom не рисует — проверяется визуально (T9). Детерминизм/уникальность — здесь.
describe('avatar-identicon', () => {
  it('identiconData детерминирован по seed', () => {
    expect(identiconData('neon_drift')).toEqual(identiconData('neon_drift'))
  })
  it('разные seed → разный результат', () => {
    expect(identiconData('a_seed_one')).not.toEqual(identiconData('b_seed_two'))
  })
  it('структура: 2 цвета + 3×6 матрица из 0|1|2', () => {
    const d = identiconData('volt_x')
    expect(d.ca).toMatch(/^#/)
    expect(d.cb).toMatch(/^#/)
    expect(d.ca).not.toBe(d.cb)
    expect(d.cells).toHaveLength(3)
    expect(d.cells[0]).toHaveLength(6)
    for (const row of d.cells) for (const v of row) expect([0, 1, 2]).toContain(v)
  })
  it('пресет-сиды непусты и уникальны', () => {
    expect(AVATAR_PRESET_SEEDS.length).toBeGreaterThan(0)
    expect(new Set(AVATAR_PRESET_SEEDS).size).toBe(AVATAR_PRESET_SEEDS.length)
  })
})
