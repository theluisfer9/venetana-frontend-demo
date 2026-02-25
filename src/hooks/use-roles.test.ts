/**
 * Unit tests for use-roles.ts hooks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useRoles,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useUpdateRolePermissions,
} from './use-roles'
import { createTestQueryClient, makeRole, makePermission } from '@/test-utils'

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

describe('useRoles', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('fetches roles from /roles/ endpoint', async () => {
    const { apiClient } = await import('@/lib/api')
    const roles = [makeRole(), makeRole({ id: 'role-2', code: 'analyst', name: 'Analista' })]
    vi.mocked(apiClient.get).mockResolvedValue(roles)

    const { result } = renderHook(() => useRoles(), {
      wrapper: makeWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.get).toHaveBeenCalledWith('/roles/')
    expect(result.current.data).toHaveLength(2)
  })

  it('is disabled when not authenticated', async () => {
    const { isAuthenticated } = await import('@/hooks/use-auth')
    vi.mocked(isAuthenticated).mockReturnValue(false)

    const { result } = renderHook(() => useRoles(), {
      wrapper: makeWrapper(queryClient),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})

describe('usePermissions', () => {
  let queryClient: QueryClient

  beforeEach(async () => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
    const { isAuthenticated } = await import('@/hooks/use-auth')
    vi.mocked(isAuthenticated).mockReturnValue(true)
  })

  it('fetches permissions from /roles/permissions endpoint', async () => {
    const { apiClient } = await import('@/lib/api')
    const perms = [
      makePermission(),
      makePermission({ id: 'perm-2', code: 'users:write', name: 'Crear usuarios' }),
    ]
    vi.mocked(apiClient.get).mockResolvedValue(perms)

    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.get).toHaveBeenCalledWith('/roles/permissions')
    expect(result.current.data).toHaveLength(2)
  })
})

describe('useCreateRole', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.post with /roles/ and body', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.post).mockResolvedValue(makeRole())

    const { result } = renderHook(() => useCreateRole(), {
      wrapper: makeWrapper(queryClient),
    })

    const body = { code: 'viewer', name: 'Visor', description: null }

    await act(async () => {
      result.current.mutate(body)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.post).toHaveBeenCalledWith('/roles/', body)
  })

  it('invalidates roles query on success', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.post).mockResolvedValue(makeRole())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateRole(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate({ code: 'x', name: 'X' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['roles'] })
  })
})

describe('useUpdateRole', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.put with correct role ID in path', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.put).mockResolvedValue(makeRole({ name: 'Updated' }))

    const { result } = renderHook(() => useUpdateRole(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate({ id: 'role-1', name: 'Updated' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.put).toHaveBeenCalledWith('/roles/role-1', { name: 'Updated' })
  })

  it('invalidates roles query on success', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.put).mockResolvedValue(makeRole())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateRole(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate({ id: 'role-1', name: 'Z' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['roles'] })
  })
})

describe('useDeleteRole', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.delete with correct role ID in path', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.delete).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteRole(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate('role-42')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.delete).toHaveBeenCalledWith('/roles/role-42')
  })

  it('invalidates roles query on success', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.delete).mockResolvedValue(undefined)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteRole(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate('role-1')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['roles'] })
  })
})

describe('useUpdateRolePermissions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('calls apiClient.put on /roles/{id}/permissions with permission_ids', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.put).mockResolvedValue(makeRole())

    const { result } = renderHook(() => useUpdateRolePermissions(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate({ id: 'role-1', permission_ids: ['perm-1', 'perm-2'] })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiClient.put).toHaveBeenCalledWith('/roles/role-1/permissions', {
      permission_ids: ['perm-1', 'perm-2'],
    })
  })

  it('invalidates roles query on success', async () => {
    const { apiClient } = await import('@/lib/api')
    vi.mocked(apiClient.put).mockResolvedValue(makeRole())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateRolePermissions(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      result.current.mutate({ id: 'role-1', permission_ids: [] })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['roles'] })
  })
})
