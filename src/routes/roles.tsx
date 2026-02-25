import { useState } from 'react'
import { createRoute, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '@/hooks/use-auth'
import {
  useRoles,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useUpdateRolePermissions,
} from '@/hooks/use-roles'
import RoleFormDialog from '@/components/RoleFormDialog'
import RolePermissionsDialog from '@/components/RolePermissionsDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Role } from '@/lib/admin-types'
import type { AnyRoute } from '@tanstack/react-router'

function RolesPage() {
  const { data: roles, isLoading } = useRoles()
  const { data: permissions } = usePermissions()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const updatePerms = useUpdateRolePermissions()

  const [formOpen, setFormOpen] = useState(false)
  const [permsOpen, setPermsOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [permsRole, setPermsRole] = useState<Role | null>(null)

  function handleOpenCreate() {
    setEditingRole(null)
    setFormOpen(true)
  }

  function handleOpenEdit(role: Role) {
    setEditingRole(role)
    setFormOpen(true)
  }

  function handleOpenPerms(role: Role) {
    setPermsRole(role)
    setPermsOpen(true)
  }

  function handleFormSubmit(data: Record<string, unknown>) {
    if (data.id) {
      const { id, ...body } = data
      updateRole.mutate(
        { id: id as string, ...body },
        {
          onSuccess: () => {
            toast.success('Rol actualizado')
            setFormOpen(false)
          },
          onError: () => toast.error('Error al actualizar rol'),
        },
      )
    } else {
      createRole.mutate(data as any, {
        onSuccess: () => {
          toast.success('Rol creado')
          setFormOpen(false)
        },
        onError: () => toast.error('Error al crear rol'),
      })
    }
  }

  function handlePermsSubmit(roleId: string, permissionIds: string[]) {
    updatePerms.mutate(
      { id: roleId, permission_ids: permissionIds },
      {
        onSuccess: () => {
          toast.success('Permisos actualizados')
          setPermsOpen(false)
        },
        onError: () => toast.error('Error al actualizar permisos'),
      },
    )
  }

  function handleDelete(role: Role) {
    if (!confirm(`¿Eliminar el rol "${role.name}"?`)) return
    deleteRole.mutate(role.id, {
      onSuccess: () => toast.success('Rol eliminado'),
      onError: () => toast.error('Error al eliminar rol'),
    })
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Roles</h2>
          <Button onClick={handleOpenCreate} className="gap-1">
            <Plus className="h-4 w-4" /> Nuevo Rol
          </Button>
        </div>

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !roles || roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    No hay roles
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="text-sm font-mono">{role.code}</TableCell>
                    <TableCell className="text-sm font-medium">{role.name}</TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                      {role.description ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {role.permissions.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {role.is_system && (
                        <Badge variant="outline" className="text-xs">
                          Sistema
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(role)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenPerms(role)}>
                          <Shield className="h-3.5 w-3.5" />
                        </Button>
                        {!role.is_system && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(role)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <RoleFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          role={editingRole}
          onSubmit={handleFormSubmit}
          isPending={createRole.isPending || updateRole.isPending}
        />

        <RolePermissionsDialog
          open={permsOpen}
          onOpenChange={setPermsOpen}
          role={permsRole}
          permissions={permissions ?? []}
          onSubmit={handlePermsSubmit}
          isPending={updatePerms.isPending}
        />
      </div>
    </div>
  )
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: '/roles',
    component: RolesPage,
    getParentRoute: () => parentRoute,
    beforeLoad: () => {
      if (!isAuthenticated()) {
        throw redirect({ to: '/login' })
      }
    },
  })
