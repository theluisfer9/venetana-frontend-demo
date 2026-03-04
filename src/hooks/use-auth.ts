import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, setTokens, clearTokens, getAccessToken } from '@/lib/api'
import type { LoginRequest, TokenResponse, CurrentUser } from '@/lib/auth-types'
import { hasPermission, hasModuleAccess, type PermissionModuleValue } from '@/lib/permissions'

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

/** Check if user has an admin-level role (admin, superadmin, etc.) */
export function isAdminRole(roleCode: string | undefined | null): boolean {
  if (!roleCode) return false
  const code = roleCode.toLowerCase()
  return code === 'admin' || code === 'superadmin' || code === 'super_admin' || code.includes('admin')
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiClient.get<CurrentUser>('/auth/me'),
    enabled: isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const data = await apiClient.post<TokenResponse>('/auth/login', credentials)
      setTokens(data.access_token, data.refresh_token)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/auth/logout')
      } finally {
        clearTokens()
      }
    },
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ['auth'] })
    },
  })
}

/**
 * Hook that provides permission-checking functions bound to the current user.
 * Admin users always return true for all checks.
 */
export function usePermissions() {
  const { data: user } = useCurrentUser()
  const admin = isAdminRole(user?.role_code)

  return {
    user,
    isAdmin: admin,
    /** Check exact permission code. Admins always return true. */
    can: (permission: string): boolean => {
      if (admin) return true
      return hasPermission(user?.permissions, permission)
    },
    /** Check if user has ANY permission in a module. Admins always return true. */
    canAccessModule: (module: PermissionModuleValue): boolean => {
      if (admin) return true
      return hasModuleAccess(user?.permissions, module)
    },
  }
}
