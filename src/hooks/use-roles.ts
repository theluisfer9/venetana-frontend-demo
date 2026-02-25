import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/hooks/use-auth'
import type {
  Role,
  RoleCreateBody,
  RoleUpdateBody,
  RolePermissionsUpdateBody,
  Permission,
} from '@/lib/admin-types'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => apiClient.get<Role[]>('/roles/'),
    enabled: isAuthenticated(),
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => apiClient.get<Permission[]>('/roles/permissions'),
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: RoleCreateBody) => apiClient.post<Role>('/roles/', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: RoleUpdateBody & { id: string }) =>
      apiClient.put<Role>(`/roles/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: RolePermissionsUpdateBody & { id: string }) =>
      apiClient.put<Role>(`/roles/${id}/permissions`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}
