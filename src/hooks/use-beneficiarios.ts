import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/hooks/use-auth'
import type {
  CatalogosResponse,
  MunicipioItem,
  LugarPobladoItem,
  PaginatedResponse,
  BeneficiarioDetalle,
  BeneficiarioStats,
  DashboardStats,
  BeneficiarioFilters,
  PersonaResumen,
  ViviendaDetalle,
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

export function useMunicipios(departamentoCodigo: string | undefined) {
  return useQuery({
    queryKey: ['beneficiarios', 'municipios', departamentoCodigo],
    queryFn: () =>
      apiClient.get<MunicipioItem[]>(
        `/beneficiarios/catalogos/municipios?departamento_codigo=${departamentoCodigo}`
      ),
    enabled: isAuthenticated() && !!departamentoCodigo,
    staleTime: 10 * 60 * 1000,
  })
}

export function useLugaresPoblados(municipioCodigo: string | undefined) {
  return useQuery({
    queryKey: ['beneficiarios', 'lugares-poblados', municipioCodigo],
    queryFn: () =>
      apiClient.get<LugarPobladoItem[]>(
        `/beneficiarios/catalogos/lugares-poblados?municipio_codigo=${municipioCodigo}`
      ),
    enabled: isAuthenticated() && !!municipioCodigo,
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

export function useBeneficiarioDetail(hogarId: number | null) {
  return useQuery({
    queryKey: ['beneficiarios', 'detail', hogarId],
    queryFn: () => apiClient.get<BeneficiarioDetalle>(`/beneficiarios/${hogarId}`),
    enabled: isAuthenticated() && hogarId !== null,
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

export function usePersonasHogar(hogarId: number | null) {
  return useQuery({
    queryKey: ['beneficiarios', 'personas', hogarId],
    queryFn: () => apiClient.get<PersonaResumen[]>(`/beneficiarios/${hogarId}/personas`),
    enabled: isAuthenticated() && hogarId !== null,
  })
}

export function useViviendaHogar(hogarId: number | null) {
  return useQuery({
    queryKey: ['beneficiarios', 'vivienda', hogarId],
    queryFn: () => apiClient.get<ViviendaDetalle>(`/beneficiarios/${hogarId}/vivienda`),
    enabled: isAuthenticated() && hogarId !== null,
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
