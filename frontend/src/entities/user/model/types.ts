export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  username: string
  role: UserRole
  // backend-висячка (бейджи): бэкендер подаст в /auth/me/; до этого undefined → 0
  first_reviewer_count?: number
  emoji_given_count?: number
  is_top10?: boolean
  // backend-висячка (аватарки, контракт #10): бэк подаст в /auth/me/; до этого undefined
  avatar_kind?: 'upload' | 'preset' | null
  avatar_url?: string | null
  avatar_seed?: string | null
}

export interface AuthToken {
  access_token: string
  token_type: string
}
