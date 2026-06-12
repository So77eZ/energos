'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ROUTES } from '@shared/config/routes'
import { Avatar, type User } from '@entities/user'
import { resolveAvatar, readAvatarDemo, type ResolvedAvatar } from '@features/avatar-editor'

interface HeaderAvatarProps {
  user: User
}

export function HeaderAvatar({ user }: HeaderAvatarProps) {
  const pathname = usePathname()
  const active = pathname === ROUTES.profile
  const role = user.role === 'admin' ? 'admin' : 'user'

  // Демо-аватар читаем client-side (в SSR localStorage нет). Синхрон с правкой в профиле —
  // на след. навигации/перезагрузке; бек #10 отдаст user.avatar_* server-side, демо уйдёт.
  const [av, setAv] = useState<ResolvedAvatar>(() => resolveAvatar(user, null))
  useEffect(() => {
    setAv(resolveAvatar(user, readAvatarDemo(user.id)))
  }, [user])

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
        avatarKind={av.kind}
        avatarUrl={av.url}
        avatarSeed={av.seed}
      />
      <span className="nav-avatar-meta">
        <span className="nav-avatar-name">{user.username}</span>
        <span className="nav-avatar-role">{role}</span>
      </span>
    </Link>
  )
}
