import { describe, it, expect } from 'vitest'
import { stepSpin, registerBurst, evaluateCanBadges, SPIN, FAST_SPIN_MS, CASCADE_TARGET, CASCADE_GAP } from './can-core'

describe('stepSpin', () => {
  it('один клик: omega бампает, но не достигает BURST_AT и стрётся назад к idle', () => {
    let s = { omega: 1, accel: SPIN.CLICK_KICK } // эффект одного клика
    let peak = 1
    for (let i = 0; i < 600; i++) {        // ~10с по 1/60
      s = stepSpin(s, 1 / 60)
      peak = Math.max(peak, s.omega)
    }
    expect(peak).toBeLessThan(SPIN.BURST_AT) // одного клика мало для взрыва
    expect(s.omega).toBeLessThan(2)          // вернулась почти в idle
  })

  it('серия частых кликов пересекает BURST_AT', () => {
    let s = { omega: 1, accel: 0 }
    let burst = false
    for (let i = 0; i < 30; i++) {
      s = { ...s, accel: s.accel + SPIN.CLICK_KICK } // клик каждый кадр
      s = stepSpin(s, 1 / 60)
      if (s.omega >= SPIN.BURST_AT) { burst = true; break }
    }
    expect(burst).toBe(true)
  })

  it('accel затухает демпфером к 0 без новых кликов', () => {
    const after = stepSpin({ omega: 1, accel: 100 }, 1) // 1 секунда
    expect(after.accel).toBeLessThan(100 * Math.exp(-SPIN.DAMP) + 0.001)
    expect(after.accel).toBeGreaterThan(0)
  })

  it('omega не опускается ниже 1 (idle-пол)', () => {
    expect(stepSpin({ omega: 1, accel: 0 }, 1 / 60).omega).toBe(1)
  })
})

describe('registerBurst', () => {
  const S0 = { bursts: 0, bestSpinUpMs: null, maxCascade: 0 }
  const RT0 = { prevBurstAt: null, currentCascade: 0 }

  it('первый взрыв: bursts=1, bestSpinUpMs зафиксирован, каскад=1', () => {
    const r = registerBurst(S0, RT0, { spinUpMs: 1500, now: 1000 })
    expect(r.state.bursts).toBe(1)
    expect(r.state.bestSpinUpMs).toBe(1500)
    expect(r.state.maxCascade).toBe(1)
    expect(r.runtime.currentCascade).toBe(1)
    expect(r.runtime.prevBurstAt).toBe(1000)
  })

  it('взрыв в окне CASCADE_GAP инкрементит каскад; bestSpinUpMs берёт минимум', () => {
    const r1 = registerBurst(S0, RT0, { spinUpMs: 1500, now: 1000 })
    const r2 = registerBurst(r1.state, r1.runtime, { spinUpMs: 3000, now: 1000 + CASCADE_GAP })
    expect(r2.runtime.currentCascade).toBe(2)
    expect(r2.state.maxCascade).toBe(2)
    expect(r2.state.bestSpinUpMs).toBe(1500) // 3000 не лучше
  })

  it('взрыв позже окна ресетит каскад на 1, maxCascade сохраняется', () => {
    const r1 = registerBurst(S0, RT0, { spinUpMs: 1500, now: 1000 })
    const r2 = registerBurst(r1.state, r1.runtime, { spinUpMs: 1200, now: 1000 + CASCADE_GAP })
    const r3 = registerBurst(r2.state, r2.runtime, { spinUpMs: 900, now: 1000 + CASCADE_GAP * 5 })
    expect(r3.runtime.currentCascade).toBe(1)
    expect(r3.state.maxCascade).toBe(2)
    expect(r3.state.bestSpinUpMs).toBe(900)
  })
})

describe('evaluateCanBadges', () => {
  it('пороги: bursts→canBursts, fast spin→canFastSpin, каскад→canCascade', () => {
    expect(evaluateCanBadges({ bursts: 7, bestSpinUpMs: 2500, maxCascade: 2 }))
      .toEqual({ canBursts: 7, canFastSpin: 0, canCascade: 0 })
    expect(evaluateCanBadges({ bursts: 12, bestSpinUpMs: FAST_SPIN_MS, maxCascade: CASCADE_TARGET }))
      .toEqual({ canBursts: 12, canFastSpin: 1, canCascade: 1 })
  })

  it('bestSpinUpMs=null → canFastSpin 0', () => {
    expect(evaluateCanBadges({ bursts: 0, bestSpinUpMs: null, maxCascade: 0 }).canFastSpin).toBe(0)
  })
})
