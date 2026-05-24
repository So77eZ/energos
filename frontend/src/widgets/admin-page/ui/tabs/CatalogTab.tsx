'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useTransition } from 'react'
import {
  cleanDrinkName,
  EnergyCan,
  enrichDrinks,
  TierBadge,
} from '@entities/drink'
import type { Drink, EnrichedDrink } from '@entities/drink'
import { deleteDrinkAction } from '@features/drink-form/model/actions'
import { ROUTES } from '@shared/config/routes'
import { useCatalogSearch } from '@shared/lib/catalog-search'
import { useConfirm } from '@shared/lib/confirm'
import { useToast } from '@shared/lib/toast'
import { Icons } from '@shared/ui/icons'

interface CatalogTabProps {
  drinks: Drink[]
}

export function CatalogTab({ drinks }: CatalogTabProps) {
  const { search } = useCatalogSearch()
  const enriched = useMemo(() => enrichDrinks(drinks, []), [drinks])
  const filtered = enriched.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  )
  const totalCount = drinks.length

  return (
    <>
      <div className="adm-cat-head">
        <Link href={ROUTES.admin.newDrink} className="cta-primary">
          <Icons.plus /> Добавить напиток
        </Link>
      </div>

      <div className="adm-list">
        <div className="adm-list-head">
          <span>СПИСОК НАПИТКОВ</span>
          <div className="adm-list-tools">
            <span className="tm-dim">
              {filtered.length} {filtered.length === totalCount ? '· всего' : `/ ${totalCount}`}
            </span>
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
    </>
  )
}

function DrinkRow({ drink }: { drink: EnrichedDrink }) {
  const router = useRouter()
  const confirm = useConfirm()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const cleanedName = cleanDrinkName(drink.name)
  const editHref = ROUTES.admin.editDrink(drink.id)

  function openEdit() {
    router.push(editHref)
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const ok = await confirm({
      title: 'Удалить напиток?',
      body: `«${cleanedName}» и все привязанные отзывы будут безвозвратно удалены.`,
      confirmLabel: 'Удалить',
      danger: true,
    })
    if (!ok) return
    startTransition(() => {
      deleteDrinkAction(drink.id)
      toast({ kind: 'ok', msg: `«${cleanedName}» удалён` })
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
