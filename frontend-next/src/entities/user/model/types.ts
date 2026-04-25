export interface User {
  id: number
  username: string
  role: string
}

export interface AuthToken {
  access_token: string
  token_type: string
}
