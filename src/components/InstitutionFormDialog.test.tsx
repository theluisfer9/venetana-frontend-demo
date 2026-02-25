/**
 * Unit tests for InstitutionFormDialog component.
 *
 * Tests:
 *  - Create mode: "Nueva Institución" title, "Crear" button, no active toggle
 *  - Edit mode: "Editar Institución" title, "Guardar" button, active toggle visible
 *  - Pre-populates fields in edit mode
 *  - Create payload includes code, name, description (no id, no is_active)
 *  - Edit payload includes id and is_active
 *  - Cancel calls onOpenChange(false)
 *  - isPending disables submit button
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InstitutionFormDialog from './InstitutionFormDialog'
import { makeInstitution } from '@/test-utils'

function renderDialog(props: Partial<Parameters<typeof InstitutionFormDialog>[0]> = {}) {
  const defaults = {
    open: true,
    onOpenChange: vi.fn(),
    institution: null,
    onSubmit: vi.fn(),
    isPending: false,
  }
  return render(<InstitutionFormDialog {...defaults} {...props} />)
}

describe('InstitutionFormDialog — create mode', () => {
  it('renders "Nueva Institución" title', () => {
    renderDialog()
    expect(screen.getByText('Nueva Institución')).toBeDefined()
  })

  it('renders "Crear" submit button', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /crear/i })).toBeDefined()
  })

  it('does NOT show the is_active toggle in create mode', () => {
    renderDialog()
    expect(screen.queryByText('Activa')).toBeNull()
  })

  it('starts with empty code and name fields', () => {
    renderDialog()
    const textboxes = screen.getAllByRole('textbox')
    textboxes.forEach((input) => {
      expect((input as HTMLInputElement).value).toBe('')
    })
  })

  it('calls onSubmit with code, name and description on submit', async () => {
    const onSubmit = vi.fn()
    renderDialog({ onSubmit })

    const [codeInput, nameInput] = screen.getAllByRole('textbox')
    fireEvent.change(codeInput, { target: { value: 'MAGA' } })
    fireEvent.change(nameInput, { target: { value: 'Ministerio de Agricultura' } })

    fireEvent.click(screen.getByRole('button', { name: /crear/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.code).toBe('MAGA')
      expect(payload.name).toBe('Ministerio de Agricultura')
      expect(payload.id).toBeUndefined()
      expect(payload.is_active).toBeUndefined()
    })
  })

  it('sets description to null when left empty', async () => {
    const onSubmit = vi.fn()
    renderDialog({ onSubmit })

    const [codeInput, nameInput] = screen.getAllByRole('textbox')
    fireEvent.change(codeInput, { target: { value: 'X' } })
    fireEvent.change(nameInput, { target: { value: 'X' } })

    fireEvent.click(screen.getByRole('button', { name: /crear/i }))

    await waitFor(() => {
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.description).toBeNull()
    })
  })

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    renderDialog({ onOpenChange })
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables submit when isPending is true', () => {
    renderDialog({ isPending: true })
    expect(screen.getByRole('button', { name: /crear/i })).toHaveAttribute('disabled')
  })
})

describe('InstitutionFormDialog — edit mode', () => {
  const existingInstitution = makeInstitution({
    id: 'inst-10',
    code: 'FODES',
    name: 'Fondo de Desarrollo Social',
    description: 'Descripción existente',
    is_active: true,
  })

  it('renders "Editar Institución" title', () => {
    renderDialog({ institution: existingInstitution })
    expect(screen.getByText('Editar Institución')).toBeDefined()
  })

  it('renders "Guardar" submit button', () => {
    renderDialog({ institution: existingInstitution })
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDefined()
  })

  it('shows the is_active toggle in edit mode', () => {
    renderDialog({ institution: existingInstitution })
    expect(screen.getByText('Activa')).toBeDefined()
  })

  it('pre-populates code, name, and description', () => {
    renderDialog({ institution: existingInstitution })
    expect(screen.getByDisplayValue('FODES')).toBeDefined()
    expect(screen.getByDisplayValue('Fondo de Desarrollo Social')).toBeDefined()
    expect(screen.getByDisplayValue('Descripción existente')).toBeDefined()
  })

  it('calls onSubmit with id and is_active included in edit payload', async () => {
    const onSubmit = vi.fn()
    renderDialog({ institution: existingInstitution, onSubmit })

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.id).toBe('inst-10')
      expect(payload.code).toBe('FODES')
      expect(payload.is_active).toBe(true)
    })
  })

  it('sends is_active: false after toggling the active switch off', async () => {
    const onSubmit = vi.fn()
    const inst = makeInstitution({ is_active: true })
    renderDialog({ institution: inst, onSubmit })

    const toggle = screen.getByRole('switch')
    await userEvent.click(toggle)

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      const payload = onSubmit.mock.calls[0][0]
      expect(payload.is_active).toBe(false)
    })
  })
})
