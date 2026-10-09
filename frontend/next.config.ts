import type { NextConfig } from 'next'

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:8000'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    // Картинка напитка уходит в бэк через server action (drinkApi.uploadImage); по умолчанию
    // тело action'а ≤ 1 МБ, фото банки больше — страница падала с «Body exceeded 1 MB limit».
    serverActions: { bodySizeLimit: '8mb' },
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
