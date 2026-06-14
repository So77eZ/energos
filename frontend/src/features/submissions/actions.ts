'use server'

import { revalidatePath } from 'next/cache'
import { getToken } from '@shared/lib/session'
import { withSessionGuard } from '@shared/lib/auth-guard'
import { submissionApi } from '@entities/submission'
import type { Submission, SubmissionCreate, SubmissionStatus } from '@entities/submission'

export async function fetchSubmissionsAction(): Promise<Submission[]> {
  const token = await getToken()
  if (!token) return []
  try {
    return await submissionApi.list(token)
  } catch (err) {
    console.error('Error fetching submissions:', err)
    return []
  }
}

export const addSubmissionAction = withSessionGuard(
  async (data: SubmissionCreate): Promise<Submission> => {
    const token = await getToken()
    if (!token) throw new Error('Not authorized')
    const item = await submissionApi.create(data, token)
    revalidatePath('/profile')
    revalidatePath('/admin')
    return item
  },
)

export const updateSubmissionStatusAction = withSessionGuard(
  async (
    id: number,
    status: SubmissionStatus,
    adminComment?: string | null,
  ): Promise<Submission> => {
    const token = await getToken()
    if (!token) throw new Error('Not authorized')
    const item = await submissionApi.updateStatus(id, status, token, adminComment)
    revalidatePath('/admin')
    return item
  },
)
