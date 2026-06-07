import { describe, it, expect } from 'vitest'
import { planUnlockToasts } from './plan'
import type { EvaluatedAchievement } from '@entities/achievement'

const ach = (id: string, unlocked: boolean) => ({ id, unlocked }) as unknown as EvaluatedAchievement
const EV = [ach('a', true), ach('b', false), ach('c', true)]

describe('planUnlockToasts', () => {
  it('seen===null → seed без тостов', () => {
    const p = planUnlockToasts(EV, null)
    expect(p.toToast).toEqual([])
    expect(p.nextSeen.sort()).toEqual(['a', 'c'])
  })
  it('diff: новые unlocked, которых нет в seen', () => {
    const p = planUnlockToasts(EV, ['a'])
    expect(p.toToast).toEqual(['c'])
    expect(p.nextSeen.sort()).toEqual(['a', 'c'])
  })
  it('ничего нового → toToast пуст', () => {
    expect(planUnlockToasts(EV, ['a', 'c']).toToast).toEqual([])
  })
  it('nextSeen сохраняет старые seen даже если уже не unlocked', () => {
    const p = planUnlockToasts([ach('a', false)], ['a', 'x'])
    expect(p.toToast).toEqual([])
    expect(p.nextSeen.sort()).toEqual(['a', 'x'])
  })
})
