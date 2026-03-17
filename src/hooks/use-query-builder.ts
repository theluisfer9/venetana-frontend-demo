import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { renderExportToast } from '@/components/ExportToast'
import type {
  AvailableDataSource,
  QueryExecuteRequest,
  QueryExecuteResponse,
  QueryFilter,
  Aggregation,
  SavedQueryListItem,
  SavedQueryDetail,
  SavedQueryCreateBody,
  SavedQueryUpdateBody,
  Institution,
} from '@/lib/query-builder-types'

// ── Datasources ──

export function useAvailableDataSources() {
  return useQuery({
    queryKey: ['queries', 'datasources'],
    queryFn: () => apiClient.get<AvailableDataSource[]>('/datasources/'),
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
  })
}

// ── Institutions ──

export function useInstitutions() {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: () => apiClient.get<Institution[]>('/institutions/'),
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
  })
}

// ── Execute ──

export function useExecuteQuery() {
  return useMutation({
    mutationFn: (req: QueryExecuteRequest) =>
      apiClient.post<QueryExecuteResponse>('/queries/execute', req),
  })
}

export function useExecuteSavedQuery() {
  return useMutation({
    mutationFn: ({
      id,
      offset = 0,
      limit = 20,
    }: {
      id: string
      offset?: number
      limit?: number
    }) =>
      apiClient.post<QueryExecuteResponse>(
        `/queries/saved/${id}/execute?offset=${offset}&limit=${limit}`,
        {},
      ),
  })
}

// ── Saved queries CRUD ──

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
    mutationFn: (body: SavedQueryCreateBody) =>
      apiClient.post<SavedQueryDetail>('/queries/saved', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries', 'saved'] })
    },
  })
}

export function useUpdateSavedQuery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: SavedQueryUpdateBody & { id: string }) =>
      apiClient.put<SavedQueryDetail>(`/queries/saved/${id}`, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['queries', 'saved'] })
      queryClient.invalidateQueries({ queryKey: ['queries', 'saved', variables.id] })
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

// ── Export saved query ──

const FORMAT_EXT: Record<string, string> = {
  excel: 'zip',
  csv: 'csv',
  pdf: 'zip',
}

export function useExportSavedQuery() {
  return useMutation({
    mutationFn: ({ id, formato }: { id: string; formato: 'csv' | 'excel' | 'pdf' }) => {
      const ext = FORMAT_EXT[formato] ?? formato
      return apiClient.download(
        `/queries/saved/${id}/export?formato=${formato}`,
        `consulta_${id}_${new Date().toISOString().slice(0, 10)}.${ext}`,
      )
    },
  })
}

const FORMAT_LABEL: Record<string, string> = {
  excel: 'Excel',
  csv: 'CSV',
  pdf: 'PDF',
}

export function useExportQueryExecute() {
  return useMutation({
    mutationFn: ({
      formato,
      toastId: _toastId,
      ...body
    }: {
      datasource_id: string
      columns: string[]
      filters: QueryFilter[]
      group_by?: string[]
      aggregations?: Aggregation[]
      agrupar?: boolean
      offset?: number
      limit?: number
      formato: 'csv' | 'excel' | 'pdf'
      toastId?: string | number
    }) => {
      const ext = FORMAT_EXT[formato] ?? formato
      return apiClient.downloadPost(
        `/queries/execute/export?formato=${formato}`,
        body,
        `consulta_${new Date().toISOString().slice(0, 10)}.${ext}`,
      )
    },
    onMutate: (variables) => {
      const label = FORMAT_LABEL[variables.formato] ?? variables.formato
      const toastId = renderExportToast(label)
      variables.toastId = toastId
    },
    onSuccess: (_data, variables) => {
      const label = FORMAT_LABEL[variables.formato] ?? variables.formato
      toast.success(`Archivo ${label} descargado correctamente`, { id: variables.toastId, duration: 3000 })
    },
    onError: (_error, variables) => {
      const label = FORMAT_LABEL[variables.formato] ?? variables.formato
      toast.error(`Error al generar el archivo ${label}`, { id: variables.toastId, duration: 4000 })
    },
  })
}
