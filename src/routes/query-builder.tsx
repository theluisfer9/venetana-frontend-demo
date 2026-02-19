import { useState } from 'react'
import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { isAuthenticated } from '@/hooks/use-auth'
import {
  useAvailableDataSources,
  useExecuteQuery,
  useSaveQuery,
} from '@/hooks/use-query-builder'
import QueryColumnSelector from '@/components/QueryColumnSelector'
import QueryFilterBuilder from '@/components/QueryFilterBuilder'
import QueryResultsTable from '@/components/QueryResultsTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Play, Save, Loader2 } from 'lucide-react'
import type { QueryFilter, QueryExecuteResponse } from '@/lib/query-builder-types'
import type { AnyRoute } from '@tanstack/react-router'

function QueryBuilderPage() {
  const navigate = useNavigate()
  const { data: dataSources, isLoading: dsLoading } = useAvailableDataSources()
  const executeQuery = useExecuteQuery()
  const saveQuery = useSaveQuery()

  const [datasourceId, setDatasourceId] = useState('')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [filters, setFilters] = useState<QueryFilter[]>([])
  const [offset, setOffset] = useState(0)
  const [results, setResults] = useState<QueryExecuteResponse | undefined>()
  const [queryName, setQueryName] = useState('')
  const [showSave, setShowSave] = useState(false)

  const limit = 20
  const currentDs = dataSources?.find((ds) => ds.id === datasourceId)

  function handleDatasourceChange(id: string) {
    setDatasourceId(id)
    setSelectedColumns([])
    setFilters([])
    setResults(undefined)
    setOffset(0)
  }

  function handleExecute(newOffset = 0) {
    if (!datasourceId || selectedColumns.length === 0) return
    const coercedFilters = filters.map((f) => {
      const col = currentDs?.columns.find((c) => c.column_name === f.column)
      let value: unknown = f.value
      if (col?.data_type === 'INTEGER' || col?.data_type === 'BOOLEAN') {
        value = Number(f.value)
      } else if (col?.data_type === 'FLOAT') {
        value = parseFloat(String(f.value))
      }
      return { ...f, value }
    })

    setOffset(newOffset)
    executeQuery.mutate(
      {
        datasource_id: datasourceId,
        columns: selectedColumns,
        filters: coercedFilters as QueryFilter[],
        offset: newOffset,
        limit,
      },
      { onSuccess: (data) => setResults(data) },
    )
  }

  function handleSave() {
    if (!datasourceId || !queryName.trim()) return
    saveQuery.mutate(
      {
        datasource_id: datasourceId,
        name: queryName.trim(),
        selected_columns: selectedColumns,
        filters: filters.map((f) => ({ ...f, value: f.value as string | number | boolean })),
      },
      {
        onSuccess: () => {
          setShowSave(false)
          setQueryName('')
        },
      },
    )
  }

  if (dsLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/queries' })}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Volver
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">Nueva Consulta</h2>
          </div>
          <div className="flex gap-2">
            {datasourceId && selectedColumns.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowSave(!showSave)}>
                <Save className="mr-1 h-4 w-4" /> Guardar
              </Button>
            )}
          </div>
        </div>

        {showSave && (
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <Input
                placeholder="Nombre de la consulta..."
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                className="h-8 text-sm flex-1 max-w-sm"
              />
              <Button size="sm" onClick={handleSave} disabled={saveQuery.isPending || !queryName.trim()}>
                {saveQuery.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSave(false)}>Cancelar</Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Fuente de datos</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={datasourceId} onValueChange={handleDatasourceChange}>
              <SelectTrigger className="h-9 max-w-md">
                <SelectValue placeholder="Seleccionar fuente de datos..." />
              </SelectTrigger>
              <SelectContent>
                {dataSources?.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {currentDs && (
          <>
            <Card>
              <CardContent className="p-4">
                <QueryColumnSelector
                  columns={currentDs.columns}
                  selected={selectedColumns}
                  onChange={setSelectedColumns}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <QueryFilterBuilder
                  columns={currentDs.columns}
                  filters={filters}
                  onChange={setFilters}
                />
              </CardContent>
            </Card>

            <Button
              onClick={() => handleExecute(0)}
              disabled={selectedColumns.length === 0 || executeQuery.isPending}
              className="gap-1.5"
            >
              {executeQuery.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Ejecutar
            </Button>
          </>
        )}

        <QueryResultsTable
          data={results}
          isLoading={executeQuery.isPending}
          offset={offset}
          limit={limit}
          onPageChange={(newOffset) => handleExecute(newOffset)}
        />
      </div>
    </div>
  )
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: '/queries/new',
    component: QueryBuilderPage,
    getParentRoute: () => parentRoute,
    beforeLoad: () => {
      if (!isAuthenticated()) {
        throw redirect({ to: '/login' })
      }
    },
  })
