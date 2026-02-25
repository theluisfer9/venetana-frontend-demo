/**
 * Unit tests for use-institutions.ts hooks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useInstitutions,
  useCreateInstitution,
  useUpdateInstitution,
  useDeleteInstitution,
} from './use-institutions'
import { createTestQueryClient, makeInstitution } from '@/test-utils'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/hooks/use-auth', () => ({
  isAuthenticated: vi.fn(() => true),
}))

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useInstitutions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('fetches active institutions from /institutions/ by default', async () => {
    const { apiClient } = await import('@/lib/api')
    const institutions = [makeInstitution(), makeInstitution({ id: 'inst-2', code: 'PNUD', name: 'PNUD' })]
    vi.mocked(apiClient.get).mockResolvedValue(institutions)

    const { result } = renderHook(() => useInstitutions(), {
      wrapper: makeWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.get).toHaveBeenCalledWith('/institutions/')
    expect(result.current.data).toHaveLength(2)
  })

  it('appends include_inactive=true when includeInactive is true', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.get).mockResolvedValue([])

    const { result } = renderHook(() => useInstitutions(true), {
      wrapper: makeWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.get).toHaveBeenCalledWith('/institutions/?include_inactive=true')
  })

  it('is disabled when not authenticated', async () => {
    const { isAuthenticated } = await import('@/hooks/use-auth')
    vi.mocked(isAuthenticated).mockReturnValue(false)

    const { result } = renderHook(() => useInstitutions(), {
      wrapper: makeWrapper(queryClient),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateInstitution', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.post with /institutions/ and body', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.post).mockResolvedValue(makeInstitution())

    const { result } = renderHook(() => useCreateInstitution(), {
      wrapper: makeWrapper(queryClient),
    })

    const body = { code: 'SESAN', name: 'Secretaría de Seguridad', description: null }

    await act(async () => {
      result.current.mutate(body)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.post).toHaveBeenCalledWith('/institutions/', body)
  })

  it('invalidates institutions query on success', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.post).mockResolvedValue(makeInstitution())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateInstitution(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate({ code: 'X', name: 'X' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['institutions'] })
  })
})

describe('useUpdateInstitution', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.put with correct institution ID in path', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.put).mockResolvedValue(makeInstitution({ name: 'Updated Name' }))

    const { result } = renderHook(() => useUpdateInstitution(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate({ id: 'inst-1', name: 'Updated Name' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.put).toHaveBeenCalledWith('/institutions/inst-1', { name: 'Updated Name' })
  })

  it('invalidates institutions query on success', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.put).mockResolvedValue(makeInstitution())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateInstitution(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate({ id: 'inst-1', name: 'New Name' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['institutions'] })
  })
})

describe('useDeleteInstitution', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.delete with correct institution ID in path', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.delete).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteInstitution(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate('inst-77')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.delete).toHaveBeenCalledWith('/institutions/inst-77')
  })

  it('invalidates institutions query on success', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.delete).mockResolvedValue(undefined)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteInstitution(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate('inst-1')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['institutions'] })
  })
})
