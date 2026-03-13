import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useChTables, useChColumns, useDatasource } from '@/hooks/use-datasources'
import { useInstitutions } from '@/hooks/use-institutions'
import type {
  DataSourceListItem,
  DataSourceCreateBody,
  DataSourceUpdateBody,
} from '@/lib/datasource-types'

const BOOLEAN_TYPES = ['UInt8', 'Int8', 'Boolean']

function isBooleanColumn(type: string): boolean {
  return BOOLEAN_TYPES.some((t) => type === t || type.startsWith(`Nullable(${t})`))
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  datasource: DataSourceListItem | null
  onSubmit: (data: DataSourceCreateBody | (DataSourceUpdateBody & { id: string })) => void
  isPending: boolean
}

export default function DataSourceFormDialog({
  open,
  onOpenChange,
  datasource,
  onSubmit,
  isPending,
}: Props) {
  const isEdit = !!datasource

  // Form state
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [baseFilterColumns, setBaseFilterColumns] = useState<string[]>([])
  const [baseFilterLogic, setBaseFilterLogic] = useState<'AND' | 'OR'>('OR')
  const [institutionId, setInstitutionId] = useState<string>('none')

  // Fetch full datasource when editing
  const { data: fullDatasource, isLoading: isLoadingFull } = useDatasource(
    isEdit && open ? datasource.id : null,
  )

  // Fetch CH tables and columns
  const { data: chTables, isLoading: isLoadingTables } = useChTables()
  const { data: chColumns, isLoading: isLoadingColumns } = useChColumns(
    selectedTable || null,
  )

  // Fetch institutions
  const { data: institutions } = useInstitutions()

  // Filter boolean columns from selected CH table
  const booleanColumns = (chColumns ?? []).filter((col) => isBooleanColumn(col.type))

  // Populate form when opening
  useEffect(() => {
    if (!open) return

    if (isEdit && fullDatasource) {
      setCode(fullDatasource.code)
      setName(fullDatasource.name)
      setDescription(fullDatasource.description ?? '')
      setSelectedTable(fullDatasource.ch_table)
      setBaseFilterColumns(fullDatasource.base_filter_columns ?? [])
      setBaseFilterLogic(
        fullDatasource.base_filter_logic === 'OR' ? 'OR' : 'AND',
      )
      setInstitutionId(fullDatasource.institution_id ?? 'none')
    } else if (!isEdit) {
      setCode('')
      setName('')
      setDescription('')
      setSelectedTable('')
      setBaseFilterColumns([])
      setBaseFilterLogic('OR')
      setInstitutionId('none')
    }
  }, [open, isEdit, fullDatasource])

  // Reset base filter columns when table changes
  function handleTableChange(table: string) {
    setSelectedTable(table)
    setBaseFilterColumns([])
  }

  function toggleFilterColumn(colName: string, checked: boolean) {
    setBaseFilterColumns((prev) =>
      checked ? [...prev, colName] : prev.filter((c) => c !== colName),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const instId = institutionId === 'none' ? null : institutionId

    if (isEdit) {
      const body: DataSourceUpdateBody & { id: string } = {
        id: datasource.id,
        name,
        description: description || null,
        ch_table: selectedTable,
        base_filter_columns: baseFilterColumns,
        base_filter_logic: baseFilterLogic,
        institution_id: instId,
      }
      onSubmit(body)
    } else {
      const body: DataSourceCreateBody = {
        code,
        name,
        description: description || null,
        ch_table: selectedTable,
        base_filter_columns: baseFilterColumns,
        base_filter_logic: baseFilterLogic,
        institution_id: instId,
      }
      onSubmit(body)
    }
  }

  const isLoadingEditData = isEdit && isLoadingFull

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="border-b bg-gray-50/80 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {isEdit ? 'Editar Fuente de Datos' : 'Nueva Fuente de Datos'}
            </DialogTitle>
            {isEdit && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">{code}</p>
            )}
          </DialogHeader>
        </div>

        {isLoadingEditData ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            <p className="text-sm text-gray-400">Cargando datos…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <ScrollArea className="max-h-[60vh]">
              <div className="px-6 py-5 space-y-6">

                {/* Section 1 — Datos Básicos */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-gray-900" />
                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Datos Básicos
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">Código *</Label>
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        disabled={isEdit}
                        required={!isEdit}
                        placeholder="ej. RSH_HOGARES"
                        className={`h-9 ${isEdit ? 'bg-gray-50 text-gray-400 border-dashed' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">Nombre *</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="ej. Hogares RSH"
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Descripción</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      placeholder="Descripción opcional de esta fuente de datos"
                      className="resize-none"
                    />
                  </div>
                </section>

                <div className="border-t border-dashed" />

                {/* Section 2 — Tabla ClickHouse + Columnas */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-gray-900" />
                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Tabla ClickHouse
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">Tabla *</Label>
                      {isLoadingTables ? (
                        <div className="flex items-center gap-2 text-xs text-gray-400 h-9">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Cargando tablas…
                        </div>
                      ) : (
                        <Select
                          value={selectedTable}
                          onValueChange={handleTableChange}
                          required
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Seleccionar tabla…" />
                          </SelectTrigger>
                          <SelectContent>
                            {(chTables ?? []).map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {selectedTable && (
                      <div className="flex items-center h-9 text-xs text-gray-400">
                        {isLoadingColumns ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Cargando columnas…
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            {(chColumns ?? []).length} columnas
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* Section 3 — Filtro Base */}
                {selectedTable && (
                  <>
                    <div className="border-t border-dashed" />
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-gray-900" />
                        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Filtro Base
                        </h3>
                      </div>

                      {isLoadingColumns ? (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Cargando columnas booleanas…
                        </div>
                      ) : booleanColumns.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">
                          No hay columnas booleanas en esta tabla.
                        </p>
                      ) : (
                        <>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Columnas booleanas que actuarán como filtro base
                            (deben ser <code className="font-mono bg-gray-100 px-1 rounded">true</code>).
                          </p>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                            {booleanColumns.map((col) => (
                              <div
                                key={col.name}
                                className="flex items-center gap-2.5 rounded-md border border-transparent px-2 py-1.5 hover:bg-gray-50 hover:border-gray-200 transition-colors"
                              >
                                <Checkbox
                                  id={`col-${col.name}`}
                                  checked={baseFilterColumns.includes(col.name)}
                                  onCheckedChange={(checked) =>
                                    toggleFilterColumn(col.name, !!checked)
                                  }
                                />
                                <label
                                  htmlFor={`col-${col.name}`}
                                  className="text-sm font-mono cursor-pointer select-none flex-1"
                                >
                                  {col.name}
                                  <span className="ml-1.5 text-[11px] text-gray-400 font-sans">
                                    {col.type}
                                  </span>
                                </label>
                              </div>
                            ))}
                          </div>

                          {baseFilterColumns.length > 1 && (
                            <div className="flex items-center gap-3 pt-1">
                              <Label className="text-xs text-gray-500">Lógica entre filtros:</Label>
                              <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-100">
                                <button
                                  type="button"
                                  onClick={() => setBaseFilterLogic('AND')}
                                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                    baseFilterLogic === 'AND'
                                      ? 'bg-white text-gray-900 shadow-sm'
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  AND
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBaseFilterLogic('OR')}
                                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                    baseFilterLogic === 'OR'
                                      ? 'bg-white text-gray-900 shadow-sm'
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  OR
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </section>
                  </>
                )}

                <div className="border-t border-dashed" />

                {/* Section 4 — Institución */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-gray-900" />
                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Institución
                    </h3>
                  </div>

                  <div className="max-w-xs">
                    <Label className="text-xs text-gray-500 mb-1.5 block">Institución asociada</Label>
                    <Select value={institutionId} onValueChange={setInstitutionId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Sin institución" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin institución</SelectItem>
                        {(institutions ?? []).map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </section>

              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t bg-gray-50/80 px-6 py-3 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isPending || !selectedTable}>
                {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {isEdit ? 'Guardar cambios' : 'Crear fuente'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
