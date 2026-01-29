import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/hooks/use-auth'
import type {
  CatalogosResponse,
  MunicipioItem,
  PaginatedResponse,
  BeneficiarioDetail,
  BeneficiarioStats,
  DashboardStats,
  BeneficiarioFilters,
} from '@/lib/beneficiario-types'

function buildQueryString(filters: BeneficiarioFilters, extra?: Record<string, string | number>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      params.set(key, String(value))
    }
  }

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function useCatalogos() {
  return useQuery({
    queryKey: ['beneficiarios', 'catalogos'],
    queryFn: () => apiClient.get<CatalogosResponse>('/beneficiarios/catalogos'),
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useMunicipios(departamentoCode: string | undefined) {
  return useQuery({
    queryKey: ['beneficiarios', 'municipios', departamentoCode],
    queryFn: () =>
      apiClient.get<MunicipioItem[]>(
        `/beneficiarios/catalogos/municipios?departamento_code=${departamentoCode}`
      ),
    enabled: isAuthenticated() && !!departamentoCode,
    staleTime: 10 * 60 * 1000,
  })
}

export function useBeneficiarios(
  filters: BeneficiarioFilters,
  offset: number,
  limit: number
) {
  return useQuery({
    queryKey: ['beneficiarios', 'list', filters, offset, limit],
    queryFn: () =>
      apiClient.get<PaginatedResponse>(
        `/beneficiarios/${buildQueryString(filters, { offset, limit })}`
      ),
    enabled: isAuthenticated(),
  })
}

export function useBeneficiarioDetail(id: number | null) {
  return useQuery({
    queryKey: ['beneficiarios', 'detail', id],
    queryFn: () => apiClient.get<BeneficiarioDetail>(`/beneficiarios/${id}`),
    enabled: isAuthenticated() && id !== null,
  })
}

export function useBeneficiarioStats(filters: BeneficiarioFilters) {
  return useQuery({
    queryKey: ['beneficiarios', 'stats', filters],
    queryFn: () =>
      apiClient.get<BeneficiarioStats>(
        `/beneficiarios/stats${buildQueryString(filters)}`
      ),
    enabled: isAuthenticated(),
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['beneficiarios', 'dashboard'],
    queryFn: () => apiClient.get<DashboardStats>('/beneficiarios/dashboard'),
    enabled: isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useExportExcel(filters: BeneficiarioFilters) {
  return useMutation({
    mutationFn: () => {
      const qs = buildQueryString(filters)
      return apiClient.download(
        `/beneficiarios/export/excel${qs}`,
        `beneficiarios_${new Date().toISOString().slice(0, 10)}.xlsx`,
      )
    },
  })
}

export function useExportPdf(filters: BeneficiarioFilters) {
  return useMutation({
    mutationFn: () => {
      const qs = buildQueryString(filters)
      return apiClient.download(
        `/beneficiarios/export/pdf${qs}`,
        `beneficiarios_${new Date().toISOString().slice(0, 10)}.pdf`,
      )
    },
  })
}
