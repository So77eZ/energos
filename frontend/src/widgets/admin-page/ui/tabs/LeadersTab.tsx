'use client'

// Лидерборд считается агрегатом по отзывам — берём username из reviews и
// группируем. Когда бэк выкатит /api/users/leaderboard (с реальными
// user.id, joined-date и т.п.) — заменим этот компонент на просто список.

import { useMemo } from 'react'
import type { Review } from '@entities/review'
import { Avatar, pickAvatarColor } from '@entities/user'
import { Icons } from '@shared/ui/icons'

interface LeadersTabProps {
  reviews: Review[]
}

interface Entry {
  username: string
  reviews: number
  isAdmin: boolean
}

function buildLeaderboard(reviews: Review[]): Entry[] {
  const map = new Map<string, Entry>()
  for (const r of reviews) {
    if (!r.username) continue
    const e = map.get(r.username) ?? { username: r.username, reviews: 0, isAdmin: false }
    e.reviews += 1
    if (r.from_admin) e.isAdmin = true
    map.set(r.username, e)
  }
  return Array.from(map.values()).sort((a, b) => b.reviews - a.reviews)
}

const MEDALS = ['🥇', '🥈', '🥉'] as const

export function LeadersTab({ reviews }: LeadersTabProps) {
  const board = useMemo(() => buildLeaderboard(reviews), [reviews])
  const maxRev = board[0]?.reviews ?? 1

  if (board.length === 0) {
    return (
      <div className="empty" style={{ padding: '60px 20px' }}>
        <Icons.trophy />
        <p>Пока никто не оставил отзыв — лидеры появятся, как только начнётся активность.</p>
      </div>
    )
  }

  return (
    <div className="lb-table">
      <div className="lb-row lb-row-head">
        <span className="lb-pos">#</span>
        <span className="lb-name">ПОЛЬЗОВАТЕЛЬ</span>
        <span className="lb-stat">ОТЗЫВОВ</span>
      </div>
      {board.map((u, i) => {
        const isTop3 = i < 3
        const color = pickAvatarColor(u.username) // цвет полоски отзывов = цвет аватара юзера
        return (
          <div key={u.username} className={`lb-row${isTop3 ? ' lb-top' : ''}`}>
            <span className="lb-pos">{MEDALS[i] ?? i + 1}</span>
            <span className="lb-name">
              <Avatar username={u.username} seed={u.username} size={28} />
              <span className="lb-username">{u.username}</span>
              {u.isAdmin && <span className="lb-role">admin</span>}
            </span>
            <span className="lb-stat">
              <span className="lb-rev-bar">
                <span
                  className="lb-rev-fill"
                  style={{ width: `${(u.reviews / maxRev) * 100}%`, background: color }}
                />
              </span>
              <span className="lb-rev-val">{u.reviews}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
