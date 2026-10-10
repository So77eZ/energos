import type { Achievement, EvaluatedAchievement } from '../model/types'
import { ACHIEVEMENT_BY_ID } from '../model/achievements'
import { Medal } from '../ui/Medal'
import { ROUTES } from '@shared/config/routes'
import { FEATURES } from '@shared/config/features'
import type { ToastInput } from '@shared/lib/toast'
import { planUnlockToasts } from './plan'
import { readSeen, writeSeen, isSeeded, markSeeded } from './seen'

interface ToastDeps {
  toast: (input: ToastInput | string) => number
  router: { push: (href: string) => void }
}

/** Один тост ачивки: медаль + текст + клик «Открыть» → таб достижений.
 *  Без флага achievements вкладки достижений в профиле нет, и тост вёл бы в никуда. Секретные
 *  достижения (пасхалки) вызывают его напрямую, поэтому гейт здесь, в одной точке. */
export function toastAchievement(ach: Pick<Achievement, 'id' | 'tier' | 'name'>, { toast, router }: ToastDeps): void {
  if (!FEATURES.achievements) return
  toast({
    msg: `Достижение разблокировано: ${ach.name}`,
    kind: 'ok',
    ttl: 5000,
    icon: <Medal badge={ach} size="sm" />,
    action: { label: 'Открыть', onClick: () => router.push(`${ROUTES.profile}?tab=achievements`) },
  })
}

/** Diff vs seen-set → тост на каждый новый анлок; первый запуск — silent seed. */
export function notifyUnlocks(evaluated: EvaluatedAchievement[], deps: ToastDeps): void {
  const seeded = isSeeded()
  const { toToast, nextSeen } = planUnlockToasts(evaluated, readSeen(), seeded)
  for (const id of toToast) {
    const ach = ACHIEVEMENT_BY_ID[id]
    if (ach) toastAchievement(ach, deps)
  }
  writeSeen(nextSeen)
  if (!seeded) markSeeded()
}
