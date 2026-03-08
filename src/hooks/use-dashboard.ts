import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/hooks/use-auth'
import type { UnifiedDashboardStats } from '@/lib/dashboard-types'

export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'unified'],
    queryFn: () => apiClient.get<UnifiedDashboardStats>('/dashboard'),
    enabled: isAuthenticated() && enabled,
    staleTime: 5 * 60 * 1000,
  })
}
