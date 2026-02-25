import { useState } from 'react'
import { createRoute, redirect, Link } from '@tanstack/react-router'
import { isAuthenticated, useCurrentUser, isAdminRole } from '@/hooks/use-auth'
import { useSavedQueries, useDeleteSavedQuery, useExecuteSavedQuery } from '@/hooks/use-query-builder'
import QueryResultsTable from '@/components/QueryResultsTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Play,
  Trash2,
  Database,
  Pencil,
  Loader2,
  X,
  Share2,
  Building2,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import type { QueryExecuteResponse } from '@/lib/query-builder-types'
import type { AnyRoute } from '@tanstack/react-router'

function QueriesPage() {
  const { data: user } = useCurrentUser()
  const { data: queries, isLoading } = useSavedQueries()
  const deleteQuery = useDeleteSavedQuery()
  const executeSaved = useExecuteSavedQuery()
  const [results, setResults] = useState<{ id: string; data: QueryExecuteResponse } | null>(null)
  const [executingId, setExecutingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const isAdmin = isAdminRole(user?.role_code)

  function handleExecute(id: string) {
    setExecutingId(id)
    executeSaved.mutate(id, {
      onSuccess: (data) => {
        setResults({ id, data })
        setExecutingId(null)
        toast.success(`${data.total} registros encontrados`)
      },
      onError: () => {
        setExecutingId(null)
        toast.error('Error al ejecutar la consulta')
      },
    })
  }

  function handleDelete(id: string) {
    deleteQuery.mutate(id, {
      onSuccess: () => {
        setConfirmDeleteId(null)
        if (results?.id === id) setResults(null)
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
            <Skeleton key={i} className="h-20 rounded-lg" />
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
              {isAdmin ? 'Mis Consultas' : 'Consultas'}
            </h2>
            {!isAdmin && user?.institution_name && (
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {user.institution_name}
              </p>
            )}
          </div>
          {isAdmin && (
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
            <CardContent className="p-8 text-center">
              <Database className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">
                {isAdmin
                  ? 'No tienes consultas guardadas'
                  : 'No hay consultas disponibles para tu institución'}
              </p>
              {isAdmin && (
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
              <Card key={q.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{q.name}</p>
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
                      <p className="text-xs text-gray-500 mt-0.5">
                        {q.datasource_name} &middot; {q.column_count} columnas &middot;{' '}
                        {q.filter_count} filtros
                        {q.created_at && (
                          <>
                            {' '}
                            &middot; {new Date(q.created_at).toLocaleDateString('es-GT')}
                          </>
                        )}
                      </p>
                      {q.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {q.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {/* Ejecutar: visible para todos */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleExecute(q.id)}
                        disabled={executingId === q.id}
                      >
                        {executingId === q.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                        Ejecutar
                      </Button>

                      {/* Ver detalle: solo no-admin */}
                      {!isAdmin && (
                        <Link to="/queries/new" search={{ id: q.id, view: true }}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            Ver
                          </Button>
                        </Link>
                      )}

                      {/* Editar: solo admin */}
                      {isAdmin && (
                        <Link to="/queries/new" search={{ id: q.id }}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                        </Link>
                      )}

                      {/* Eliminar: solo admin */}
                      {isAdmin && (
                        <>
                          {confirmDeleteId === q.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
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
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteId(q.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Resultados inline */}
                  {results?.id === q.id && (
                    <div className="mt-4 border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-500">
                          Resultados ({results.data.total} registros)
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setResults(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <QueryResultsTable
                        data={results.data}
                        isLoading={false}
                        offset={0}
                        limit={results.data.limit}
                        onPageChange={() => {}}
                      />
                    </div>
                  )}
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
