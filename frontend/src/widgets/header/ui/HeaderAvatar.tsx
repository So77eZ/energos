'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@shared/config/routes'
import { Avatar, type User } from '@entities/user'

interface HeaderAvatarProps {
  user: User
}

export function HeaderAvatar({ user }: HeaderAvatarProps) {
  const pathname = usePathname()
  const active = pathname === ROUTES.profile
  const role = user.role === 'admin' ? 'admin' : 'user'

  return (
    <Link
      href={ROUTES.profile}
      className={`nav-avatar${active ? ' active' : ''}`}
      title={`${user.username} — открыть профиль`}
    >
      <Avatar
        username={user.username}
        seed={user.id}
        size={32}
        avatarKind={user.avatar_kind}
        avatarUrl={user.avatar_url}
        avatarSeed={user.avatar_seed}
      />
      <span className="nav-avatar-meta">
        <span className="nav-avatar-name">{user.username}</span>
        <span className="nav-avatar-role">{role}</span>
      </span>
    </Link>
  )
}
