// Energos icon set — Lucide-style inline SVGs.
// Mirrors `frontendNew/icons.jsx` 1:1 so it can stand in as `I.<name>` during
// the design migration. Each icon accepts a custom width `w` (default 14–16)
// and forwards remaining SVG props.

import type { JSX, SVGProps } from 'react'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  w?: number
}

type IconFC = (p?: IconProps) => JSX.Element

const bolt: IconFC = (p = {}) => {
  const { w = 16, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="currentColor" {...rest}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  )
}

const star: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="currentColor" {...rest}>
      <path d="m12 2 3 7 7 .8-5.2 4.8 1.6 7.1L12 17.8 5.6 21.7 7.2 14.6 2 9.8 9 9z" />
    </svg>
  )
}

const starOutline: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={1.5} {...rest}>
      <path d="m12 2 3 7 7 .8-5.2 4.8 1.6 7.1L12 17.8 5.6 21.7 7.2 14.6 2 9.8 9 9z" />
    </svg>
  )
}

const search: IconFC = (p = {}) => {
  const { w = 16, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

const sliders: IconFC = (p = {}) => {
  const { w = 16, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </svg>
  )
}

const map: IconFC = (p = {}) => {
  const { w = 16, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15" />
    </svg>
  )
}

const msg: IconFC = (p = {}) => {
  const { w = 16, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M21 12a9 9 0 1 1-3.6-7.2L21 3l-1.5 4.5" />
    </svg>
  )
}

const user: IconFC = (p = {}) => {
  const { w = 16, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

const candyOff: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M3 3l18 18" />
      <path d="M10.5 6.5 6.5 10.5a3 3 0 1 1 4-4z" />
      <path d="M13.5 17.5l4-4a3 3 0 1 0-4 4z" />
    </svg>
  )
}

const flame: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="currentColor" {...rest}>
      <path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4-1 3 1 4 2 4 2 0-1-5 1-10z" />
    </svg>
  )
}

const arrow: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

const arrowL: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

const trend: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="m3 17 6-6 4 4 8-8M14 7h7v7" />
    </svg>
  )
}

const rouble: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M7 20V4h6a4 4 0 1 1 0 8H4M4 16h11" />
    </svg>
  )
}

const pulse: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M2 12h4l3-8 4 16 3-8h6" />
    </svg>
  )
}

const pkg: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="m3 7 9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10" />
    </svg>
  )
}

const flask: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M10 2v6L4 20a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-12V2M8 2h8M7 14h10" />
    </svg>
  )
}

const trophy: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M6 9a6 6 0 0 0 12 0V3H6zM4 6H2v3a2 2 0 0 0 2 2M20 6h2v3a2 2 0 0 1-2 2M10 22h4M12 17v5" />
    </svg>
  )
}

const plus: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2.5} {...rest}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

const edit: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
    </svg>
  )
}

const trash: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  )
}

const x: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

const check: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2.5} {...rest}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}

const lock: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

const layers: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="m12 2 10 6-10 6L2 8z" />
      <path d="m2 16 10 6 10-6M2 12l10 6 10-6" />
    </svg>
  )
}

const grid: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

const sparkle: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="currentColor" {...rest}>
      <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" />
    </svg>
  )
}

const book: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M2 19V5a2 2 0 0 1 2-2h8v18H4a2 2 0 0 1-2-2zM22 19V5a2 2 0 0 0-2-2h-8v18h8a2 2 0 0 0 2-2z" />
    </svg>
  )
}

const award: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <circle cx="12" cy="8" r="6" />
      <path d="m9 13-2 8 5-3 5 3-2-8" />
    </svg>
  )
}

const sun: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" />
    </svg>
  )
}

const moon: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

const upload: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  )
}

const beaker: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M9 3v6l-5 11a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 9V3" />
    </svg>
  )
}

const scale: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="m16 16 3-8 3 8-3 1-3-1zM2 16l3-8 3 8-3 1-3-1zM12 2v20M5 8h14M5 22h14" />
    </svg>
  )
}

const spinner: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M12 2v4M12 18v4M5 5l3 3M16 16l3 3M2 12h4M18 12h4M5 19l3-3M16 8l3-3" />
    </svg>
  )
}

const filter: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      <path d="M3 4h18l-7 9v6l-4 2v-8z" />
    </svg>
  )
}

const drop: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="currentColor" {...rest}>
      <path d="M12 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z" />
    </svg>
  )
}

const github: IconFC = (p = {}) => {
  const { w = 14, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" width={w} height={w} fill="currentColor" {...rest}>
      <path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.7-.3 2.5-.3s1.7.1 2.5.3c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5C19.1 20.2 22 16.4 22 12c0-5.5-4.5-10-10-10z" />
    </svg>
  )
}

export const Icons = {
  bolt, star, starOutline, search, sliders, map, msg, user, candyOff, flame,
  arrow, arrowL, trend, rouble, pulse, pkg, flask, trophy, plus, edit, trash,
  x, check, lock, layers, grid, sparkle, book, award, sun, moon, upload,
  beaker, scale, spinner, filter, drop, github,
} as const

export type IconName = keyof typeof Icons
