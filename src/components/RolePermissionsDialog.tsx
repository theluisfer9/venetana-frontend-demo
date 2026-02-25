import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import type { Role, Permission } from '@/lib/admin-types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  permissions: Permission[]
  onSubmit: (roleId: string, permissionIds: string[]) => void
  isPending: boolean
}

const MODULE_LABELS: Record<string, string> = {
  users: 'Usuarios',
  roles: 'Roles',
  beneficiaries: 'Beneficiarios',
  databases: 'Bases de Datos',
  reports: 'Reportes',
  datasources: 'Fuentes de Datos',
  system: 'Sistema',
}

export default function RolePermissionsDialog({
  open,
  onOpenChange,
  role,
  permissions,
  onSubmit,
  isPending,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open && role) {
      setSelected(new Set(role.permissions.map((p) => p.id)))
    }
  }, [open, role])

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

  // Group permissions by module
  const grouped = new Map<string, Permission[]>()
  for (const p of permissions) {
    const group = grouped.get(p.module) || []
    group.push(p)
    grouped.set(p.module, group)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Permisos — {role?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([module, perms]) => (
            <div key={module}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {MODULE_LABELS[module] || module}
              </p>
              <div className="space-y-1.5">
                {perms.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`perm-${p.id}`}
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggle(p.id)}
                      className="h-3.5 w-3.5"
                    />
                    <label htmlFor={`perm-${p.id}`} className="text-sm cursor-pointer">
                      {p.name}
                    </label>
                    {p.description && (
                      <span className="text-xs text-gray-400">— {p.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Guardar permisos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
