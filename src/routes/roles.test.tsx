/**
 * Integration tests for RolesPage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { makeRole, makePermission, createTestQueryClient } from '@/test-utils'
import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/hooks/use-auth', () => ({
  isAuthenticated: vi.fn(() => true),
}))

const mockUseRoles = vi.fn()
const mockUsePermissions = vi.fn()
const mockCreateRole = vi.fn()
const mockUpdateRole = vi.fn()
const mockDeleteRole = vi.fn()
const mockUpdatePerms = vi.fn()

vi.mock('@/hooks/use-roles', () => ({
  useRoles: () => mockUseRoles(),
  usePermissions: () => mockUsePermissions(),
  useCreateRole: () => ({ mutate: mockCreateRole, isPending: false }),
  useUpdateRole: () => ({ mutate: mockUpdateRole, isPending: false }),
  useDeleteRole: () => ({ mutate: mockDeleteRole, isPending: false }),
  useUpdateRolePermissions: () => ({ mutate: mockUpdatePerms, isPending: false }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const original = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...original,
    redirect: vi.fn(),
    createRoute: vi.fn((config: { component: React.ComponentType }) => ({ component: config.component })),
  }
})

async function importRolesPage() {
  const routeModule = await import('./roles')
  const fakeParent = {} as Parameters<typeof routeModule.default>[0]
  const route = routeModule.default(fakeParent) as { component: React.ComponentType }
  return route.component
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RolesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePermissions.mockReturnValue({ data: [makePermission()] })
  })

  it('renders "Roles" heading', async () => {
    mockUseRoles.mockReturnValue({ data: [], isLoading: false })

    const RolesPage = await importRolesPage()
    renderWithQuery(<RolesPage />)

    expect(screen.getByText('Roles')).toBeDefined()
  })

  it('shows "Nuevo Rol" button', async () => {
    mockUseRoles.mockReturnValue({ data: [], isLoading: false })

    const RolesPage = await importRolesPage()
    renderWithQuery(<RolesPage />)

    expect(screen.getByRole('button', { name: /nuevo rol/i })).toBeDefined()
  })

  it('shows empty-state message when no roles', async () => {
    mockUseRoles.mockReturnValue({ data: [], isLoading: false })

    const RolesPage = await importRolesPage()
    renderWithQuery(<RolesPage />)

    expect(screen.getByText(/no hay roles/i)).toBeDefined()
  })

  it('renders role rows with code, name, and permission count', async () => {
    const role = makeRole({
      id: 'r1',
      code: 'analyst',
      name: 'Analista',
      permissions: [
        { id: 'p1', code: 'users:read', name: 'Ver usuarios', module: 'users' },
        { id: 'p2', code: 'roles:read', name: 'Ver roles', module: 'roles' },
      ],
    })
    mockUseRoles.mockReturnValue({ data: [role], isLoading: false })

    const RolesPage = await importRolesPage()
    renderWithQuery(<RolesPage />)

    expect(screen.getByText('analyst')).toBeDefined()
    expect(screen.getByText('Analista')).toBeDefined()
    // Permission count badge
    expect(screen.getByText('2')).toBeDefined()
  })

  it('shows "Sistema" badge for system roles', async () => {
    const role = makeRole({ is_system: true, name: 'Super Admin' })
    mockUseRoles.mockReturnValue({ data: [role], isLoading: false })

    const RolesPage = await importRolesPage()
    renderWithQuery(<RolesPage />)

    expect(screen.getByText('Sistema')).toBeDefined()
  })

  it('hides delete button for system roles', async () => {
    const role = makeRole({ is_system: true })
    mockUseRoles.mockReturnValue({ data: [role], isLoading: false })

    const RolesPage = await importRolesPage()
    const { container } = renderWithQuery(<RolesPage />)

    // There should be edit and shield buttons but no trash button for system roles
    const row = screen.getByText(role.name).closest('tr')
    const buttons = row ? Array.from(row.querySelectorAll('button')) : []
    // Should have at most 2 action buttons (edit + permissions), not 3
    expect(buttons.length).toBeLessThanOrEqual(2)
  })

  it('shows delete button for non-system roles', async () => {
    const role = makeRole({ is_system: false, name: 'Custom Role' })
    mockUseRoles.mockReturnValue({ data: [role], isLoading: false })

    const RolesPage = await importRolesPage()
    renderWithQuery(<RolesPage />)

    const row = screen.getByText('Custom Role').closest('tr')
    const buttons = row ? Array.from(row.querySelectorAll('button')) : []
    // Should have 3 action buttons: edit, permissions, delete
    expect(buttons.length).toBe(3)
  })

  it('opens create dialog when "Nuevo Rol" is clicked', async () => {
    mockUseRoles.mockReturnValue({ data: [], isLoading: false })

    const RolesPage = await importRolesPage()
    renderWithQuery(<RolesPage />)

    await userEvent.click(screen.getByRole('button', { name: /nuevo rol/i }))

    // After opening the dialog, look for the "Crear" submit button which only
    // appears inside the dialog form (the trigger button is labeled "Nuevo Rol").
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^crear$/i })).toBeDefined()
    })
  })

  it('opens edit dialog when edit button is clicked', async () => {
    const role = makeRole({ id: 'r1', code: 'viewer', name: 'Visor' })
    mockUseRoles.mockReturnValue({ data: [role], isLoading: false })

    const RolesPage = await importRolesPage()
    renderWithQuery(<RolesPage />)

    const row = screen.getByText('Visor').closest('tr')
    if (row) {
      const buttons = Array.from(row.querySelectorAll('button'))
      await userEvent.click(buttons[0]) // first button is edit

      await waitFor(() => {
        expect(screen.getByText('Editar Rol')).toBeDefined()
      })
    }
  })

  it('opens permissions dialog when shield button is clicked', async () => {
    const role = makeRole({ id: 'r1', name: 'Visor' })
    mockUseRoles.mockReturnValue({ data: [role], isLoading: false })

    const RolesPage = await importRolesPage()
    renderWithQuery(<RolesPage />)

    const row = screen.getByText('Visor').closest('tr')
    if (row) {
      const buttons = Array.from(row.querySelectorAll('button'))
      await userEvent.click(buttons[1]) // second button is permissions

      // The dialog title is "Permisos — Visor". Look for the save button
      // "Guardar permisos" which is unique to the permissions dialog and does
      // not conflict with the "Permisos" table header column.
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /guardar permisos/i })).toBeDefined()
      })
    }
  })

  it('shows skeleton rows while loading', async () => {
    mockUseRoles.mockReturnValue({ data: undefined, isLoading: true })

    const RolesPage = await importRolesPage()
    renderWithQuery(<RolesPage />)

    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(1)
  })
})
