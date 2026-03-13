import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/hooks/use-auth'
import type { UnifiedDashboardStats } from '@/lib/dashboard-types'

export function useDashboard(departamento?: string, enabled = true) {
  const params = departamento ? `?departamento=${departamento}` : ''
  return useQuery({
    queryKey: ['dashboard', 'unified', departamento ?? ''],
    queryFn: () => apiClient.get<UnifiedDashboardStats>(`/dashboard${params}`),
    enabled: isAuthenticated() && enabled,
    staleTime: 5 * 60 * 1000,
  })
}
