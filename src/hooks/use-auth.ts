import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, setTokens, clearTokens, getAccessToken } from '@/lib/api'
import type { LoginRequest, TokenResponse, CurrentUser } from '@/lib/auth-types'

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
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
