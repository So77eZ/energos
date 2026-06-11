'use client'

// Client-side контекст для текущего юзера. Инициализируется server-side из
// authApi.me(token) в layout. Шерится между фичами что хотят знать "это я?"
// (например EmojiBar — чтобы подсветить свои реакции).

import { createContext, useContext, type ReactNode } from 'react'
import type { User } from './types'

interface UserContextValue {
  user: User | null
  userId: number | null
}

const UserContext = createContext<UserContextValue>({ user: null, userId: null })

interface UserProviderProps {
  user: User | null
  children: ReactNode
}

export function UserProvider({ user, children }: UserProviderProps) {
  return (
    <UserContext.Provider value={{ user, userId: user?.id ?? null }}>
      {children}
    </UserContext.Provider>
  )
}

export function useCurrentUser(): UserContextValue {
  return useContext(UserContext)
}
