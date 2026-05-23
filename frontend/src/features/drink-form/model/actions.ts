'use server'

import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'
import { drinkApi } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { getToken } from '@shared/lib/session'
import { ROUTES } from '@shared/config/routes'

function requireToken(token: string | null): asserts token is string {
  if (!token) redirect(ROUTES.auth.login)
}

function extractDrinkFields(formData: FormData) {
  return {
    name: formData.get('name') as string,
    price: formData.get('price') ? Number(formData.get('price')) : null,
    no_sugar: formData.get('no_sugar') === 'on',
  }
}

async function uploadImageIfPresent(drinkId: number, formData: FormData, token: string) {
  const file = formData.get('image')
  if (file instanceof File && file.size > 0) {
    await drinkApi.uploadImage(drinkId, file, token)
  }
}

function extractMetrics(formData: FormData) {
  const get = (k: string) => {
    const v = Number(formData.get(k))
    return isNaN(v) ? null : Math.min(5, Math.max(1, v))
  }
  return {
    acidity: get('acidity'),
    sweetness: get('sweetness'),
    concentration: get('concentration'),
    carbonation: get('carbonation'),
    aftertaste: get('aftertaste'),
    price_quality: get('price_quality'),
  }
}

export async function createDrinkAction(formData: FormData) {
  const token = await getToken()
  requireToken(token)

  const drink = await drinkApi.create(extractDrinkFields(formData), token)
  await uploadImageIfPresent(drink.id!, formData, token)
  await upsertAdminReview(drink.id!, formData, token)

  revalidateTag('drinks')
  revalidateTag('reviews')
  redirect(ROUTES.admin.drinks)
}

async function upsertAdminReview(drinkId: number, formData: FormData, token: string) {
  const metrics = extractMetrics(formData)
  // Полная запись разрешена только когда выставлены все 6 метрик —
  // частичный admin-ревью не имеет смысла и ломает агрегацию.
  const allFilled = ['acidity', 'sweetness', 'concentration', 'carbonation', 'aftertaste', 'price_quality']
    .every((k) => metrics[k as keyof typeof metrics] != null)
  if (!allFilled) return

  const existing = (await reviewApi.byDrink(drinkId).catch(() => [])).find((r) => r.from_admin)
  const payload = {
    energy_drink_id: drinkId,
    from_admin: true,
    acidity: metrics.acidity!,
    sweetness: metrics.sweetness!,
    concentration: metrics.concentration!,
    carbonation: metrics.carbonation!,
    aftertaste: metrics.aftertaste!,
    price_quality: metrics.price_quality!,
    comment: null,
  }
  if (existing) {
    await reviewApi.update(existing.id, { ...payload, user_id: existing.user_id ?? undefined }, token)
  } else {
    await reviewApi.create(payload, token)
  }
}

export async function updateDrinkAction(id: number, formData: FormData) {
  const token = await getToken()
  requireToken(token)

  await drinkApi.update(id, extractDrinkFields(formData), token)
  await uploadImageIfPresent(id, formData, token)
  await upsertAdminReview(id, formData, token)

  revalidateTag('drinks')
  revalidateTag('reviews')
  redirect(ROUTES.admin.drinks)
}

export async function deleteDrinkAction(id: number) {
  const token = await getToken()
  requireToken(token)

  await drinkApi.remove(id, token)
  revalidateTag('drinks')
  revalidateTag('reviews')
  redirect(ROUTES.admin.drinks)
}
