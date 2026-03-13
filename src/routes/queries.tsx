import { useState } from 'react'
import { createRoute, redirect, Link } from '@tanstack/react-router'
import { isAuthenticated, usePermissions } from '@/hooks/use-auth'
import { useSavedQueries, useDeleteSavedQuery } from '@/hooks/use-query-builder'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Trash2,
  Database,
  Pencil,
  Loader2,
  X,
  Share2,
  Building2,
  Eye,
  Calendar,
  Columns3,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import type { AnyRoute } from '@tanstack/react-router'

function QueriesPage() {
  const { user, can } = usePermissions()
  const { data: queries, isLoading } = useSavedQueries()
  const deleteQuery = useDeleteSavedQuery()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const canCreate = can('reports:create')
  const canEdit = can('reports:create')

  function handleDelete(id: string) {
    deleteQuery.mutate(id, {
      onSuccess: () => {
        setConfirmDeleteId(null)
        toast.success('Consulta eliminada')
      },
      onError: () => toast.error('Error al eliminar la consulta'),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {canCreate ? 'Mis Consultas' : 'Consultas'}
            </h2>
            {!canCreate && user?.institution_name && (
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {user.institution_name}
              </p>
            )}
            {queries && queries.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {queries.length} consulta{queries.length !== 1 ? 's' : ''} guardada{queries.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {canCreate && (
            <Link to="/queries/new">
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                Nueva Consulta
              </Button>
            </Link>
          )}
        </div>

        {/* ── Empty state ── */}
        {!queries || queries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Database className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">
                {canCreate
                  ? 'No tienes consultas guardadas'
                  : 'No hay consultas disponibles'}
              </p>
              <p className="text-sm text-gray-400 mb-5">
                {canCreate
                  ? 'Crea tu primera consulta para comenzar a exportar datos'
                  : 'No hay consultas disponibles para tu institución'}
              </p>
              {canCreate && (
                <Link to="/queries/new">
                  <Button variant="outline" className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Crear primera consulta
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {queries.map((q) => (
              <Card
                key={q.id}
                className="group hover:shadow-md transition-all duration-200 border-gray-200"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* ── Info ── */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-base">{q.name}</p>
                        {q.is_shared && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] gap-1 px-1.5 py-0"
                          >
                            <Share2 className="h-3 w-3" />
                            Compartida
                          </Badge>
                        )}
                        {q.institution_name && (
                          <Badge
                            variant="outline"
                            className="text-[10px] gap-1 px-1.5 py-0"
                          >
                            <Building2 className="h-3 w-3" />
                            {q.institution_name}
                          </Badge>
                        )}
                      </div>

                      {q.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {q.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {q.datasource_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Columns3 className="h-3 w-3" />
                          {q.column_count} columnas
                        </span>
                        <span className="flex items-center gap-1">
                          <Filter className="h-3 w-3" />
                          {q.filter_count} filtros
                        </span>
                        {q.created_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(q.created_at).toLocaleDateString('es-GT')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Ver detalle: solo si no puede editar */}
                      {!canEdit && (
                        <Link to="/queries/new" search={{ id: q.id, view: true }}>
                          <Button variant="outline" size="sm" className="gap-1 h-8">
                            <Eye className="h-3.5 w-3.5" />
                            Ver
                          </Button>
                        </Link>
                      )}

                      {/* Editar: solo con permiso */}
                      {canEdit && (
                        <Link to="/queries/new" search={{ id: q.id }}>
                          <Button variant="outline" size="sm" className="gap-1 h-8">
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                        </Link>
                      )}

                      {/* Eliminar: solo con permiso */}
                      {canEdit && (
                        <>
                          {confirmDeleteId === q.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8"
                                onClick={() => handleDelete(q.id)}
                                disabled={deleteQuery.isPending}
                              >
                                {deleteQuery.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  'Confirmar'
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setConfirmDeleteId(q.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: '/queries',
    component: QueriesPage,
    getParentRoute: () => parentRoute,
    beforeLoad: () => {
      if (!isAuthenticated()) {
        throw redirect({ to: '/login' })
      }
    },
  })
