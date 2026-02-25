/**
 * Shared test utilities for the Ventana Magica frontend test suite.
 *
 * Provides:
 *  - createTestQueryClient()   — QueryClient with retries disabled
 *  - renderWithProviders()     — render helper that wraps in QueryClientProvider
 *  - Sample fixture factories  — makeUser, makeRole, makeInstitution, makePermission
 */

import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type {
  User,
  Role,
  Institution,
  Permission,
  PaginatedResponse,
} from '@/lib/admin-types'

// ─── QueryClient ─────────────────────────────────────────────────────────────

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// ─── Render wrapper ──────────────────────────────────────────────────────────

interface WrapperProps {
  queryClient?: QueryClient
}

export function renderWithProviders(
  ui: React.ReactElement,
  { queryClient, ...options }: WrapperProps & RenderOptions = {},
) {
  const client = queryClient ?? createTestQueryClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient: client }
}

// ─── Fixture factories ────────────────────────────────────────────────────────

export function makePermission(overrides: Partial<Permission> = {}): Permission {
  return {
    id: 'perm-1',
    code: 'users:read',
    name: 'Ver usuarios',
    description: null,
    module: 'users',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

export function makeRole(overrides: Partial<Role> = {}): Role {
  return {
    id: 'role-1',
    code: 'admin',
    name: 'Administrador',
    description: 'Rol de administrador',
    is_system: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
    permissions: [],
    ...overrides,
  }
}

export function makeInstitution(overrides: Partial<Institution> = {}): Institution {
  return {
    id: 'inst-1',
    code: 'MIDES',
    name: 'Ministerio de Desarrollo Social',
    description: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
    ...overrides,
  }
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    phone: null,
    role: { id: 'role-1', code: 'admin', name: 'Administrador' },
    institution: null,
    is_active: true,
    is_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
    last_login: null,
    ...overrides,
  }
}

export function makePaginatedResponse<T>(
  items: T[],
  overrides: Partial<PaginatedResponse<T>> = {},
): PaginatedResponse<T> {
  return {
    items,
    total: items.length,
    page: 1,
    size: 15,
    pages: 1,
    ...overrides,
  }
}
