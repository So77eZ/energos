import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#0066cc',
          cyan: '#00e5ff',
          pink: '#ff2e88',
          green: '#00ff9d',
          red: '#ff4f4f',
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 102, 204, 0.5), 0 0 40px rgba(0, 102, 204, 0.2)',
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.5), 0 0 40px rgba(0, 229, 255, 0.2)',
        'glow-pink': '0 0 20px rgba(255, 46, 136, 0.5), 0 0 40px rgba(255, 46, 136, 0.2)',
        card: '0 8px 28px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow:
              '0 0 15px rgba(0, 229, 255, 0.3), 0 8px 28px rgba(0,0,0,0.4)',
          },
          '50%': {
            boxShadow:
              '0 0 35px rgba(0, 229, 255, 0.7), 0 0 60px rgba(0, 229, 255, 0.3), 0 8px 28px rgba(0,0,0,0.4)',
          },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out forwards',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
}

export default config
