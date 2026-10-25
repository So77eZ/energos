import { describe, it, expect } from 'vitest'
import { collectLightning, allLightningFound, lightningProgressMsg, LIGHTNING_IDS, type EggState } from './eggs-storage'

const base: EggState = { logoClicks: 0, lightning: [] }

describe('collectLightning', () => {
  it('добавляет валидный id', () => {
    const s = collectLightning(base, LIGHTNING_IDS[0])
    expect(s.lightning).toEqual([LIGHTNING_IDS[0]])
  })
  it('дедуп: повтор не множит', () => {
    const s1 = collectLightning(base, LIGHTNING_IDS[0])
    const s2 = collectLightning(s1, LIGHTNING_IDS[0])
    expect(s2.lightning).toHaveLength(1)
  })
  it('невалидный id игнорируется', () => {
    expect(collectLightning(base, 'nope').lightning).toHaveLength(0)
  })
})

describe('allLightningFound', () => {
  it('false пока не все', () => {
    expect(allLightningFound({ ...base, lightning: LIGHTNING_IDS.slice(0, 9) })).toBe(false)
  })
  it('true при всех 10', () => {
    expect(allLightningFound({ ...base, lightning: [...LIGHTNING_IDS] })).toBe(true)
  })
})

describe('lightningProgressMsg', () => {
  it('прогресс, остаток и награда', () => {
    expect(lightningProgressMsg(3, 'Следопыт')).toBe('Молния 3/10 — осталось найти 7. Собери все и получишь «Следопыт»')
  })
})

describe('LIGHTNING_IDS', () => {
  it('нет молнии на странице заявок — она выключена флагом и отдаёт 404', () => {
    expect(LIGHTNING_IDS).not.toContain('submit')
  })
})
