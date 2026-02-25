/**
 * Integration tests for InstitutionsPage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { makeInstitution, createTestQueryClient } from '@/test-utils'
import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/hooks/use-auth', () => ({
  isAuthenticated: vi.fn(() => true),
}))

const mockUseInstitutions = vi.fn()
const mockCreateInstitution = vi.fn()
const mockUpdateInstitution = vi.fn()
const mockDeleteInstitution = vi.fn()

vi.mock('@/hooks/use-institutions', () => ({
  useInstitutions: () => mockUseInstitutions(),
  useCreateInstitution: () => ({ mutate: mockCreateInstitution, isPending: false }),
  useUpdateInstitution: () => ({ mutate: mockUpdateInstitution, isPending: false }),
  useDeleteInstitution: () => ({ mutate: mockDeleteInstitution, isPending: false }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const original = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...original,
    redirect: vi.fn(),
    createRoute: vi.fn((config: { component: React.ComponentType }) => ({ component: config.component })),
  }
})

async function importInstitutionsPage() {
  const routeModule = await import('./institutions')
  const fakeParent = {} as Parameters<typeof routeModule.default>[0]
  const route = routeModule.default(fakeParent) as { component: React.ComponentType }
  return route.component
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InstitutionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Instituciones" heading', async () => {
    mockUseInstitutions.mockReturnValue({ data: [], isLoading: false })

    const InstitutionsPage = await importInstitutionsPage()
    renderWithQuery(<InstitutionsPage />)

    expect(screen.getByText('Instituciones')).toBeDefined()
  })

  it('shows "Nueva Institución" button', async () => {
    mockUseInstitutions.mockReturnValue({ data: [], isLoading: false })

    const InstitutionsPage = await importInstitutionsPage()
    renderWithQuery(<InstitutionsPage />)

    expect(screen.getByRole('button', { name: /nueva institución/i })).toBeDefined()
  })

  it('shows empty-state message when no institutions', async () => {
    mockUseInstitutions.mockReturnValue({ data: [], isLoading: false })

    const InstitutionsPage = await importInstitutionsPage()
    renderWithQuery(<InstitutionsPage />)

    expect(screen.getByText(/no hay instituciones/i)).toBeDefined()
  })

  it('renders institution rows with code, name, and status', async () => {
    const institutions = [
      makeInstitution({ id: 'i1', code: 'MIDES', name: 'Min. Desarrollo Social', is_active: true }),
      makeInstitution({ id: 'i2', code: 'MAGA', name: 'Min. Agricultura', is_active: false }),
    ]
    mockUseInstitutions.mockReturnValue({ data: institutions, isLoading: false })

    const InstitutionsPage = await importInstitutionsPage()
    renderWithQuery(<InstitutionsPage />)

    expect(screen.getByText('MIDES')).toBeDefined()
    expect(screen.getByText('Min. Desarrollo Social')).toBeDefined()
    expect(screen.getByText('MAGA')).toBeDefined()
  })

  it('shows "Activa" badge for active institutions', async () => {
    mockUseInstitutions.mockReturnValue({
      data: [makeInstitution({ is_active: true })],
      isLoading: false,
    })

    const InstitutionsPage = await importInstitutionsPage()
    renderWithQuery(<InstitutionsPage />)

    expect(screen.getByText('Activa')).toBeDefined()
  })

  it('shows "Inactiva" badge for inactive institutions', async () => {
    mockUseInstitutions.mockReturnValue({
      data: [makeInstitution({ is_active: false })],
      isLoading: false,
    })

    const InstitutionsPage = await importInstitutionsPage()
    renderWithQuery(<InstitutionsPage />)

    expect(screen.getByText('Inactiva')).toBeDefined()
  })

  it('shows delete button only for active institutions', async () => {
    const active = makeInstitution({ id: 'i1', name: 'Activa Inst', is_active: true })
    const inactive = makeInstitution({ id: 'i2', name: 'Inactiva Inst', is_active: false })
    mockUseInstitutions.mockReturnValue({
      data: [active, inactive],
      isLoading: false,
    })

    const InstitutionsPage = await importInstitutionsPage()
    renderWithQuery(<InstitutionsPage />)

    const activeRow = screen.getByText('Activa Inst').closest('tr')
    const inactiveRow = screen.getByText('Inactiva Inst').closest('tr')

    if (activeRow && inactiveRow) {
      const activeButtons = activeRow.querySelectorAll('button')
      const inactiveButtons = inactiveRow.querySelectorAll('button')
      // Active row: edit + delete = 2 buttons
      expect(activeButtons.length).toBe(2)
      // Inactive row: edit only = 1 button
      expect(inactiveButtons.length).toBe(1)
    }
  })

  it('opens create dialog when "Nueva Institución" is clicked', async () => {
    mockUseInstitutions.mockReturnValue({ data: [], isLoading: false })

    const InstitutionsPage = await importInstitutionsPage()
    renderWithQuery(<InstitutionsPage />)

    await userEvent.click(screen.getByRole('button', { name: /nueva institución/i }))

    // The dialog renders a form with a submit button labeled "Crear"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^crear$/i })).toBeDefined()
    })
  })

  it('opens edit dialog when edit button is clicked', async () => {
    // Use distinct code and name so getByText does not match two table cells.
    const inst = makeInstitution({ id: 'i1', code: 'SESAN', name: 'Secretaría SAN', is_active: true })
    mockUseInstitutions.mockReturnValue({ data: [inst], isLoading: false })

    const InstitutionsPage = await importInstitutionsPage()
    renderWithQuery(<InstitutionsPage />)

    // getByText('Secretaría SAN') uniquely identifies the name cell.
    const row = screen.getByText('Secretaría SAN').closest('tr')
    if (row) {
      const buttons = Array.from(row.querySelectorAll('button'))
      await userEvent.click(buttons[0]) // first is edit

      // In edit mode the submit button reads "Guardar"
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^guardar$/i })).toBeDefined()
      })
    }
  })

  it('shows skeleton rows while loading', async () => {
    mockUseInstitutions.mockReturnValue({ data: undefined, isLoading: true })

    const InstitutionsPage = await importInstitutionsPage()
    renderWithQuery(<InstitutionsPage />)

    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(1)
  })

  it('shows description or dash when no description', async () => {
    const inst1 = makeInstitution({ id: 'i1', description: 'Descripcion aqui' })
    const inst2 = makeInstitution({ id: 'i2', description: null, code: 'X2', name: 'Sin desc' })
    mockUseInstitutions.mockReturnValue({ data: [inst1, inst2], isLoading: false })

    const InstitutionsPage = await importInstitutionsPage()
    renderWithQuery(<InstitutionsPage />)

    expect(screen.getByText('Descripcion aqui')).toBeDefined()
    expect(screen.getByText('—')).toBeDefined()
  })

  describe('delete institution', () => {
    it('confirm accepted - calls deleteInstitution with institution id', async () => {
      const inst = makeInstitution({ id: 'inst-del', name: 'Borrable Inst', is_active: true })
      mockUseInstitutions.mockReturnValue({ data: [inst], isLoading: false })

      const InstitutionsPage = await importInstitutionsPage()
      renderWithQuery(<InstitutionsPage />)

      const row = screen.getByText('Borrable Inst').closest('tr')
      const buttons = row ? Array.from(row.querySelectorAll('button')) : []
      expect(buttons.length).toBe(2)
      await userEvent.click(buttons[1])

      // AlertDialog should appear with institution name in description
      await waitFor(() => {
        expect(screen.getByText('¿Desactivar institución?')).toBeDefined()
      })

      // Click "Desactivar" in the AlertDialog
      await userEvent.click(screen.getByRole('button', { name: /^desactivar$/i }))

      expect(mockDeleteInstitution).toHaveBeenCalledWith(
        inst.id,
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      )
    })

    it('confirm cancelled - does NOT call deleteInstitution', async () => {
      const inst = makeInstitution({ id: 'inst-cancel', name: 'NoDelete Inst', is_active: true })
      mockUseInstitutions.mockReturnValue({ data: [inst], isLoading: false })

      const InstitutionsPage = await importInstitutionsPage()
      renderWithQuery(<InstitutionsPage />)

      const row = screen.getByText('NoDelete Inst').closest('tr')
      const buttons = row ? Array.from(row.querySelectorAll('button')) : []
      await userEvent.click(buttons[1])

      // AlertDialog should appear
      await waitFor(() => {
        expect(screen.getByText('¿Desactivar institución?')).toBeDefined()
      })

      // Click "Cancelar" in the AlertDialog
      await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))

      expect(mockDeleteInstitution).not.toHaveBeenCalled()
    })
  })
})
