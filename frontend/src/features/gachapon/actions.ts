'use server'

import { drinkApi, type Drink } from '@entities/drink'

/** Пул напитков для рулетки (с рейтингами: они приходят в `drink.stats`). Грузится на сервере
 *  Next, а не из браузера: в проде `/api` наружу не проксируется (Caddy при DEPLOY_ENV != dev),
 *  и запрос из браузера падал в «Не удалось загрузить напитки». Заодно данные идут через тот же
 *  кеш (revalidate 60 с), что и страницы. */
export async function fetchGachaponPool(): Promise<Drink[]> {
  return drinkApi.list()
}
