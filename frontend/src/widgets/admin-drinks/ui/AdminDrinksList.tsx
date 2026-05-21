'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useTransition } from 'react'
import {
  cleanDrinkName,
  EnergyCan,
  enrichDrinks,
  isFreshDrink,
  TierBadge,
} from '@entities/drink'
import type { Drink } from '@entities/drink'
import type { Review } from '@entities/review'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'
import { useCatalogSearch } from '@shared/lib/catalog-search'
import { deleteDrinkAction } from '@features/drink-form/model/actions'

interface AdminDrinksListProps {
  drinks: Drink[]
  reviewsCount: number
}

export function AdminDrinksList({ drinks, reviewsCount }: AdminDrinksListProps) {
  const { search } = useCatalogSearch()
  const enriched = useMemo(() => enrichDrinks(drinks, []), [drinks])

  const filtered = enriched.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  )

  const totalCount = drinks.length
  const freshCount = drinks.filter((d) => isFreshDrink(d.created_at)).length
  const noSugarCount = drinks.filter((d) => d.no_sugar).length

  return (
    <div className="page page-admin">
      <div className="adm-head">
        <div>
          <div className="page-eyebrow">УПРАВЛЕНИЕ · ADMIN</div>
          <h1 className="page-title">Каталог напитков</h1>
          <p className="page-blurb">
            Добавление, редактирование и удаление позиций. Только администраторы.
          </p>
        </div>
        <Link href={ROUTES.admin.newDrink} className="cta-primary">
          <Icons.plus /> Добавить напиток
        </Link>
      </div>

      <div className="adm-stats">
        <div className="stat-card stat-cyan">
          <div className="stat-icon"><Icons.pkg /></div>
          <div className="stat-lbl">ВСЕГО ПОЗИЦИЙ</div>
          <div className="stat-val">{totalCount}</div>
          <div className="stat-sub">в каталоге</div>
          <div className="stat-corner" />
        </div>
        <div className="stat-card stat-amber">
          <div className="stat-icon"><Icons.flame /></div>
          <div className="stat-lbl">НОВЫЕ</div>
          <div className="stat-val">{freshCount}</div>
          <div className="stat-sub">за 14 дней</div>
          <div className="stat-corner" />
        </div>
        <div className="stat-card stat-lime">
          <div className="stat-icon"><Icons.candyOff /></div>
          <div className="stat-lbl">БЕЗ САХАРА</div>
          <div className="stat-val">{noSugarCount}</div>
          <div className="stat-sub">zero-sugar</div>
          <div className="stat-corner" />
        </div>
        <div className="stat-card stat-pink">
          <div className="stat-icon"><Icons.msg /></div>
          <div className="stat-lbl">ВСЕГО ОТЗЫВОВ</div>
          <div className="stat-val">{reviewsCount}</div>
          <div className="stat-sub">в базе</div>
          <div className="stat-corner" />
        </div>
      </div>

      <div className="adm-list">
        <div className="adm-list-head">
          <span>СПИСОК НАПИТКОВ</span>
          <div className="adm-list-tools">
            <span className="tm-dim">{filtered.length} {filtered.length === totalCount ? '· всего' : `/ ${totalCount}`}</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty" style={{ padding: '60px 20px' }}>
            <Icons.beaker />
            <p>{search ? 'Ничего не найдено по поиску.' : 'Напитков пока нет.'}</p>
          </div>
        ) : (
          <div className="adm-rows">
            {filtered.map((drink) => (
              <DrinkRow key={drink.id} drink={drink} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DrinkRow({ drink }: { drink: ReturnType<typeof enrichDrinks>[number] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const cleanedName = cleanDrinkName(drink.name)
  const editHref = ROUTES.admin.editDrink(drink.id)

  function openEdit() {
    router.push(editHref)
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Удалить «${drink.name}»?`)) return
    startTransition(() => {
      deleteDrinkAction(drink.id)
    })
  }

  return (
    <div
      className="adm-row"
      style={{ opacity: isPending ? 0.4 : 1, cursor: 'pointer' }}
      role="link"
      tabIndex={0}
      onClick={openEdit}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openEdit()}
    >
      <div className="adm-row-can">
        {drink.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={drink.image_url} alt={drink.name} style={{ maxHeight: 60, width: 'auto', objectFit: 'contain' }} />
        ) : (
          <EnergyCan can={drink.can} w={36} h={78} />
        )}
      </div>

      <div className="adm-row-info">
        <div className="adm-row-name">{cleanedName}</div>
        <div className="adm-row-meta">
          {drink.price != null && (
            <span style={{ color: 'var(--c-pink)' }}>{drink.price.toFixed(2)} ₽</span>
          )}
        </div>
      </div>

      <div className="adm-row-tags">
        {drink.tier && <TierBadge tier={drink.tier} size="xs" />}
        {drink.no_sugar && <span className="micro-tag micro-lime">ZERO</span>}
        {drink.isNew && <span className="micro-tag micro-amber">NEW</span>}
      </div>

      <div className="adm-row-actions" onClick={(e) => e.stopPropagation()}>
        <Link href={editHref} aria-label="Редактировать">
          <Icons.edit w={14} />
        </Link>
        <button
          type="button"
          className="adm-danger"
          aria-label="Удалить"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Icons.trash w={14} />
        </button>
      </div>
    </div>
  )
}
