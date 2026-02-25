/**
 * Unit tests for RolePermissionsDialog component.
 *
 * Tests:
 *  - Shows role name in title
 *  - Renders checkboxes for all permissions
 *  - Groups permissions by module with translated labels
 *  - Pre-checks permissions that are already assigned to the role
 *  - Toggling a checkbox changes its checked state
 *  - onSubmit is called with role id and selected permission ids
 *  - Cancel calls onOpenChange(false)
 *  - isPending disables the save button
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RolePermissionsDialog from './RolePermissionsDialog'
import { makeRole, makePermission } from '@/test-utils'
import type { Permission, Role } from '@/lib/admin-types'

const permissions: Permission[] = [
  makePermission({ id: 'p1', code: 'users:read', name: 'Ver usuarios', module: 'users' }),
  makePermission({ id: 'p2', code: 'users:write', name: 'Crear usuarios', module: 'users' }),
  makePermission({ id: 'p3', code: 'roles:read', name: 'Ver roles', module: 'roles' }),
]

function renderDialog(props: Partial<Parameters<typeof RolePermissionsDialog>[0]> = {}) {
  const role: Role = makeRole({
    id: 'role-1',
    name: 'Analista',
    permissions: [{ id: 'p1', code: 'users:read', name: 'Ver usuarios', module: 'users' }],
  })

  const defaults = {
    open: true,
    onOpenChange: vi.fn(),
    role,
    permissions,
    onSubmit: vi.fn(),
    isPending: false,
  }
  return render(<RolePermissionsDialog {...defaults} {...props} />)
}

describe('RolePermissionsDialog', () => {
  it('shows the role name in the dialog title', () => {
    renderDialog()
    expect(screen.getByText(/Analista/)).toBeDefined()
  })

  it('renders a checkbox for every permission', () => {
    renderDialog()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(permissions.length)
  })

  it('renders module section heading "Usuarios" for users module', () => {
    renderDialog()
    expect(screen.getByText('Usuarios')).toBeDefined()
  })

  it('renders module section heading "Roles" for roles module', () => {
    renderDialog()
    expect(screen.getByText('Roles')).toBeDefined()
  })

  it('pre-checks permissions already assigned to the role', () => {
    renderDialog()
    // p1 should be checked, p2 and p3 should not
    const checkboxes = screen.getAllByRole('checkbox')
    // Find checkbox for "Ver usuarios" (p1 — assigned)
    const verUsuariosCheckbox = screen.getByRole('checkbox', { name: /Ver usuarios/ }) as HTMLButtonElement
    expect(verUsuariosCheckbox).toHaveAttribute('data-state', 'checked')
  })

  it('unchecked permissions are not pre-selected', () => {
    renderDialog()
    const crearUsuariosCheckbox = screen.getByRole('checkbox', { name: /Crear usuarios/ }) as HTMLButtonElement
    expect(crearUsuariosCheckbox).toHaveAttribute('data-state', 'unchecked')
  })

  it('toggles a permission checkbox when clicked', async () => {
    renderDialog()
    const crearCheckbox = screen.getByRole('checkbox', { name: /Crear usuarios/ })
    expect(crearCheckbox).toHaveAttribute('data-state', 'unchecked')

    await userEvent.click(crearCheckbox)

    await waitFor(() => {
      expect(crearCheckbox).toHaveAttribute('data-state', 'checked')
    })
  })

  it('calls onSubmit with role id and selected permission ids', async () => {
    const onSubmit = vi.fn()
    renderDialog({ onSubmit })

    // p1 is pre-checked; click "Guardar permisos" to submit
    await userEvent.click(screen.getByRole('button', { name: /guardar permisos/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      const [roleId, permissionIds] = onSubmit.mock.calls[0]
      expect(roleId).toBe('role-1')
      expect(permissionIds).toContain('p1')
      expect(permissionIds).not.toContain('p2')
      expect(permissionIds).not.toContain('p3')
    })
  })

  it('includes newly toggled permissions in the submitted ids', async () => {
    const onSubmit = vi.fn()
    renderDialog({ onSubmit })

    // Toggle p2 on
    await userEvent.click(screen.getByRole('checkbox', { name: /Crear usuarios/ }))
    await userEvent.click(screen.getByRole('button', { name: /guardar permisos/i }))

    await waitFor(() => {
      const [, permissionIds] = onSubmit.mock.calls[0]
      expect(permissionIds).toContain('p1')
      expect(permissionIds).toContain('p2')
    })
  })

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    renderDialog({ onOpenChange })
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables the save button when isPending is true', () => {
    renderDialog({ isPending: true })
    expect(screen.getByRole('button', { name: /guardar permisos/i })).toHaveAttribute('disabled')
  })

  it('does not call onSubmit if role is null', async () => {
    const onSubmit = vi.fn()
    render(
      <RolePermissionsDialog
        open={true}
        onOpenChange={vi.fn()}
        role={null}
        permissions={permissions}
        onSubmit={onSubmit}
        isPending={false}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /guardar permisos/i }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
