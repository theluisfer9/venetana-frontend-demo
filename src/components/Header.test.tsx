/**
 * Unit tests for Header component.
 *
 * Tests:
 *  - Brand name "Ventana Magica" is always visible
 *  - When not authenticated: shows "Iniciar sesion" link, no admin section
 *  - When authenticated as non-admin: shows dashboard/beneficiarios links, no admin section
 *  - When authenticated as admin: shows "Administración" section with
 *    Usuarios, Roles, and Instituciones links
 *  - isAdminRole utility correctly identifies admin role codes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { isAdminRole } from '@/hooks/use-auth'

// ── Mocks ─────────────────────────────────────────────────────────────────────
// Header uses TanStack Router's <Link> and useNavigate — mock them.

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}))

vi.mock('@/hooks/use-auth', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/hooks/use-auth')>()
  return {
    ...original,
    isAuthenticated: vi.fn(() => false),
    useCurrentUser: vi.fn(() => ({ data: undefined })),
    useLogout: vi.fn(() => ({ mutate: vi.fn() })),
  }
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('isAdminRole utility', () => {
  it('returns true for "admin"', () => {
    expect(isAdminRole('admin')).toBe(true)
  })

  it('returns true for "superadmin"', () => {
    expect(isAdminRole('superadmin')).toBe(true)
  })

  it('returns true for "super_admin"', () => {
    expect(isAdminRole('super_admin')).toBe(true)
  })

  it('returns true for any code containing "admin"', () => {
    expect(isAdminRole('system_admin')).toBe(true)
  })

  it('returns false for "analyst"', () => {
    expect(isAdminRole('analyst')).toBe(false)
  })

  it('returns false for "institutional"', () => {
    expect(isAdminRole('institutional')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isAdminRole(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isAdminRole(undefined)).toBe(false)
  })

  it('is case-insensitive', () => {
    expect(isAdminRole('ADMIN')).toBe(true)
    expect(isAdminRole('Admin')).toBe(true)
  })
})

describe('Header component', () => {
  let mockIsAuthenticated: ReturnType<typeof vi.fn>
  let mockUseCurrentUser: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    const authModule = await import('@/hooks/use-auth')
    mockIsAuthenticated = vi.mocked(authModule.isAuthenticated)
    mockUseCurrentUser = vi.mocked(authModule.useCurrentUser)
    vi.clearAllMocks()
  })

  async function renderHeader() {
    const { default: Header } = await import('./Header')
    return render(<Header />)
  }

  it('shows the brand name in the header', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    mockUseCurrentUser.mockReturnValue({ data: undefined })

    await renderHeader()
    expect(screen.getAllByText('Magica').length).toBeGreaterThan(0)
  })

  it('shows "Iniciar sesion" when not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    mockUseCurrentUser.mockReturnValue({ data: undefined })

    await renderHeader()
    expect(screen.getByText('Iniciar sesion')).toBeDefined()
  })

  it('does NOT show admin links when not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    mockUseCurrentUser.mockReturnValue({ data: undefined })

    await renderHeader()
    expect(screen.queryByText('Administración')).toBeNull()
    expect(screen.queryByText('Usuarios')).toBeNull()
    expect(screen.queryByText('Roles')).toBeNull()
    expect(screen.queryByText('Instituciones')).toBeNull()
  })

  it('shows dashboard and beneficiarios links when authenticated as non-admin', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    mockUseCurrentUser.mockReturnValue({ data: { role_code: 'analyst' } })

    await renderHeader()
    expect(screen.getByText('Dashboard')).toBeDefined()
    expect(screen.getByText('Beneficiarios')).toBeDefined()
  })

  it('does NOT show admin section for non-admin role', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    mockUseCurrentUser.mockReturnValue({ data: { role_code: 'analyst' } })

    await renderHeader()
    expect(screen.queryByText('Administración')).toBeNull()
    expect(screen.queryByText('Usuarios')).toBeNull()
  })

  it('shows admin section with all three admin links when authenticated as admin', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    mockUseCurrentUser.mockReturnValue({ data: { role_code: 'admin' } })

    await renderHeader()
    expect(screen.getByText('Administración')).toBeDefined()
    expect(screen.getByText('Usuarios')).toBeDefined()
    expect(screen.getByText('Roles')).toBeDefined()
    expect(screen.getByText('Instituciones')).toBeDefined()
  })

  it('shows admin section for superadmin role', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    mockUseCurrentUser.mockReturnValue({ data: { role_code: 'superadmin' } })

    await renderHeader()
    expect(screen.getByText('Administración')).toBeDefined()
  })

  it('shows "Cerrar sesion" button when authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    mockUseCurrentUser.mockReturnValue({ data: { role_code: 'analyst' } })

    await renderHeader()
    expect(screen.getByText('Cerrar sesion')).toBeDefined()
  })
})
