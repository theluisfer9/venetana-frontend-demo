import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import type { Role } from '@/lib/admin-types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onSubmit: (data: Record<string, unknown>) => void
  isPending: boolean
}

export default function RoleFormDialog({ open, onOpenChange, role, onSubmit, isPending }: Props) {
  const isEdit = !!role

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (open && role) {
      setCode(role.code)
      setName(role.name)
      setDescription(role.description ?? '')
    } else if (open) {
      setCode('')
      setName('')
      setDescription('')
    }
  }, [open, role])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: Record<string, unknown> = { description: description || null }
    if (isEdit) {
      data.id = role!.id
      if (!role!.is_system) {
        data.code = code
        data.name = name
      }
    } else {
      data.code = code
      data.name = name
    }
    onSubmit(data)
  }

  const isSystem = role?.is_system ?? false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs">Código *</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={isSystem}
            />
          </div>
          <div>
            <Label className="text-xs">Nombre *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSystem}
            />
          </div>
          <div>
            <Label className="text-xs">Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          {isSystem && (
            <p className="text-xs text-amber-600">
              Este es un rol de sistema. Solo se puede editar la descripción.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
