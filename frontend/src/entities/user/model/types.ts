export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  username: string
  role: UserRole
  // backend-висячка (бейджи): бэкендер подаст в /auth/me/; до этого undefined → 0
  first_reviewer_count?: number
  emoji_given_count?: number
  is_top10?: boolean
}

export interface AuthToken {
  access_token: string
  token_type: string
}
