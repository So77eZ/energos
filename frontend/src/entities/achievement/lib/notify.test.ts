import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ach = { id: 'logo-maniac', tier: 'gold', name: 'Логотипоман' } as const

// FEATURES читает env при импорте модуля — для каждого значения флага импортируем заново.
async function loadToastAchievement(flag: string | undefined) {
  vi.resetModules()
  if (flag === undefined) vi.stubEnv('NEXT_PUBLIC_FF_ACHIEVEMENTS', '')
  else vi.stubEnv('NEXT_PUBLIC_FF_ACHIEVEMENTS', flag)
  return (await import('./notify')).toastAchievement
}

describe('toastAchievement', () => {
  const toast = vi.fn()
  const router = { push: vi.fn() }

  beforeEach(() => {
    toast.mockReset()
    router.push.mockReset()
  })
  afterEach(() => vi.unstubAllEnvs())

  it('без флага achievements тост не показывается (вкладки достижений нет)', async () => {
    const toastAchievement = await loadToastAchievement(undefined)
    toastAchievement(ach, { toast, router })
    expect(toast).not.toHaveBeenCalled()
  })

  it('с флагом — тост с названием и действием «Открыть» → вкладка достижений', async () => {
    const toastAchievement = await loadToastAchievement('1')
    toastAchievement(ach, { toast, router })

    expect(toast).toHaveBeenCalledTimes(1)
    const input = toast.mock.calls[0][0]
    expect(input.msg).toContain('Логотипоман')
    input.action.onClick()
    expect(router.push).toHaveBeenCalledWith('/profile?tab=achievements')
  })
})
