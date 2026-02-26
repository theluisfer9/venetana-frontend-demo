import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import type { Role } from '@/lib/admin-types'
import type { DataSourceListItem, RoleDataSource } from '@/hooks/use-roles'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  allDataSources: DataSourceListItem[]
  assignedDataSources: RoleDataSource[]
  onSubmit: (roleId: string, datasourceIds: string[]) => void
  isPending: boolean
}

export default function RoleDataSourcesDialog({
  open,
  onOpenChange,
  role,
  allDataSources,
  assignedDataSources,
  onSubmit,
  isPending,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open && assignedDataSources) {
      setSelected(new Set(assignedDataSources.map((ds) => ds.id)))
    }
  }, [open, assignedDataSources])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleSubmit() {
    if (!role) return
    onSubmit(role.id, Array.from(selected))
  }

  const activeSources = allDataSources.filter((ds) => ds.is_active)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fuentes de datos — {role?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          {activeSources.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No hay fuentes de datos activas
            </p>
          ) : (
            activeSources.map((ds) => (
              <div key={ds.id} className="flex items-center gap-2">
                <Checkbox
                  id={`ds-${ds.id}`}
                  checked={selected.has(ds.id)}
                  onCheckedChange={() => toggle(ds.id)}
                  className="h-3.5 w-3.5"
                />
                <label htmlFor={`ds-${ds.id}`} className="text-sm cursor-pointer flex-1">
                  {ds.name}
                </label>
                <Badge variant="outline" className="text-xs font-mono">
                  {ds.code}
                </Badge>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-gray-400">
            {selected.size} de {activeSources.length} seleccionadas
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
