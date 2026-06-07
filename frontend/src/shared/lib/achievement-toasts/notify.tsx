import type { Achievement, EvaluatedAchievement } from '@entities/achievement'
import { ACHIEVEMENT_BY_ID, Medal } from '@entities/achievement'
import { ROUTES } from '@shared/config/routes'
import type { ToastInput } from '@shared/lib/toast'
import { planUnlockToasts } from './plan'
import { readSeen, writeSeen } from './seen'

interface ToastDeps {
  toast: (input: ToastInput | string) => number
  router: { push: (href: string) => void }
}

/** Один тост ачивки: медаль + текст + клик «Открыть» → таб достижений. */
export function toastAchievement(ach: Pick<Achievement, 'id' | 'tier' | 'name'>, { toast, router }: ToastDeps): void {
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
  const { toToast, nextSeen } = planUnlockToasts(evaluated, readSeen())
  for (const id of toToast) {
    const ach = ACHIEVEMENT_BY_ID[id]
    if (ach) toastAchievement(ach, deps)
  }
  writeSeen(nextSeen)
}
