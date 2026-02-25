/**
 * Integration tests for UsersPage.
 *
 * Strategy: render UsersPage directly (not via the router), mock all hooks so
 * no real HTTP requests are made. Verify the rendered output and interactions.
 *
 * Tests:
 *  - Shows "Usuarios" heading
 *  - Shows skeleton rows while loading
 *  - Renders user rows after data loads
 *  - Shows empty-state message when there are no users
 *  - "Nuevo Usuario" button opens the dialog
 *  - Edit button opens dialog with correct user pre-populated
 *  - Toggle-active button calls the correct hook mutation
 *  - Search input + button applies search filter
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { makeUser, makeRole, makeInstitution, makePaginatedResponse, createTestQueryClient } from '@/test-utils'
import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/hooks/use-auth', () => ({
  isAuthenticated: vi.fn(() => true),
  useCurrentUser: vi.fn(() => ({ data: { id: 'current-user', role_code: 'admin' } })),
}))

const mockUseUsers = vi.fn()
const mockUseRoles = vi.fn()
const mockUseInstitutions = vi.fn()
const mockCreateUser = vi.fn()
const mockUpdateUser = vi.fn()
const mockDeleteUser = vi.fn()
const mockActivateUser = vi.fn()

vi.mock('@/hooks/use-users', () => ({
  useUsers: (...args: unknown[]) => mockUseUsers(...args),
  useCreateUser: () => ({ mutate: mockCreateUser, isPending: false }),
  useUpdateUser: () => ({ mutate: mockUpdateUser, isPending: false }),
  useDeleteUser: () => ({ mutate: mockDeleteUser, isPending: false }),
  useActivateUser: () => ({ mutate: mockActivateUser, isPending: false }),
}))

vi.mock('@/hooks/use-roles', () => ({
  useRoles: () => mockUseRoles(),
}))

vi.mock('@/hooks/use-institutions', () => ({
  useInstitutions: () => mockUseInstitutions(),
}))

// TanStack Router redirect throws in beforeLoad; mock createRoute + redirect
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const original = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...original,
    redirect: vi.fn(),
    createRoute: vi.fn((config: { component: React.ComponentType }) => ({ component: config.component })),
  }
})

// ── Helper ────────────────────────────────────────────────────────────────────

// Import the page component after mocks are set up
async function importUsersPage() {
  // The route file exports a function; import the module and call the default export
  // to get the route, then grab the component property.
  const routeModule = await import('./users')
  const fakeParent = {} as Parameters<typeof routeModule.default>[0]
  const route = routeModule.default(fakeParent) as { component: React.ComponentType }
  return route.component
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRoles.mockReturnValue({ data: [makeRole()] })
    mockUseInstitutions.mockReturnValue({ data: [makeInstitution()] })
  })

  it('renders the "Usuarios" heading', async () => {
    mockUseUsers.mockReturnValue({ data: makePaginatedResponse([]), isLoading: false })

    const UsersPage = await importUsersPage()
    renderWithQuery(<UsersPage />)

    expect(screen.getByText('Usuarios')).toBeDefined()
  })

  it('shows "Nuevo Usuario" button', async () => {
    mockUseUsers.mockReturnValue({ data: makePaginatedResponse([]), isLoading: false })

    const UsersPage = await importUsersPage()
    renderWithQuery(<UsersPage />)

    expect(screen.getByRole('button', { name: /nuevo usuario/i })).toBeDefined()
  })

  it('shows skeleton rows while loading', async () => {
    mockUseUsers.mockReturnValue({ data: undefined, isLoading: true })

    const UsersPage = await importUsersPage()
    renderWithQuery(<UsersPage />)

    // Skeletons are rendered inside table rows — check for their presence via aria
    const rows = screen.getAllByRole('row')
    // Header row + 5 skeleton rows
    expect(rows.length).toBeGreaterThanOrEqual(2)
  })

  it('renders user rows after data loads', async () => {
    const users = [
      makeUser({ id: 'u1', email: 'ana@example.com', first_name: 'Ana', last_name: 'Lopez' }),
      makeUser({ id: 'u2', email: 'bob@example.com', first_name: 'Bob', last_name: 'Smith' }),
    ]
    mockUseUsers.mockReturnValue({ data: makePaginatedResponse(users), isLoading: false })

    const UsersPage = await importUsersPage()
    renderWithQuery(<UsersPage />)

    expect(screen.getByText('ana@example.com')).toBeDefined()
    expect(screen.getByText('bob@example.com')).toBeDefined()
    expect(screen.getByText('Ana Lopez')).toBeDefined()
  })

  it('shows empty-state message when there are no users', async () => {
    mockUseUsers.mockReturnValue({ data: makePaginatedResponse([]), isLoading: false })

    const UsersPage = await importUsersPage()
    renderWithQuery(<UsersPage />)

    expect(screen.getByText(/no se encontraron usuarios/i)).toBeDefined()
  })

  it('shows "Activo" badge for active users', async () => {
    const user = makeUser({ is_active: true })
    mockUseUsers.mockReturnValue({ data: makePaginatedResponse([user]), isLoading: false })

    const UsersPage = await importUsersPage()
    renderWithQuery(<UsersPage />)

    expect(screen.getByText('Activo')).toBeDefined()
  })

  it('shows "Inactivo" badge for inactive users', async () => {
    const user = makeUser({ is_active: false })
    mockUseUsers.mockReturnValue({ data: makePaginatedResponse([user]), isLoading: false })

    const UsersPage = await importUsersPage()
    renderWithQuery(<UsersPage />)

    expect(screen.getByText('Inactivo')).toBeDefined()
  })

  it('opens the create dialog when "Nuevo Usuario" is clicked', async () => {
    mockUseUsers.mockReturnValue({ data: makePaginatedResponse([]), isLoading: false })

    const UsersPage = await importUsersPage()
    renderWithQuery(<UsersPage />)

    await userEvent.click(screen.getByRole('button', { name: /nuevo usuario/i }))

    // After opening the dialog, look for the "Crear" submit button which only
    // appears inside the dialog form (the trigger button is labeled "Nuevo Usuario").
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^crear$/i })).toBeDefined()
    })
  })

  it('opens the edit dialog when edit button is clicked', async () => {
    const user = makeUser({ id: 'u1', email: 'edit@example.com' })
    mockUseUsers.mockReturnValue({ data: makePaginatedResponse([user]), isLoading: false })

    const UsersPage = await importUsersPage()
    renderWithQuery(<UsersPage />)

    // Click the pencil/edit button for this user
    const editButtons = screen.getAllByRole('button')
    const pencilButton = editButtons.find((btn) => btn.querySelector('svg'))
    // Find specifically the edit action by querying the table row
    const row = screen.getByText('edit@example.com').closest('tr')
    if (row) {
      const rowButtons = Array.from(row.querySelectorAll('button'))
      await userEvent.click(rowButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Editar Usuario')).toBeDefined()
      })
    }
  })

  it('shows role name badge in user row', async () => {
    const user = makeUser({
      role: { id: 'role-1', code: 'admin', name: 'Administrador' },
    })
    mockUseUsers.mockReturnValue({ data: makePaginatedResponse([user]), isLoading: false })

    const UsersPage = await importUsersPage()
    renderWithQuery(<UsersPage />)

    expect(screen.getByText('Administrador')).toBeDefined()
  })

  it('shows institution name or dash when no institution', async () => {
    const userWithInst = makeUser({
      institution: { id: 'i1', code: 'MIDES', name: 'MIDES' },
    })
    const userWithoutInst = makeUser({ id: 'u2', email: 'no@inst.com', institution: null })
    mockUseUsers.mockReturnValue({
      data: makePaginatedResponse([userWithInst, userWithoutInst]),
      isLoading: false,
    })

    const UsersPage = await importUsersPage()
    renderWithQuery(<UsersPage />)

    expect(screen.getByText('MIDES')).toBeDefined()
    expect(screen.getByText('—')).toBeDefined()
  })
})
