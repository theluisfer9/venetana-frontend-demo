import { useState } from 'react'
import { createRoute, redirect } from '@tanstack/react-router'
import { isAuthenticated, useCurrentUser } from '@/hooks/use-auth'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useActivateUser } from '@/hooks/use-users'
import { useRoles } from '@/hooks/use-roles'
import { useInstitutions } from '@/hooks/use-institutions'
import UserFormDialog from '@/components/UserFormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, UserX, UserCheck, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { User, UserFilters } from '@/lib/admin-types'
import type { AnyRoute } from '@tanstack/react-router'

function UsersPage() {
  const { data: currentUser } = useCurrentUser()
  const [page, setPage] = useState(1)
  const size = 15
  const [filters, setFilters] = useState<UserFilters>({})
  const [searchInput, setSearchInput] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { data: usersData, isLoading } = useUsers(page, size, filters)
  const { data: roles } = useRoles()
  const { data: institutions } = useInstitutions(true)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const activateUser = useActivateUser()

  function handleSearch() {
    setFilters((prev) => ({ ...prev, search: searchInput || undefined }))
    setPage(1)
  }

  function handleOpenCreate() {
    setEditingUser(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(user: User) {
    setEditingUser(user)
    setDialogOpen(true)
  }

  function handleSubmit(data: Record<string, unknown>) {
    if (data.id) {
      const { id, ...body } = data
      updateUser.mutate(
        { id: id as string, ...body },
        {
          onSuccess: () => {
            toast.success('Usuario actualizado')
            setDialogOpen(false)
          },
          onError: () => toast.error('Error al actualizar usuario'),
        },
      )
    } else {
      createUser.mutate(data as any, {
        onSuccess: () => {
          toast.success('Usuario creado')
          setDialogOpen(false)
        },
        onError: () => toast.error('Error al crear usuario'),
      })
    }
  }

  function handleToggleActive(user: User) {
    if (user.is_active) {
      deleteUser.mutate(user.id, {
        onSuccess: () => toast.success('Usuario desactivado'),
        onError: () => toast.error('Error al desactivar usuario'),
      })
    } else {
      activateUser.mutate(user.id, {
        onSuccess: () => toast.success('Usuario activado'),
        onError: () => toast.error('Error al activar usuario'),
      })
    }
  }

  const users = usersData?.items ?? []
  const totalPages = usersData?.pages ?? 1

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
          <Button onClick={handleOpenCreate} className="gap-1">
            <Plus className="h-4 w-4" /> Nuevo Usuario
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nombre, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-64 h-9"
            />
            <Button variant="outline" size="sm" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={filters.role_id ?? '__all__'}
            onValueChange={(v) => {
              setFilters((prev) => ({ ...prev, role_id: v === '__all__' ? undefined : v }))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos los roles</SelectItem>
              {roles?.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.is_active === undefined ? '__all__' : String(filters.is_active)}
            onValueChange={(v) => {
              setFilters((prev) => ({
                ...prev,
                is_active: v === '__all__' ? undefined : v === 'true',
              }))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              <SelectItem value="true">Activos</SelectItem>
              <SelectItem value="false">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Institución</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {user.role.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {user.institution?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'destructive'} className="text-xs">
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(user)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.is_active ? (
                              <UserX className="h-3.5 w-3.5 text-red-500" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5 text-green-500" />
                            )}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages} ({usersData?.total ?? 0} usuarios)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Dialog */}
        <UserFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          user={editingUser}
          roles={roles ?? []}
          institutions={institutions ?? []}
          onSubmit={handleSubmit}
          isPending={createUser.isPending || updateUser.isPending}
        />
      </div>
    </div>
  )
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: '/users',
    component: UsersPage,
    getParentRoute: () => parentRoute,
    beforeLoad: () => {
      if (!isAuthenticated()) {
        throw redirect({ to: '/login' })
      }
    },
  })
