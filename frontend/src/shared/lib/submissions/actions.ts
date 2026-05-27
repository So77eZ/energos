'use server'

import { revalidatePath } from 'next/cache'
import { submissionApi } from '@entities/submission/api/submissionApi'
import { getToken } from '@shared/lib/session'
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

export async function addSubmissionAction(data: SubmissionCreate): Promise<Submission> {
  const token = await getToken()
  if (!token) throw new Error('Not authorized')
  const item = await submissionApi.create(data, token)
  revalidatePath('/profile')
  revalidatePath('/admin')
  return item
}

export async function updateSubmissionStatusAction(
  id: number,
  status: SubmissionStatus
): Promise<Submission> {
  const token = await getToken()
  if (!token) throw new Error('Not authorized')
  const item = await submissionApi.updateStatus(id, status, token)
  revalidatePath('/admin')
  return item
}
