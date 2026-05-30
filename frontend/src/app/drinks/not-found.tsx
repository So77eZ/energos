import Link from 'next/link'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'

export const metadata = { title: 'Напиток не найден — Energos' }

export default function DrinkNotFound() {
  return (
    <div className="page">
      <div className="empty" style={{ padding: '80px 20px' }}>
        <Icons.beaker />
        <h1 className="page-title" style={{ marginTop: 12 }}>Напиток не найден</h1>
        <p className="page-blurb">
          Такого энергетика нет в каталоге — возможно, ссылка устарела или его удалили.
        </p>
        <Link href={ROUTES.home} className="cta-primary" style={{ marginTop: 16 }}>
          <Icons.arrowL w={14} /> В каталог
        </Link>
      </div>
    </div>
  )
}
