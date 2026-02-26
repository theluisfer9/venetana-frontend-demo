import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/hooks/use-auth'
import type {
  DataSource,
  DataSourceListItem,
  DataSourceCreateBody,
  DataSourceUpdateBody,
  ChColumn,
} from '@/lib/datasource-types'

export function useDatasources() {
  return useQuery({
    queryKey: ['datasources'],
    queryFn: () => apiClient.get<DataSourceListItem[]>('/datasources/'),
    enabled: isAuthenticated(),
  })
}

export function useDatasource(id: string | null) {
  return useQuery({
    queryKey: ['datasources', id],
    queryFn: () => apiClient.get<DataSource>(`/datasources/${id}`),
    enabled: isAuthenticated() && !!id,
  })
}

export function useCreateDatasource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: DataSourceCreateBody) =>
      apiClient.post<DataSource>('/datasources/', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasources'] })
    },
  })
}

export function useUpdateDatasource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: DataSourceUpdateBody & { id: string }) =>
      apiClient.put<DataSource>(`/datasources/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasources'] })
    },
  })
}

export function useDeleteDatasource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/datasources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasources'] })
    },
  })
}

export function useChTables() {
  return useQuery({
    queryKey: ['ch-tables'],
    queryFn: () => apiClient.get<string[]>('/datasources/ch-tables'),
    enabled: isAuthenticated(),
  })
}

export function useChColumns(table: string | null) {
  return useQuery({
    queryKey: ['ch-columns', table],
    queryFn: () => apiClient.get<ChColumn[]>(`/datasources/ch-columns?table=${table}`),
    enabled: isAuthenticated() && !!table,
  })
}
