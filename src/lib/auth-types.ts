export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface CurrentUser {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  role_code: string
  role_name: string
  institution_code: string | null
  institution_name: string | null
  permissions: string[]
}
