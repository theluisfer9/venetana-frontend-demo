import { useState } from 'react'
import { createRoute, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '@/hooks/use-auth'
import {
  useInstitutions,
  useCreateInstitution,
  useUpdateInstitution,
  useDeleteInstitution,
} from '@/hooks/use-institutions'
import InstitutionFormDialog from '@/components/InstitutionFormDialog'
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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Institution } from '@/lib/admin-types'
import type { AnyRoute } from '@tanstack/react-router'

function InstitutionsPage() {
  const { data: institutions, isLoading } = useInstitutions(true)
  const createInst = useCreateInstitution()
  const updateInst = useUpdateInstitution()
  const deleteInst = useDeleteInstitution()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Institution | null>(null)

  function handleOpenCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(inst: Institution) {
    setEditing(inst)
    setDialogOpen(true)
  }

  function handleSubmit(data: Record<string, unknown>) {
    if (data.id) {
      const { id, ...body } = data
      updateInst.mutate(
        { id: id as string, ...body },
        {
          onSuccess: () => {
            toast.success('Institución actualizada')
            setDialogOpen(false)
          },
          onError: () => toast.error('Error al actualizar institución'),
        },
      )
    } else {
      createInst.mutate(data as any, {
        onSuccess: () => {
          toast.success('Institución creada')
          setDialogOpen(false)
        },
        onError: () => toast.error('Error al crear institución'),
      })
    }
  }

  function handleDelete(inst: Institution) {
    if (!confirm(`¿Desactivar la institución "${inst.name}"?`)) return
    deleteInst.mutate(inst.id, {
      onSuccess: () => toast.success('Institución desactivada'),
      onError: () => toast.error('Error al desactivar institución'),
    })
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Instituciones</h2>
          <Button onClick={handleOpenCreate} className="gap-1">
            <Plus className="h-4 w-4" /> Nueva Institución
          </Button>
        </div>

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !institutions || institutions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                    No hay instituciones
                  </TableCell>
                </TableRow>
              ) : (
                institutions.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell className="text-sm font-mono">{inst.code}</TableCell>
                    <TableCell className="text-sm font-medium">{inst.name}</TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                      {inst.description ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={inst.is_active ? 'default' : 'destructive'} className="text-xs">
                        {inst.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(inst)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {inst.is_active && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(inst)}>
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

        <InstitutionFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          institution={editing}
          onSubmit={handleSubmit}
          isPending={createInst.isPending || updateInst.isPending}
        />
      </div>
    </div>
  )
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: '/institutions',
    component: InstitutionsPage,
    getParentRoute: () => parentRoute,
    beforeLoad: () => {
      if (!isAuthenticated()) {
        throw redirect({ to: '/login' })
      }
    },
  })
