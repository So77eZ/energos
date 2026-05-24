export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface Submission {
  id: number
  user_id: number
  user_name: string
  drink_name: string
  comment: string | null
  price: number | null
  /** Base64 data-URL OR remote URL. Will be replaced by uploaded url once
   *  backend ships POST /uploads. */
  photo: string | null
  status: SubmissionStatus
  created_at: string
  resolved_at?: string | null
  reject_reason?: string | null
}

export interface SubmissionCreate {
  drink_name: string
  comment: string | null
  price: number | null
  photo: string | null
}
