'use server'

import { drinkApi, type Drink } from '@entities/drink'
import { reviewApi, type Review } from '@entities/review'

/** Пул напитков и отзывов для рулетки. Грузится на сервере Next, а не из браузера: в проде
 *  `/api` наружу не проксируется (Caddy при DEPLOY_ENV != dev), и запрос из браузера падал в
 *  «Не удалось загрузить напитки». Заодно данные идут через тот же кеш (revalidate 60 с),
 *  что и страницы. */
export async function fetchGachaponPool(): Promise<{ drinks: Drink[]; reviews: Review[] }> {
  const [drinks, reviews] = await Promise.all([drinkApi.list(), reviewApi.list()])
  return { drinks, reviews }
}
