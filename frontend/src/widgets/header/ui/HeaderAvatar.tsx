'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@shared/config/routes'
import type { User } from '@entities/user'

interface HeaderAvatarProps {
  user: User
}

export function HeaderAvatar({ user }: HeaderAvatarProps) {
  const pathname = usePathname()
  const active = pathname === ROUTES.profile
  const letter = user.username.charAt(0).toUpperCase()
  const role = user.role === 'admin' ? 'admin' : 'user'

  return (
    <Link
      href={ROUTES.profile}
      className={`nav-avatar${active ? ' active' : ''}`}
      title={`${user.username} — открыть профиль`}
    >
      <span className="nav-avatar-letter" style={{ background: 'var(--accent)' }}>
        {letter}
      </span>
      <span className="nav-avatar-meta">
        <span className="nav-avatar-name">{user.username}</span>
        <span className="nav-avatar-role">{role}</span>
      </span>
    </Link>
  )
}
