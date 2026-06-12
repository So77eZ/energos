'use client'

import { pickAvatarColor } from '../lib/avatar-color'
import { makeIdenticon } from '../lib/avatar-identicon'

interface AvatarProps {
  username: string | null
  /** Сид для цвета буквенного аватара; дефолт = username. */
  seed?: string | number
  size: number
  // Резолв (бек или localStorage-демо) делает рендерящий виджет (см. resolveAvatar);
  // Avatar — презентационный, демо/контекст сам не читает (FSD: entity не знает про feature).
  avatarKind?: 'upload' | 'preset' | null
  avatarUrl?: string | null
  avatarSeed?: string | null
}

export function Avatar({ username, seed, size, avatarKind, avatarUrl, avatarSeed }: AvatarProps) {
  const px = `${size}px`

  if (avatarKind === 'upload' && avatarUrl) {
    // Форма впечена в PNG (alpha). В плотных/мелких контекстах (<64px) форсим circle,
    // чтобы ритм списков не рябил; на profile (>=64) — впечённая форма как есть.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="avatar avatar-img"
        src={avatarUrl}
        alt={username ?? ''}
        loading="lazy"
        decoding="async"
        style={{ width: px, height: px, borderRadius: size < 64 ? '50%' : undefined }}
      />
    )
  }

  if (avatarKind === 'preset' && avatarSeed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="avatar avatar-img"
        src={makeIdenticon(avatarSeed)}
        alt={username ?? ''}
        loading="lazy"
        decoding="async"
        style={{ width: px, height: px, borderRadius: '50%' }}
      />
    )
  }

  // Буквенный кружок — neon: pickAvatarColor-фон + --on-accent тёмный ink (AA), всегда circle.
  const letter = (username ?? '?').charAt(0).toUpperCase()
  return (
    <span
      className="avatar avatar-letter"
      style={{
        width: px,
        height: px,
        background: pickAvatarColor(seed ?? username ?? '?'),
        color: 'var(--on-accent)',
        fontSize: `${Math.round(size * 0.42)}px`,
      }}
    >
      {letter}
    </span>
  )
}
