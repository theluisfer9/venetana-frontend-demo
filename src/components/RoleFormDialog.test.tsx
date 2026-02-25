/**
 * Unit tests for RoleFormDialog component.
 *
 * Tests:
 *  - Create mode: title "Nuevo Rol", submit button "Crear"
 *  - Edit mode: title "Editar Rol", submit button "Guardar", pre-populated fields
 *  - System role: code and name inputs are disabled, warning message shown
 *  - onSubmit payload includes code and name in create mode
 *  - onSubmit payload includes id in edit mode
 *  - onSubmit for system role only passes description (not code/name)
 *  - Cancel calls onOpenChange(false)
 *  - isPending disables submit button
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoleFormDialog from './RoleFormDialog'
import { makeRole } from '@/test-utils'

function renderDialog(props: Partial<Parameters<typeof RoleFormDialog>[0]> = {}) {
  const defaults = {
    open: true,
    onOpenChange: vi.fn(),
    role: null,
    onSubmit: vi.fn(),
    isPending: false,
  }
  return render(<RoleFormDialog {...defaults} {...props} />)
}

describe('RoleFormDialog — create mode', () => {
  it('renders "Nuevo Rol" title', () => {
    renderDialog()
    expect(screen.getByText('Nuevo Rol')).toBeDefined()
  })

  it('renders "Crear" submit button', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /crear/i })).toBeDefined()
  })

  it('code and name inputs are not disabled in create mode', () => {
    renderDialog()
    const inputs = screen.getAllByRole('textbox')
    // code, name, description
    inputs.forEach((input) => {
      // description textarea is not disabled either
      expect(input).not.toHaveAttribute('disabled')
    })
  })

  it('calls onSubmit with code and name in create payload', async () => {
    const onSubmit = vi.fn()
    renderDialog({ onSubmit })

    const [codeInput, nameInput] = screen.getAllByRole('textbox')
    fireEvent.change(codeInput, { target: { value: 'viewer' } })
    fireEvent.change(nameInput, { target: { value: 'Visor' } })

    fireEvent.click(screen.getByRole('button', { name: /crear/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.code).toBe('viewer')
      expect(payload.name).toBe('Visor')
      expect(payload.id).toBeUndefined()
    })
  })

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    renderDialog({ onOpenChange })
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables submit button when isPending', () => {
    renderDialog({ isPending: true })
    expect(screen.getByRole('button', { name: /crear/i })).toHaveAttribute('disabled')
  })
})

describe('RoleFormDialog — edit mode (non-system role)', () => {
  const existingRole = makeRole({
    id: 'role-5',
    code: 'analyst',
    name: 'Analista',
    description: 'Rol de analista',
    is_system: false,
  })

  it('renders "Editar Rol" title', () => {
    renderDialog({ role: existingRole })
    expect(screen.getByText('Editar Rol')).toBeDefined()
  })

  it('renders "Guardar" submit button', () => {
    renderDialog({ role: existingRole })
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDefined()
  })

  it('pre-populates code, name and description fields', () => {
    renderDialog({ role: existingRole })
    expect(screen.getByDisplayValue('analyst')).toBeDefined()
    expect(screen.getByDisplayValue('Analista')).toBeDefined()
    expect(screen.getByDisplayValue('Rol de analista')).toBeDefined()
  })

  it('calls onSubmit with id included in edit payload', async () => {
    const onSubmit = vi.fn()
    renderDialog({ role: existingRole, onSubmit })

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.id).toBe('role-5')
      expect(payload.code).toBe('analyst')
      expect(payload.name).toBe('Analista')
    })
  })
})

describe('RoleFormDialog — edit mode (system role)', () => {
  const systemRole = makeRole({
    id: 'role-sys',
    code: 'superadmin',
    name: 'Super Admin',
    description: null,
    is_system: true,
  })

  it('shows system role warning message', () => {
    renderDialog({ role: systemRole })
    expect(screen.getByText(/rol de sistema/i)).toBeDefined()
  })

  it('disables code and name inputs for system roles', () => {
    renderDialog({ role: systemRole })
    expect(screen.getByDisplayValue('superadmin')).toHaveAttribute('disabled')
    expect(screen.getByDisplayValue('Super Admin')).toHaveAttribute('disabled')
  })

  it('onSubmit payload does NOT include code/name for system roles', async () => {
    const onSubmit = vi.fn()
    renderDialog({ role: systemRole, onSubmit })

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.id).toBe('role-sys')
      // code and name should NOT be in payload for system role
      expect(payload.code).toBeUndefined()
      expect(payload.name).toBeUndefined()
    })
  })
})
