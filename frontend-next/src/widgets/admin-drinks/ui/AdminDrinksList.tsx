'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import type { Drink } from '@entities/drink'
import { ROUTES } from '@shared/config/routes'
import { deleteDrinkAction } from '@features/drink-form/model/actions'
import { useCatalogSearch } from '@shared/lib/catalog-search'

interface AdminDrinksListProps {
  drinks: Drink[]
}

export function AdminDrinksList({ drinks: allDrinks }: AdminDrinksListProps) {
  const { search } = useCatalogSearch()
  const filtered = allDrinks.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
        <h1 className="text-lg font-bold text-[#f0f0f5] shrink-0">Управление</h1>
        <Link
          href={ROUTES.admin.newDrink}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-blue/20 border border-neon-blue/50 rounded-lg text-sm font-semibold text-neon-cyan hover:bg-neon-blue/30 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Добавить</span>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#9090a8] py-10 text-center text-sm">
          {search ? 'Ничего не найдено.' : 'Напитков пока нет.'}
        </p>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[#9090a8] text-left">
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Цена</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Без сахара</th>
                <th className="px-4 py-3 font-medium w-24">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((drink) => (
                <DrinkRow key={drink.id} drink={drink} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function DrinkRow({ drink }: { drink: Drink }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Удалить «${drink.name}»?`)) return
    startTransition(() => { deleteDrinkAction(drink.id) })
  }

  return (
    <tr className={`border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors ${isPending ? 'opacity-40' : ''}`}>
      <td className="px-4 py-3 text-[#f0f0f5]">{drink.name}</td>
      <td className="px-4 py-3 text-neon-pink hidden sm:table-cell">
        {drink.price != null ? `${drink.price.toFixed(2)} ₽` : '—'}
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        {drink.no_sugar
          ? <span className="text-neon-green text-xs">Да</span>
          : <span className="text-[#9090a8] text-xs">Нет</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.admin.editDrink(drink.id)}
            className="p-1.5 rounded text-[#9090a8] hover:text-neon-cyan hover:bg-white/5 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1.5 rounded text-neon-red/70 hover:text-neon-red hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
