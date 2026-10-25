import type { NextConfig } from 'next'


const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
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
