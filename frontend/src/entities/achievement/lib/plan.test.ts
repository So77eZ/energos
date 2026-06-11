import { describe, it, expect } from 'vitest'
import { planUnlockToasts } from './plan'
import type { EvaluatedAchievement } from '../model/types'

const ach = (id: string, unlocked: boolean) => ({ id, unlocked }) as unknown as EvaluatedAchievement
const EV = [ach('a', true), ach('b', false), ach('c', true)]

describe('planUnlockToasts', () => {
  it('seeded=false → silent seed без тостов', () => {
    const p = planUnlockToasts(EV, [], false)
    expect(p.toToast).toEqual([])
    expect(p.nextSeen.sort()).toEqual(['a', 'c'])
  })
  it('seeded=false сохраняет уже известные id (egg pre-pop) + сидит остальное молча', () => {
    const p = planUnlockToasts(EV, ['pathfinder'], false)
    expect(p.toToast).toEqual([])
    expect(p.nextSeen.sort()).toEqual(['a', 'c', 'pathfinder'])
  })
  it('seeded=true → новые unlocked, которых нет в seen', () => {
    const p = planUnlockToasts(EV, ['a'], true)
    expect(p.toToast).toEqual(['c'])
    expect(p.nextSeen.sort()).toEqual(['a', 'c'])
  })
  it('seeded=true, ничего нового → пусто', () => {
    expect(planUnlockToasts(EV, ['a', 'c'], true).toToast).toEqual([])
  })
  it('nextSeen сохраняет старые seen даже если уже не unlocked', () => {
    const p = planUnlockToasts([ach('a', false)], ['a', 'x'], true)
    expect(p.toToast).toEqual([])
    expect(p.nextSeen.sort()).toEqual(['a', 'x'])
  })
})
