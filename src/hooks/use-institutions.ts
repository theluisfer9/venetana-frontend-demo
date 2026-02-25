import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/hooks/use-auth'
import type {
  Institution,
  InstitutionCreateBody,
  InstitutionUpdateBody,
} from '@/lib/admin-types'

export function useInstitutions(includeInactive = false) {
  return useQuery({
    queryKey: ['institutions', includeInactive],
    queryFn: () =>
      apiClient.get<Institution[]>(
        `/institutions/${includeInactive ? '?include_inactive=true' : ''}`
      ),
    enabled: isAuthenticated(),
  })
}

export function useCreateInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: InstitutionCreateBody) =>
      apiClient.post<Institution>('/institutions/', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] })
    },
  })
}

export function useUpdateInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: InstitutionUpdateBody & { id: string }) =>
      apiClient.put<Institution>(`/institutions/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] })
    },
  })
}

export function useDeleteInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/institutions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] })
    },
  })
}
