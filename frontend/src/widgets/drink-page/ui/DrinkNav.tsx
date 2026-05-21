'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Drink } from '@entities/drink'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'

interface DrinkNavProps {
  drinks: Drink[]
  activeId: number
}

export function DrinkNav({ drinks, activeId }: DrinkNavProps) {
  const router = useRouter()
  const idx = drinks.findIndex((d) => d.id === activeId)
  const total = drinks.length
  const prev = total > 0 ? drinks[(idx - 1 + total) % total] : null
  const next = total > 0 ? drinks[(idx + 1) % total] : null

  return (
    <div className="drink-nav">
      <Link href={ROUTES.home} className="dn-back">
        <Icons.arrowL /> Каталог
      </Link>
      {total > 1 && (
        <div className="dn-arrows">
          <button
            type="button"
            onClick={() => prev && router.push(ROUTES.reviews(prev.id))}
            title={prev?.name}
            aria-label="Предыдущий напиток"
            disabled={!prev}
          >
            <Icons.arrowL />
          </button>
          <span className="dn-counter">{idx + 1} / {total}</span>
          <button
            type="button"
            onClick={() => next && router.push(ROUTES.reviews(next.id))}
            title={next?.name}
            aria-label="Следующий напиток"
            disabled={!next}
          >
            <Icons.arrow />
          </button>
        </div>
      )}
    </div>
  )
}
