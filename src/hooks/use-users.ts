import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/hooks/use-auth'
import type {
  User,
  UserCreateBody,
  UserUpdateBody,
  UserFilters,
  PaginatedResponse,
} from '@/lib/admin-types'

export function useUsers(page: number, size: number, filters: UserFilters) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (filters.search) params.set('search', filters.search)
  if (filters.role_id) params.set('role_id', filters.role_id)
  if (filters.institution_id) params.set('institution_id', filters.institution_id)
  if (filters.is_active !== undefined) params.set('is_active', String(filters.is_active))

  return useQuery({
    queryKey: ['users', page, size, filters],
    queryFn: () => apiClient.get<PaginatedResponse<User>>(`/users/?${params.toString()}`),
    enabled: isAuthenticated(),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UserCreateBody) => apiClient.post<User>('/users/', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UserUpdateBody & { id: string }) =>
      apiClient.put<User>(`/users/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.put<User>(`/users/${id}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useRevokeUserSessions() {
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}/sessions`),
  })
}
