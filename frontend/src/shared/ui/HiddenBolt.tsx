'use client'

import { useEasterEggs } from '@shared/lib/easter-eggs'
import { Icons } from '@shared/ui/icons'

/** Спрятанная коллекционная молния. Не рендерится, если уже собрана. */
export function HiddenBolt({ id }: { id: string }) {
  const { collect, found, hydrated } = useEasterEggs()
  // До чтения localStorage не рендерим — иначе собранные молнии мелькают и исчезают.
  if (!hydrated || found(id)) return null
  return (
    <button
      type="button"
      className="egg-bolt"
      aria-hidden="true"
      tabIndex={-1}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); collect(id) }}
    >
      <Icons.bolt w={14} />
    </button>
  )
}
