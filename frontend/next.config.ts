import type { NextConfig } from 'next'


const nextConfig: NextConfig = {
  images: {
    // Картинки напитков бэк хранит до 1600 px, а показываем их в карточках ~70×180. Отдаём
    // уменьшенные копии через оптимизатор Next (DrinkImg → getImageProps): 98 карточек весили
    // 7,4 МБ и 90 Мпикс в памяти. Разрешён только наш прокси /drink-image/{id}.
    // search не задан — нужен `?v=` (версия картинки, точного значения в шаблоне не задать).
    // Подобранный руками `v` долго не живёт: прокси отдаёт его с кешем 5 мин (route.ts).
    localPatterns: [{ pathname: '/drink-image/**' }],
    qualities: [75],
    // Нижняя граница кеша оптимизатора; дальше решает Cache-Control прокси: 5 мин без версии,
    // год с совпавшей версией. По умолчанию было бы 4 ч, и замена фото без версии была бы видна не скоро.
    minimumCacheTTL: 300,
  },
  experimental: {
    // Картинка напитка уходит в бэк через server action (drinkApi.uploadImage); по умолчанию
    // тело action'а ≤ 1 МБ, фото банки больше — страница падала с «Body exceeded 1 MB limit».
    // Равно лимиту бэка (MAX_BODY_SIZE в backend/core/constants.py): иначе фото между лимитами
    // отбил бы Next, не дойдя до бэка.
    serverActions: { bodySizeLimit: '10mb' },
  },
  // Раздел «Словарь» переименован в «Легенду» — старые ссылки не ломаем.
  async redirects() {
    return [{ source: '/glossary', destination: '/legend', permanent: true }]
  },

}

export default nextConfig
