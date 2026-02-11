import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/hooks/use-auth'
import type {
  InstitutionPreset,
  ConsultaDashboardStats,
  PaginatedConsulta,
  BeneficioHogarResumen,
  ConsultaCatalogosResponse,
  ConsultaFilters,
} from '@/lib/consulta-types'

function buildQueryString(filters: ConsultaFilters, extra?: Record<string, string | number>): string {
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

export function useInstitutionPreset() {
  return useQuery({
    queryKey: ['consulta', 'preset'],
    queryFn: () => apiClient.get<InstitutionPreset>('/consulta/preset'),
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}

export function useConsultaDashboard() {
  return useQuery({
    queryKey: ['consulta', 'dashboard'],
    queryFn: () => apiClient.get<ConsultaDashboardStats>('/consulta/dashboard'),
    enabled: isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useConsultaList(filters: ConsultaFilters, offset: number, limit: number) {
  return useQuery({
    queryKey: ['consulta', 'list', filters, offset, limit],
    queryFn: () =>
      apiClient.get<PaginatedConsulta>(
        `/consulta/${buildQueryString(filters, { offset, limit })}`
      ),
    enabled: isAuthenticated(),
  })
}

export function useConsultaDetail(hogarId: number | null) {
  return useQuery({
    queryKey: ['consulta', 'detail', hogarId],
    queryFn: () => apiClient.get<BeneficioHogarResumen>(`/consulta/${hogarId}`),
    enabled: isAuthenticated() && hogarId !== null,
  })
}

export function useConsultaCatalogos() {
  return useQuery({
    queryKey: ['consulta', 'catalogos'],
    queryFn: () => apiClient.get<ConsultaCatalogosResponse>('/consulta/catalogos'),
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000,
  })
}
