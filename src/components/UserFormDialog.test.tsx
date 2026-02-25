/**
 * Unit tests for UserFormDialog component.
 *
 * Tests:
 *  - Renders "Nuevo Usuario" title in create mode (user = null)
 *  - Renders "Editar Usuario" title in edit mode
 *  - Create mode shows password field; edit mode hides it
 *  - Edit mode shows active status toggle
 *  - Pre-populates form fields from the user object in edit mode
 *  - Calls onSubmit with correct payload on form submit
 *  - Calls onOpenChange(false) when Cancel is clicked
 *  - Submit button is disabled when isPending = true
 *  - Submit button is disabled when no role is selected
 *  - Only active institutions appear in the institution dropdown
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserFormDialog from './UserFormDialog'
import { makeUser, makeRole, makeInstitution } from '@/test-utils'
import type { Role, Institution } from '@/lib/admin-types'

const defaultRoles: Role[] = [
  makeRole({ id: 'role-1', code: 'admin', name: 'Administrador' }),
  makeRole({ id: 'role-2', code: 'analyst', name: 'Analista' }),
]

const defaultInstitutions: Institution[] = [
  makeInstitution({ id: 'inst-1', code: 'MIDES', name: 'MIDES', is_active: true }),
  makeInstitution({ id: 'inst-2', code: 'INACT', name: 'Inactiva SA', is_active: false }),
]

function renderDialog(props: Partial<Parameters<typeof UserFormDialog>[0]> = {}) {
  const defaults = {
    open: true,
    onOpenChange: vi.fn(),
    user: null,
    roles: defaultRoles,
    institutions: defaultInstitutions,
    onSubmit: vi.fn(),
    isPending: false,
  }
  return render(<UserFormDialog {...defaults} {...props} />)
}

describe('UserFormDialog — create mode', () => {
  it('renders "Nuevo Usuario" title', () => {
    renderDialog({ user: null })
    expect(screen.getByText('Nuevo Usuario')).toBeDefined()
  })

  it('shows the password field in create mode', () => {
    renderDialog({ user: null })
    expect(screen.getByText('Contraseña *')).toBeDefined()
  })

  it('does NOT show the active-status toggle in create mode', () => {
    renderDialog({ user: null })
    expect(screen.queryByText('Usuario activo')).toBeNull()
  })

  it('disables submit button when no role is selected', () => {
    renderDialog({ user: null })
    const submitBtn = screen.getByRole('button', { name: /crear/i })
    expect(submitBtn).toHaveAttribute('disabled')
  })

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    renderDialog({ onOpenChange })
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows spinner and disables submit when isPending', () => {
    renderDialog({ isPending: true, user: null })
    const submitBtn = screen.getByRole('button', { name: /crear/i })
    expect(submitBtn).toHaveAttribute('disabled')
  })

  it('only shows active institutions in the institution dropdown', async () => {
    renderDialog({ user: null })
    // Open the institution select trigger (second combobox, after the role one)
    const triggers = screen.getAllByRole('combobox')
    const institutionTrigger = triggers[1]
    await userEvent.click(institutionTrigger)

    // Wait for the listbox to appear in the DOM
    const listbox = await screen.findByRole('listbox')

    // Query only inside the open listbox to avoid matching the trigger's
    // display span. Radix renders each SelectItem as role="option".
    const { getAllByRole, queryByText } = within(listbox)
    const optionTexts = getAllByRole('option').map((o) => o.textContent)
    expect(optionTexts).toContain('MIDES')
    expect(queryByText('Inactiva SA')).toBeNull()
  })
})

describe('UserFormDialog — edit mode', () => {
  const existingUser = makeUser({
    id: 'user-1',
    email: 'edit@example.com',
    username: 'edituser',
    first_name: 'Edit',
    last_name: 'Me',
    role: { id: 'role-1', code: 'admin', name: 'Administrador' },
    institution: { id: 'inst-1', code: 'MIDES', name: 'MIDES' },
    is_active: true,
  })

  it('renders "Editar Usuario" title', () => {
    renderDialog({ user: existingUser })
    expect(screen.getByText('Editar Usuario')).toBeDefined()
  })

  it('does NOT show the password field in edit mode', () => {
    renderDialog({ user: existingUser })
    expect(screen.queryByText('Contraseña *')).toBeNull()
  })

  it('shows the active-status toggle in edit mode', () => {
    renderDialog({ user: existingUser })
    expect(screen.getByText('Usuario activo')).toBeDefined()
  })

  it('pre-populates email and username from the user object', () => {
    renderDialog({ user: existingUser })
    expect(screen.getByDisplayValue('edit@example.com')).toBeDefined()
    expect(screen.getByDisplayValue('edituser')).toBeDefined()
  })

  it('pre-populates first and last name', () => {
    renderDialog({ user: existingUser })
    expect(screen.getByDisplayValue('Edit')).toBeDefined()
    expect(screen.getByDisplayValue('Me')).toBeDefined()
  })

  it('renders "Guardar" button in edit mode', () => {
    renderDialog({ user: existingUser })
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDefined()
  })

  it('calls onSubmit with id included in the payload', async () => {
    const onSubmit = vi.fn()
    renderDialog({ user: existingUser, onSubmit })

    // Submit with existing values
    const form = screen.getByRole('button', { name: /guardar/i })
    fireEvent.click(form)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.id).toBe('user-1')
      expect(payload.email).toBe('edit@example.com')
    })
  })

  it('does NOT include password in the edit payload', async () => {
    const onSubmit = vi.fn()
    renderDialog({ user: existingUser, onSubmit })

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.password).toBeUndefined()
    })
  })

  it('includes is_active: false in payload after toggling the switch off', async () => {
    const onSubmit = vi.fn()
    const user = makeUser({ is_active: true })
    renderDialog({ user, onSubmit })

    const toggle = screen.getByRole('switch')
    await userEvent.click(toggle)

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.is_active).toBe(false)
    })
  })

  it('includes role_id in edit-mode submission payload', async () => {
    const onSubmit = vi.fn()
    const user = makeUser({ role: { id: 'role-1', code: 'admin', name: 'Admin' } })
    renderDialog({ user, onSubmit })

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.role_id).toBe('role-1')
    })
  })

  it('sends institution_id: null when user has no institution', async () => {
    const onSubmit = vi.fn()
    const user = makeUser({ institution: null })
    renderDialog({ user, onSubmit })

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.institution_id).toBeNull()
    })
  })

  it('sends phone: null when phone field is empty', async () => {
    const onSubmit = vi.fn()
    const user = makeUser({ phone: null })
    renderDialog({ user, onSubmit })

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.phone).toBeNull()
    })
  })
})
