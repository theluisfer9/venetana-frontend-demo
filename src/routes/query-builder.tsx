import { useState, useEffect } from 'react'
import { createRoute, redirect, useNavigate, useSearch } from '@tanstack/react-router'
import { isAuthenticated, usePermissions } from '@/hooks/use-auth'
import {
  useExecuteQuery,
  useSaveQuery,
  useUpdateSavedQuery,
  useSavedQueryDetail,
  useExecuteSavedQuery,
  useExportQueryExecute,
  useInstitutions,
} from '@/hooks/use-query-builder'
import { useDatasources, useDatasource } from '@/hooks/use-datasources'
import QueryColumnSelector from '@/components/QueryColumnSelector'
import QueryFilterBuilder from '@/components/QueryFilterBuilder'
import QueryGroupBySelector from '@/components/QueryGroupBySelector'
import QueryAggregationSelector from '@/components/QueryAggregationSelector'
import QueryResultsTable from '@/components/QueryResultsTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Play, Save, Loader2, Pencil, FileSpreadsheet, FileDown, FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { QueryFilter, QueryExecuteResponse, Aggregation } from '@/lib/query-builder-types'
import type { AnyRoute } from '@tanstack/react-router'

type ResultMode = 'draft' | 'saved'

function QueryBuilderPage() {
  const navigate = useNavigate()
  const { id: editId, view: viewOnly } = useSearch({ from: '/queries/new' }) as {
    id?: string
    view?: boolean
  }
  const { can } = usePermissions()
  const canEditQueries = can('reports:create')
  const { data: dataSources, isLoading: dsLoading } = useDatasources()
  const { data: institutions } = useInstitutions()
  const { data: savedDetail, isLoading: detailLoading } = useSavedQueryDetail(editId ?? null)
  const executeQuery = useExecuteQuery()
  const executeSaved = useExecuteSavedQuery()
  const saveQuery = useSaveQuery()
  const updateQuery = useUpdateSavedQuery()
  const exportQuery = useExportQueryExecute()

  // Query builder state
  const [datasourceId, setDatasourceId] = useState('')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [filters, setFilters] = useState<QueryFilter[]>([])
  const [groupBy, setGroupBy] = useState<string[]>([])
  const [aggregations, setAggregations] = useState<Aggregation[]>([])
  const [offset, setOffset] = useState(0)
  const [results, setResults] = useState<QueryExecuteResponse | undefined>()
  const [resultMode, setResultMode] = useState<ResultMode>('draft')

  // Save form state
  const [queryName, setQueryName] = useState('')
  const [queryDescription, setQueryDescription] = useState('')
  const [institutionId, setInstitutionId] = useState<string>('')
  const [isShared, setIsShared] = useState(false)
  const [agrupar, setAgrupar] = useState(true)
  const [showSave, setShowSave] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Users with edit permission can always edit, even if they arrive with view=true
  const isEditing = !!editId && (canEditQueries || !viewOnly)
  const isViewOnly = !!editId && !canEditQueries && !!viewOnly
  const limit = 20
  const { data: currentDs } = useDatasource(datasourceId || null)

  // Load saved query detail into form state
  useEffect(() => {
    if (savedDetail && !loaded) {
      setDatasourceId(savedDetail.datasource_id)
      setSelectedColumns(savedDetail.selected_columns)
      setFilters(savedDetail.filters)
      setGroupBy(savedDetail.group_by || [])
      setAggregations(savedDetail.aggregations || [])
      setAgrupar(savedDetail.agrupar ?? true)
      setQueryName(savedDetail.name)
      setQueryDescription(savedDetail.description ?? '')
      setInstitutionId(savedDetail.institution_id ?? '')
      setIsShared(savedDetail.is_shared)
      setLoaded(true)
    }
  }, [savedDetail, loaded])

  // Auto-manage aggregations: inject COUNT(*) when groupBy activates, clear when empty
  useEffect(() => {
    if (groupBy.length > 0) {
      setAggregations((prev) => {
        const hasCount = prev.some((a) => a.column === '*' && a.function === 'COUNT')
        if (!hasCount) {
          return [{ column: '*', function: 'COUNT' }, ...prev]
        }
        return prev
      })
    } else {
      setAggregations([])
    }
  }, [groupBy.length])

  // Auto-select mandatory GEO columns when datasource loads (new query only) and agrupar is on
  useEffect(() => {
    if (currentDs && !isEditing && !loaded && agrupar) {
      const MANDATORY_GEO = ['departamento', 'municipio']
      const geoColumns = currentDs.columns
        .filter((c) => c.is_selectable && MANDATORY_GEO.some((m) => c.column_name.toLowerCase().includes(m)))
        .map((c) => c.column_name)
      setSelectedColumns((prev) => {
        const merged = new Set([...geoColumns, ...prev])
        return Array.from(merged)
      })
    }
  }, [currentDs, isEditing, loaded, agrupar])

  // Auto-fill institution when datasource loads (and not editing a saved query)
  useEffect(() => {
    if (currentDs && !isEditing && !loaded) {
      setInstitutionId(currentDs.institution_id ?? '')
    }
  }, [currentDs, isEditing, loaded])

  function handleDatasourceChange(id: string) {
    if (isViewOnly) return
    setDatasourceId(id)
    setSelectedColumns([])
    setFilters([])
    setGroupBy([])
    setAggregations([])
    setResults(undefined)
    setOffset(0)
    setAgrupar(true)
    setInstitutionId('')
  }

  function handleExecute(newOffset = 0) {
    if (!datasourceId || selectedColumns.length === 0) return
    const coercedFilters = filters.map((f) => {
      const col = currentDs?.columns.find((c) => c.column_name === f.column)
      let value: unknown = f.value
      if (col?.data_type === 'BOOLEAN') {
        if (typeof f.value === 'string') {
          value = f.value === 'true'
        } else {
          value = Boolean(f.value)
        }
      } else if (col?.data_type === 'INTEGER') {
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
        group_by: groupBy.length > 0 ? groupBy : undefined,
        aggregations: aggregations.length > 0 ? aggregations : undefined,
        agrupar,
        offset: newOffset,
        limit,
      },
      {
        onSuccess: (data) => {
          setResultMode('draft')
          setResults(data)
          toast.success(`${data.total} registros encontrados`)
        },
        onError: () => toast.error('Error al ejecutar la consulta'),
      },
    )
  }

  function handleExport(formato: 'csv' | 'excel' | 'pdf') {
    if (!datasourceId || selectedColumns.length === 0) return
    const coercedFilters = filters.map((f) => {
      const col = currentDs?.columns.find((c) => c.column_name === f.column)
      let value: unknown = f.value
      if (col?.data_type === 'BOOLEAN') {
        value = typeof f.value === 'string' ? f.value === 'true' : Boolean(f.value)
      } else if (col?.data_type === 'INTEGER') {
        value = Number(f.value)
      } else if (col?.data_type === 'FLOAT') {
        value = parseFloat(String(f.value))
      }
      return { ...f, value }
    })

    exportQuery.mutate({
      datasource_id: datasourceId,
      columns: selectedColumns,
      filters: coercedFilters as QueryFilter[],
      group_by: groupBy.length > 0 ? groupBy : undefined,
      aggregations: aggregations.length > 0 ? aggregations : undefined,
      agrupar,
      formato,
    })
  }

  function handleExecuteSaved(newOffset = 0) {
    if (!editId) return
    setOffset(newOffset)
    executeSaved.mutate({ id: editId, offset: newOffset, limit }, {
      onSuccess: (data) => {
        setResultMode('saved')
        setResults(data)
        toast.success(`${data.total} registros encontrados`)
      },
      onError: () => toast.error('Error al ejecutar la consulta'),
    })
  }

  function handleUpdate() {
    if (!editId || !datasourceId || !queryName.trim()) return

    const filterPayload = filters.map((f) => ({
      ...f,
      value: f.value as string | number | boolean,
    }))

    updateQuery.mutate(
      {
        id: editId,
        name: queryName.trim(),
        description: queryDescription.trim() || null,
        selected_columns: selectedColumns,
        filters: filterPayload,
        group_by: groupBy.length > 0 ? groupBy : [],
        aggregations: groupBy.length > 0 ? aggregations.map((a) => ({ column: a.column, function: a.function })) : [],
        agrupar,
        institution_id: institutionId || null,
        is_shared: isShared,
      },
      {
        onSuccess: () => toast.success('Consulta actualizada correctamente'),
        onError: () => toast.error('Error al actualizar la consulta'),
      },
    )
  }

  function handleCreate() {
    if (!datasourceId || !queryName.trim()) return

    const filterPayload = filters.map((f) => ({
      ...f,
      value: f.value as string | number | boolean,
    }))

    saveQuery.mutate(
      {
        datasource_id: datasourceId,
        name: queryName.trim(),
        description: queryDescription.trim() || null,
        selected_columns: selectedColumns,
        filters: filterPayload,
        group_by: groupBy.length > 0 ? groupBy : [],
        aggregations: groupBy.length > 0 ? aggregations.map((a) => ({ column: a.column, function: a.function })) : [],
        agrupar,
        institution_id: institutionId || null,
        is_shared: isShared,
      },
      {
        onSuccess: () => {
          setShowSave(false)
          setQueryName('')
          setQueryDescription('')
          setInstitutionId('')
          setIsShared(false)
          toast.success('Consulta guardada correctamente')
        },
        onError: () => toast.error('Error al guardar la consulta'),
      },
    )
  }

  const isSaving = saveQuery.isPending || updateQuery.isPending

  if (dsLoading || (editId && detailLoading)) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/queries' })}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Volver
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">
              {isViewOnly ? 'Detalle Consulta' : isEditing ? 'Editar Consulta' : 'Nueva Consulta'}
            </h2>
          </div>
          <div className="flex gap-2">
            {/* Ejecutar guardada - visible en editar y ver */}
            {editId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExecuteSaved(0)}
                disabled={executeSaved.isPending}
                className="gap-1"
              >
                {executeSaved.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Ejecutar guardada
              </Button>
            )}
          </div>
        </div>

        {/* ── Metadata panel: SIEMPRE visible en modo editar ── */}
        {isEditing && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Nombre</Label>
                  <Input
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Descripción</Label>
                  <Input
                    placeholder="Opcional..."
                    value={queryDescription}
                    onChange={(e) => setQueryDescription(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500 whitespace-nowrap">Institución</Label>
                    <Select
                      value={institutionId}
                      onValueChange={(v) => setInstitutionId(v === '__none__' ? '' : v)}
                    >
                      <SelectTrigger className="h-8 text-xs w-56">
                        <SelectValue placeholder="Ninguna (personal)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Ninguna (personal)</SelectItem>
                        {institutions
                          ?.filter((inst) => inst.is_active)
                          .map((inst) => (
                            <SelectItem key={inst.id} value={inst.id}>
                              {inst.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is-shared"
                      checked={isShared}
                      onCheckedChange={setIsShared}
                      className="scale-90"
                    />
                    <Label htmlFor="is-shared" className="text-xs text-gray-500 cursor-pointer">
                      Compartida
                    </Label>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isSaving || !queryName.trim()}
                  className="gap-1"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── View-only metadata ── */}
        {isViewOnly && savedDetail && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Nombre</p>
                  <p className="font-medium">{savedDetail.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Fuente</p>
                  <p className="font-medium">{savedDetail.datasource_name}</p>
                </div>
                {savedDetail.description && (
                  <div>
                    <p className="text-xs text-gray-400">Descripción</p>
                    <p className="font-medium">{savedDetail.description}</p>
                  </div>
                )}
                {savedDetail.institution_name && (
                  <div>
                    <p className="text-xs text-gray-400">Institución</p>
                    <p className="font-medium">{savedDetail.institution_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Save panel for NEW queries (toggle) ── */}
        {!isEditing && !isViewOnly && datasourceId && selectedColumns.length > 0 && (
          <>
            {!showSave ? (
              <Button variant="outline" size="sm" onClick={() => setShowSave(true)} className="gap-1">
                <Save className="h-4 w-4" />
                Guardar consulta
              </Button>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Nombre *</Label>
                      <Input
                        placeholder="Nombre de la consulta..."
                        value={queryName}
                        onChange={(e) => setQueryName(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Descripción</Label>
                      <Input
                        placeholder="Opcional..."
                        value={queryDescription}
                        onChange={(e) => setQueryDescription(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500 whitespace-nowrap">Institución</Label>
                        <Select
                          value={institutionId}
                          onValueChange={(v) => setInstitutionId(v === '__none__' ? '' : v)}
                        >
                          <SelectTrigger className="h-8 text-xs w-56">
                            <SelectValue placeholder="Ninguna (personal)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Ninguna (personal)</SelectItem>
                            {institutions
                              ?.filter((inst) => inst.is_active)
                              .map((inst) => (
                                <SelectItem key={inst.id} value={inst.id}>
                                  {inst.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id="is-shared-new"
                          checked={isShared}
                          onCheckedChange={setIsShared}
                          className="scale-90"
                        />
                        <Label htmlFor="is-shared-new" className="text-xs text-gray-500 cursor-pointer">
                          Compartida
                        </Label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowSave(false)}>
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCreate}
                        disabled={isSaving || !queryName.trim()}
                        className="gap-1"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Guardar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ── Datasource selector ── */}
        {!isViewOnly && (
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
                    <SelectItem key={ds.id} value={ds.id}>
                      {ds.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* ── Columns, Filters, Execute ── */}
        {currentDs && (
          <>
            {/* Toggle agrupar */}
            {!isViewOnly && (
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Switch
                    id="agrupar-toggle"
                    checked={agrupar}
                    onCheckedChange={setAgrupar}
                  />
                  <Label htmlFor="agrupar-toggle" className="text-sm cursor-pointer">
                    Agrupar por departamento / municipio
                  </Label>
                  <span className="text-xs text-gray-400">
                    {agrupar
                      ? 'El export genera un archivo por departamento'
                      : 'El export genera archivos de hasta 10K filas'}
                  </span>
                </CardContent>
              </Card>
            )}

            {/* Columnas y agrupaciones: ocultas para usuario institucional sin permisos */}
            {!isViewOnly && (
              <Card>
                <CardContent className="p-4">
                  <QueryColumnSelector
                    columns={currentDs.columns}
                    selected={selectedColumns}
                    onChange={setSelectedColumns}
                    agrupar={agrupar}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <QueryFilterBuilder
                  columns={selectedColumns.length > 0
                    ? currentDs.columns.filter((c) => selectedColumns.includes(c.column_name))
                    : currentDs.columns
                  }
                  filters={filters}
                  onChange={setFilters}
                />
              </CardContent>
            </Card>

            {/* ── Group By (oculto en view-only) ── */}
            {!isViewOnly && currentDs.columns.some((c) => c.is_groupable) && (
              <Card>
                <CardContent className="p-4">
                  <QueryGroupBySelector
                    columns={currentDs.columns}
                    selected={groupBy}
                    onChange={setGroupBy}
                  />
                </CardContent>
              </Card>
            )}

            {/* ── Aggregations (oculto en view-only) ── */}
            {!isViewOnly && groupBy.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <QueryAggregationSelector
                    columns={currentDs.columns}
                    aggregations={aggregations}
                    onChange={setAggregations}
                  />
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-3">
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

              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs h-9 rounded-none border-r px-3 hover:bg-green-50 hover:text-green-700"
                  onClick={() => handleExport('excel')}
                  disabled={selectedColumns.length === 0 || exportQuery.isPending}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Excel
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs h-9 rounded-none border-r px-3 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => handleExport('csv')}
                  disabled={selectedColumns.length === 0 || exportQuery.isPending}
                >
                  <FileDown className="h-3.5 w-3.5" />
                  CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs h-9 rounded-none px-3 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleExport('pdf')}
                  disabled={selectedColumns.length === 0 || exportQuery.isPending}
                >
                  <FileText className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── Results ── */}
        <QueryResultsTable
          data={results}
          isLoading={executeQuery.isPending || executeSaved.isPending}
          offset={offset}
          limit={limit}
          onPageChange={(newOffset) => {
            if (resultMode === 'saved' && editId) {
              handleExecuteSaved(newOffset)
              return
            }
            handleExecute(newOffset)
          }}
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
    validateSearch: (search: Record<string, unknown>) => ({
      id: (search.id as string) || undefined,
      view: search.view === true || search.view === 'true' || undefined,
    }),
    beforeLoad: () => {
      if (!isAuthenticated()) {
        throw redirect({ to: '/login' })
      }
    },
  })
