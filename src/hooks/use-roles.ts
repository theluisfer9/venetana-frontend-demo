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

export interface DataSourceListItem {
  id: string
  code: string
  name: string
  is_active: boolean
  column_count: number
}

export function useAllDataSources() {
  return useQuery({
    queryKey: ['datasources-admin'],
    queryFn: () => apiClient.get<DataSourceListItem[]>('/datasources/'),
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
  })
}

export interface RoleDataSource {
  id: string
  code: string
  name: string
  description: string | null
}

export function useRoleDataSources(roleId: string | null) {
  return useQuery({
    queryKey: ['role-datasources', roleId],
    queryFn: () => apiClient.get<RoleDataSource[]>(`/roles/${roleId}/datasources`),
    enabled: !!roleId && isAuthenticated(),
  })
}

export function useUpdateRoleDataSources() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datasource_ids }: { id: string; datasource_ids: string[] }) =>
      apiClient.put(`/roles/${id}/datasources`, { datasource_ids }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['role-datasources', variables.id] })
    },
  })
}
