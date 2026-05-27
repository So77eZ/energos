import { httpRequest, bearerHeaders } from '@shared/api/http'
import type { Submission, SubmissionCreate, SubmissionStatus } from '../model/types'

// Map backend 'name' to 'drink_name', provide defaults for 'created_at', 'user_name'
function mapBackendToFrontend(item: any): Submission {
  return {
    id: item.id,
    user_id: item.user_id,
    user_name: item.user_name || `User ${item.user_id}`,
    drink_name: item.name,
    comment: item.comment,
    price: item.price,
    photo: item.status === 'pending' ? `/api/add-requests/${item.id}/image` : null, // Backend clears image on resolve
    status: item.status as SubmissionStatus,
    created_at: item.created_at || new Date().toISOString(),
  }
}

export const submissionApi = {
  /** Fetch all submissions (admin gets all, user gets own). */
  list: async (token: string): Promise<Submission[]> => {
    const raw = await httpRequest<any[]>('/api/add-requests/', {
      headers: bearerHeaders(token),
    })
    return raw.map(mapBackendToFrontend)
  },

  /** Create a new submission */
  create: async (data: SubmissionCreate, token: string): Promise<Submission> => {
    const formData = new FormData()
    formData.append('name', data.drink_name)
    if (data.price != null) {
      formData.append('price', String(data.price))
    }
    formData.append('no_sugar', 'false') // or pass if we had it
    if (data.comment) {
      formData.append('comment', data.comment)
    }

    if (data.photo) {
      try {
        const res = await fetch(data.photo)
        const blob = await res.blob()
        // Determine filename from mime type or use default
        let ext = 'jpg'
        if (blob.type === 'image/png') ext = 'png'
        if (blob.type === 'image/webp') ext = 'webp'
        if (blob.type === 'image/gif') ext = 'gif'
        formData.append('image', blob, `upload.${ext}`)
      } catch (e) {
        console.warn('Failed to parse photo data URL to Blob', e)
      }
    }

    const raw = await httpRequest<any>('/api/add-requests/', {
      method: 'POST',
      headers: bearerHeaders(token),
      body: formData,
    })
    return mapBackendToFrontend(raw)
  },

  /** Update submission status (Admin only) */
  updateStatus: async (
    id: number,
    status: SubmissionStatus,
    token: string
  ): Promise<Submission> => {
    const raw = await httpRequest<any>(`/api/add-requests/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...bearerHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    return mapBackendToFrontend(raw)
  },
}
