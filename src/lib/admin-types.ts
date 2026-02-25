// ── Permission ──

export interface Permission {
  id: string
  code: string
  name: string
  description: string | null
  module: string
  created_at: string
}

export interface PermissionMinimal {
  id: string
  code: string
  name: string
  module: string
}

// ── Role ──

export interface RoleMinimal {
  id: string
  code: string
  name: string
}

export interface Role {
  id: string
  code: string
  name: string
  description: string | null
  is_system: boolean
  created_at: string
  updated_at: string | null
  permissions: PermissionMinimal[]
}

export interface RoleCreateBody {
  code: string
  name: string
  description?: string | null
  permission_ids?: string[]
}

export interface RoleUpdateBody {
  code?: string
  name?: string
  description?: string | null
}

export interface RolePermissionsUpdateBody {
  permission_ids: string[]
}

// ── Institution ──

export interface InstitutionMinimal {
  id: string
  code: string
  name: string
}

export interface Institution {
  id: string
  code: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface InstitutionCreateBody {
  code: string
  name: string
  description?: string | null
}

export interface InstitutionUpdateBody {
  code?: string
  name?: string
  description?: string | null
  is_active?: boolean
}

// ── User ──

export interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone: string | null
  role: RoleMinimal
  institution: InstitutionMinimal | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string | null
  last_login: string | null
}

export interface UserCreateBody {
  email: string
  username: string
  first_name: string
  last_name: string
  phone?: string | null
  password: string
  role_id: string
  institution_id?: string | null
}

export interface UserUpdateBody {
  email?: string
  username?: string
  first_name?: string
  last_name?: string
  phone?: string | null
  role_id?: string
  institution_id?: string | null
  is_active?: boolean
}

export interface UserFilters {
  search?: string
  role_id?: string
  institution_id?: string
  is_active?: boolean
}

// Backend returns paginated response for users
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}
