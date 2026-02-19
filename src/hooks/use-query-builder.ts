import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/hooks/use-auth'
import type {
  AvailableDataSource,
  QueryExecuteRequest,
  QueryExecuteResponse,
  SavedQueryListItem,
  SavedQueryDetail,
} from '@/lib/query-builder-types'

export function useAvailableDataSources() {
  return useQuery({
    queryKey: ['queries', 'datasources'],
    queryFn: () => apiClient.get<AvailableDataSource[]>('/queries/datasources'),
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useExecuteQuery() {
  return useMutation({
    mutationFn: (req: QueryExecuteRequest) =>
      apiClient.post<QueryExecuteResponse>('/queries/execute', req),
  })
}

export function useSavedQueries() {
  return useQuery({
    queryKey: ['queries', 'saved'],
    queryFn: () => apiClient.get<SavedQueryListItem[]>('/queries/saved'),
    enabled: isAuthenticated(),
  })
}

export function useSavedQueryDetail(id: string | null) {
  return useQuery({
    queryKey: ['queries', 'saved', id],
    queryFn: () => apiClient.get<SavedQueryDetail>(`/queries/saved/${id}`),
    enabled: isAuthenticated() && id !== null,
  })
}

export function useSaveQuery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      datasource_id: string
      name: string
      selected_columns: string[]
      filters: { column: string; op: string; value: unknown }[]
    }) => apiClient.post('/queries/saved', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries', 'saved'] })
    },
  })
}

export function useDeleteSavedQuery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/queries/saved/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries', 'saved'] })
    },
  })
}

export function useExecuteSavedQuery() {
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<QueryExecuteResponse>(`/queries/saved/${id}/execute`, {}),
  })
}
