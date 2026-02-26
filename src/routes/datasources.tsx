import { useState } from 'react'
import { createRoute, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '@/hooks/use-auth'
import {
  useDatasources,
  useCreateDatasource,
  useUpdateDatasource,
  useDeleteDatasource,
} from '@/hooks/use-datasources'
import DataSourceFormDialog from '@/components/DataSourceFormDialog'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import type {
  DataSourceListItem,
  DataSourceCreateBody,
  DataSourceUpdateBody,
} from '@/lib/datasource-types'
import type { AnyRoute } from '@tanstack/react-router'

function DataSourcesPage() {
  const { data: datasources, isLoading } = useDatasources()
  const createDs = useCreateDatasource()
  const updateDs = useUpdateDatasource()
  const deleteDs = useDeleteDatasource()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DataSourceListItem | null>(null)
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false)
  const [deactivatingDs, setDeactivatingDs] = useState<DataSourceListItem | null>(null)

  function handleOpenCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(ds: DataSourceListItem) {
    setEditing(ds)
    setDialogOpen(true)
  }

  function handleSubmit(
    data: DataSourceCreateBody | (DataSourceUpdateBody & { id: string }),
  ) {
    if ('id' in data) {
      const { id, ...body } = data
      updateDs.mutate(
        { id, ...body },
        {
          onSuccess: () => {
            toast.success('Fuente de datos actualizada')
            setDialogOpen(false)
          },
          onError: () => toast.error('Error al actualizar la fuente de datos'),
        },
      )
    } else {
      createDs.mutate(data, {
        onSuccess: () => {
          toast.success('Fuente de datos creada')
          setDialogOpen(false)
        },
        onError: () => toast.error('Error al crear la fuente de datos'),
      })
    }
  }

  function handleToggleActive(ds: DataSourceListItem) {
    if (ds.is_active) {
      setDeactivatingDs(ds)
      setDeactivateConfirmOpen(true)
    } else {
      updateDs.mutate(
        { id: ds.id, is_active: true },
        {
          onSuccess: () => toast.success('Fuente de datos activada'),
          onError: () => toast.error('Error al activar la fuente de datos'),
        },
      )
    }
  }

  function confirmDeactivate() {
    if (!deactivatingDs) return
    deleteDs.mutate(deactivatingDs.id, {
      onSuccess: () => toast.success('Fuente de datos desactivada'),
      onError: () => toast.error('Error al desactivar la fuente de datos'),
    })
    setDeactivateConfirmOpen(false)
    setDeactivatingDs(null)
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Fuentes de Datos</h2>
          <Button onClick={handleOpenCreate} className="gap-1">
            <Plus className="h-4 w-4" /> Nueva Fuente
          </Button>
        </div>

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tabla CH</TableHead>
                <TableHead>Filtro Base</TableHead>
                <TableHead className="text-center">Columnas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !datasources || datasources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    No hay fuentes de datos
                  </TableCell>
                </TableRow>
              ) : (
                datasources.map((ds) => (
                  <TableRow key={ds.id}>
                    <TableCell className="text-sm font-mono">{ds.code}</TableCell>
                    <TableCell className="text-sm font-medium">{ds.name}</TableCell>
                    <TableCell className="text-sm font-mono text-gray-600">
                      {ds.ch_table}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px]">
                      {ds.base_filter_columns && ds.base_filter_columns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {ds.base_filter_columns.map((col) => (
                            <Badge
                              key={col}
                              variant="secondary"
                              className="text-xs font-mono"
                            >
                              {col}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      {ds.column_count}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={ds.is_active ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {ds.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(ds)}
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(ds)}
                          title={ds.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {ds.is_active ? (
                            <PowerOff className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <Power className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DataSourceFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          datasource={editing}
          onSubmit={handleSubmit}
          isPending={createDs.isPending || updateDs.isPending}
        />

        <AlertDialog
          open={deactivateConfirmOpen}
          onOpenChange={setDeactivateConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Desactivar fuente de datos</AlertDialogTitle>
              <AlertDialogDescription>
                Se desactivará la fuente &ldquo;{deactivatingDs?.name}&rdquo;. Podrá
                reactivarla luego desde esta misma pantalla.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeactivate}>
                Desactivar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: '/datasources',
    component: DataSourcesPage,
    getParentRoute: () => parentRoute,
    beforeLoad: () => {
      if (!isAuthenticated()) {
        throw redirect({ to: '/login' })
      }
    },
  })
