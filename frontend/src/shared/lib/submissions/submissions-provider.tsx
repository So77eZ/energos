'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Submission, SubmissionCreate, SubmissionStatus } from '@entities/submission'
import { fetchSubmissionsAction, addSubmissionAction, updateSubmissionStatusAction } from './actions'

interface SubmissionsContextValue {
  all: Submission[]
  add: (payload: SubmissionCreate) => Promise<Submission>;
  updateStatus: (id: number, status: SubmissionStatus, rejectReason?: string) => Promise<void>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SubmissionsContext = createContext<SubmissionsContextValue | null>(null)

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchSubmissionsAction()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const add = useCallback(
    async (payload: SubmissionCreate): Promise<Submission> => {
      const item = await addSubmissionAction(payload)
      setItems((prev) => [item, ...prev])
      return item
    },
    []
  )

  const updateStatus = useCallback(
    async (id: number, status: SubmissionStatus, rejectReason?: string) => {
      const item = await updateSubmissionStatusAction(id, status)
      setItems((prev) => prev.map((s) => (s.id === id ? item : s)))
    },
    []
  )

  return (
    <SubmissionsContext.Provider value={{ all: items, add, updateStatus, loading, refresh }}>
      {children}
    </SubmissionsContext.Provider>
  )
}

export function useSubmissions(): SubmissionsContextValue {
  const ctx = useContext(SubmissionsContext)
  if (!ctx) throw new Error('useSubmissions must be used within SubmissionsProvider')
  return ctx
}

export function useMySubmissions(userId: number | null | undefined): Submission[] {
  const { all } = useSubmissions()
  if (userId == null) return []
  return all.filter((s) => s.user_id === userId)
}
