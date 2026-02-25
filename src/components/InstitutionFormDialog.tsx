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
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import type { Institution } from '@/lib/admin-types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  institution: Institution | null
  onSubmit: (data: Record<string, unknown>) => void
  isPending: boolean
}

export default function InstitutionFormDialog({
  open,
  onOpenChange,
  institution,
  onSubmit,
  isPending,
}: Props) {
  const isEdit = !!institution

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (open && institution) {
      setCode(institution.code)
      setName(institution.name)
      setDescription(institution.description ?? '')
      setIsActive(institution.is_active)
    } else if (open) {
      setCode('')
      setName('')
      setDescription('')
      setIsActive(true)
    }
  }, [open, institution])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: Record<string, unknown> = {
      code,
      name,
      description: description || null,
    }
    if (isEdit) {
      data.id = institution!.id
      data.is_active = isActive
    }
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Institución' : 'Nueva Institución'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs">Código *</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs">Nombre *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs">Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          {isEdit && (
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label className="text-xs">Activa</Label>
            </div>
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
