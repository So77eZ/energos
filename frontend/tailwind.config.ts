import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens (resolved from CSS vars; flip with html[data-theme])
        bg: {
          deep:    'var(--bg-deep)',
          base:    'var(--bg-base)',
          card:    'var(--bg-card)',
          surface: 'var(--bg-surface)',
          elev:    'var(--bg-elev)',
          input:   'var(--bg-input)',
        },
        txt: {
          DEFAULT: 'var(--txt)',
          dim:     'var(--txt-dim)',
          quiet:   'var(--txt-quiet)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong:  'var(--line-strong)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          rgb:     'rgb(var(--accent-rgb))',
        },
        // Metric colors (fixed across themes)
        metric: {
          cyan:   'var(--c-cyan)',
          blue:   'var(--c-blue)',
          pink:   'var(--c-pink)',
          purple: 'var(--c-purple)',
          amber:  'var(--c-amber)',
          green:  'var(--c-green)',
          lime:   'var(--c-lime)',
        },
        // Legacy palette — kept while older components still reference these.
        // Remove once every consumer is migrated to `accent` / `metric.*`.
        neon: {
          blue: '#0066cc',
          cyan: '#00e5ff',
          pink: '#ff2e88',
          green: '#00ff9d',
          red: '#ff4f4f',
        },
      },
      fontFamily: {
        sans:    ['var(--font-sans)'],
        display: ['var(--font-display)'],
        title:   ['var(--font-title)'],
        mono:    ['var(--font-mono)'],
      },
      borderRadius: {
        'r-sm': 'var(--r-sm)',
        'r-md': 'var(--r-md)',
        'r-lg': 'var(--r-lg)',
        'r-xl': 'var(--r-xl)',
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(var(--accent-rgb), 0.5), 0 0 40px rgba(var(--accent-rgb), 0.2)',
        'glow-blue': '0 0 20px rgba(0, 102, 204, 0.5), 0 0 40px rgba(0, 102, 204, 0.2)',
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.5), 0 0 40px rgba(0, 229, 255, 0.2)',
        'glow-pink': '0 0 20px rgba(255, 46, 136, 0.5), 0 0 40px rgba(255, 46, 136, 0.2)',
        card: 'var(--shadow-card)',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow:
              '0 0 15px rgba(var(--accent-rgb), 0.3), 0 8px 28px rgba(0,0,0,0.4)',
          },
          '50%': {
            boxShadow:
              '0 0 35px rgba(var(--accent-rgb), 0.7), 0 0 60px rgba(var(--accent-rgb), 0.3), 0 8px 28px rgba(0,0,0,0.4)',
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
