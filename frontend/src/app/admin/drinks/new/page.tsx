import { redirect } from 'next/navigation'
import { getToken } from '@shared/lib/session'
import { DrinkForm } from '@features/drink-form/ui/DrinkForm'
import { createDrinkAction } from '@features/drink-form/model/actions'
import { ROUTES } from '@shared/config/routes'

export const metadata = { title: 'Новый напиток — Energos' }

export default async function NewDrinkPage() {
  const token = await getToken()
  if (!token) redirect(ROUTES.auth.login)

  return <DrinkForm mode="create" action={createDrinkAction} />
}
