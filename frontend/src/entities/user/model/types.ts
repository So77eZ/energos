export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  username: string
  role: UserRole
}

export interface AuthToken {
  access_token: string
  token_type: string
}
