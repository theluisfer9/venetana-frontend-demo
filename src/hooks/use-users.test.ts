/**
 * Unit tests for use-users.ts hooks.
 *
 * Strategy:
 *  - Mock @/lib/api (apiClient) so no real HTTP requests are made.
 *  - Mock @/hooks/use-auth (isAuthenticated) to control query enablement.
 *  - Use renderHook + QueryClientProvider via a wrapper helper.
 *  - For mutations, verify mutationFn calls the correct endpoint and
 *    that onSuccess invalidates the 'users' query key.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useActivateUser,
  useRevokeUserSessions,
} from './use-users'
import { createTestQueryClient, makeUser, makePaginatedResponse } from '@/test-utils'

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

// ── Helper ───────────────────────────────────────────────────────────────────

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('useUsers', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.get with correct URL and returns paginated data', async () => {
    const { apiClient } = await import('@/lib/api')
    const mockData = makePaginatedResponse([makeUser()])
    vi.mocked(apiClient.get).mockResolvedValue(mockData)

    const { result } = renderHook(
      () => useUsers(1, 15, {}),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/users/?'),
    )
    expect(result.current.data?.items).toHaveLength(1)
    expect(result.current.data?.items[0].email).toBe('test@example.com')
  })

  it('passes search filter as query param', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.get).mockResolvedValue(makePaginatedResponse([]))

    const { result } = renderHook(
      () => useUsers(1, 15, { search: 'juan' }),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('search=juan'))
  })

  it('passes role_id filter as query param', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.get).mockResolvedValue(makePaginatedResponse([]))

    const { result } = renderHook(
      () => useUsers(1, 15, { role_id: 'role-abc' }),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('role_id=role-abc'))
  })

  it('passes is_active filter as query param', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.get).mockResolvedValue(makePaginatedResponse([]))

    const { result } = renderHook(
      () => useUsers(1, 15, { is_active: false }),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('is_active=false'))
  })

  it('is disabled when user is not authenticated', async () => {
    const { isAuthenticated } = await import('@/hooks/use-auth')
    vi.mocked(isAuthenticated).mockReturnValue(false)

    const { result } = renderHook(
      () => useUsers(1, 15, {}),
      { wrapper: makeWrapper(queryClient) },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateUser', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.post with /users/ endpoint', async () => {
    const { apiClient } = await import('@/lib/api')
    const newUser = makeUser()
    vi.mocked(apiClient.post).mockResolvedValue(newUser)

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: makeWrapper(queryClient),
    })

    const body = {
      email: 'new@example.com',
      username: 'newuser',
      first_name: 'New',
      last_name: 'User',
      password: 'password123',
      role_id: 'role-1',
    }

    await act(async () => {
      result.current.mutate(body)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.post).toHaveBeenCalledWith('/users/', body)
  })

  it('invalidates users query on success', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.post).mockResolvedValue(makeUser())

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate({
        email: 'a@b.com',
        username: 'ab',
        first_name: 'A',
        last_name: 'B',
        password: 'pass1234',
        role_id: 'role-1',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users'] })
  })
})

describe('useUpdateUser', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.put with correct user ID in path', async () => {
    const { apiClient } = await import('@/lib/api')
    const updatedUser = makeUser({ first_name: 'Updated' })
    vi.mocked(apiClient.put).mockResolvedValue(updatedUser)

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate({ id: 'user-1', first_name: 'Updated' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.put).toHaveBeenCalledWith('/users/user-1', { first_name: 'Updated' })
  })

  it('invalidates users query on success', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.put).mockResolvedValue(makeUser())

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate({ id: 'user-1', first_name: 'X' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users'] })
  })
})

describe('useDeleteUser', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.delete with correct user ID in path', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.delete).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate('user-99')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.delete).toHaveBeenCalledWith('/users/user-99')
  })

  it('invalidates users query on success', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.delete).mockResolvedValue(undefined)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate('user-1')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users'] })
  })
})

describe('useActivateUser', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.put on /users/{id}/activate', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.put).mockResolvedValue(makeUser({ is_active: true }))

    const { result } = renderHook(() => useActivateUser(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate('user-5')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.put).toHaveBeenCalledWith('/users/user-5/activate', {})
  })
})

describe('useRevokeUserSessions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.delete on /users/{id}/sessions', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.delete).mockResolvedValue(undefined)

    const { result } = renderHook(() => useRevokeUserSessions(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate('user-5')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.delete).toHaveBeenCalledWith('/users/user-5/sessions')
  })
})
