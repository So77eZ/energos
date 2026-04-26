import type { NextConfig } from 'next'

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:8000'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  webpack(config, { dev }) {
    if (dev) config.devtool = 'inline-source-map'
    return config
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
