import { createRoute, redirect, Link } from '@tanstack/react-router'
import { isAuthenticated } from '@/hooks/use-auth'
import { useSavedQueries, useDeleteSavedQuery } from '@/hooks/use-query-builder'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Play, Trash2, Database } from 'lucide-react'
import type { AnyRoute } from '@tanstack/react-router'

function QueriesPage() {
  const { data: queries, isLoading } = useSavedQueries()
  const deleteQuery = useDeleteSavedQuery()

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
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
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Mis Consultas</h2>
          <Link to="/queries/new">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nueva Consulta
            </Button>
          </Link>
        </div>

        {!queries || queries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No tienes consultas guardadas</p>
              <Link to="/queries/new">
                <Button variant="outline" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Crear primera consulta
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {queries.map((q) => (
              <Card key={q.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{q.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {q.datasource_name} &middot; {q.column_count} columnas &middot; {q.filter_count} filtros
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/queries/new">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Play className="h-3.5 w-3.5" />
                        Abrir
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuery.mutate(q.id)}
                      disabled={deleteQuery.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
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
