'use client'

// Mock-state Context для заявок. Полностью клиентский: пока бэк не выкатил
// /api/submissions, держим список в useState с persist в localStorage.
// Замена на реальное API — точечная: подменить add/list/updateStatus.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Submission, SubmissionCreate, SubmissionStatus } from '@entities/submission'

const STORAGE_KEY = 'energos_submissions_mock'

interface SubmissionsContextValue {
  all: Submission[]
  /** Submit a new one. Returns the created item. */
  add: (payload: SubmissionCreate & { user_id: number; user_name: string }) => Submission
  updateStatus: (id: number, status: SubmissionStatus, rejectReason?: string) => void
}

const SubmissionsContext = createContext<SubmissionsContextValue | null>(null)

function loadInitial(): Submission[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Submission[]
  } catch {
    return []
  }
}

function persist(items: Submission[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // private mode etc — fine
  }
}

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  // Start empty for SSR; hydrate from localStorage on mount.
  const [items, setItems] = useState<Submission[]>([])

  useEffect(() => {
    setItems(loadInitial())
  }, [])

  // Persist on every change after hydration.
  useEffect(() => {
    if (typeof window === 'undefined') return
    persist(items)
  }, [items])

  const add = useCallback(
    (payload: SubmissionCreate & { user_id: number; user_name: string }): Submission => {
      const nextId = items.length === 0 ? 1 : Math.max(...items.map((s) => s.id)) + 1
      const item: Submission = {
        id: nextId,
        user_id: payload.user_id,
        user_name: payload.user_name,
        drink_name: payload.drink_name,
        comment: payload.comment,
        price: payload.price,
        photo: payload.photo,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
      setItems((prev) => [item, ...prev])
      return item
    },
    [items],
  )

  const updateStatus = useCallback(
    (id: number, status: SubmissionStatus, rejectReason?: string) => {
      setItems((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status,
                resolved_at: new Date().toISOString(),
                reject_reason: status === 'rejected' ? rejectReason ?? null : null,
              }
            : s,
        ),
      )
    },
    [],
  )

  return (
    <SubmissionsContext.Provider value={{ all: items, add, updateStatus }}>
      {children}
    </SubmissionsContext.Provider>
  )
}

export function useSubmissions(): SubmissionsContextValue {
  const ctx = useContext(SubmissionsContext)
  if (!ctx) throw new Error('useSubmissions must be used within SubmissionsProvider')
  return ctx
}

/** Convenience: only current user's submissions. */
export function useMySubmissions(userId: number | null | undefined): Submission[] {
  const { all } = useSubmissions()
  if (userId == null) return []
  return all.filter((s) => s.user_id === userId)
}
