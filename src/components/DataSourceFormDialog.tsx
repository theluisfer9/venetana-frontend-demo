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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Fuente de Datos' : 'Nueva Fuente de Datos'}
          </DialogTitle>
        </DialogHeader>

        {isLoadingEditData ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <ScrollArea className="max-h-[65vh] pr-3">
              <div className="space-y-5 pb-2">

                {/* Section 1 — Datos Básicos */}
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Datos Básicos
                  </p>

                  <div>
                    <Label className="text-xs mb-1 block">Código *</Label>
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isEdit}
                      required={!isEdit}
                      placeholder="ej. RSH_HOGARES"
                      className={isEdit ? 'bg-gray-100 text-gray-500' : ''}
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-1 block">Nombre *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="ej. Hogares RSH"
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-1 block">Descripción</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      placeholder="Descripción opcional de esta fuente de datos"
                    />
                  </div>
                </div>

                {/* Section 2 — Tabla ClickHouse */}
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tabla ClickHouse
                  </p>

                  <div>
                    <Label className="text-xs mb-1 block">Tabla *</Label>
                    {isLoadingTables ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Cargando tablas…
                      </div>
                    ) : (
                      <Select
                        value={selectedTable}
                        onValueChange={handleTableChange}
                        required
                      >
                        <SelectTrigger>
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
                    <div>
                      <p className="text-xs text-gray-500">
                        {isLoadingColumns ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Cargando columnas…
                          </span>
                        ) : (
                          <span>{(chColumns ?? []).length} columnas encontradas</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Section 3 — Filtro Base */}
                {selectedTable && (
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Filtro Base
                    </p>

                    {isLoadingColumns ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Cargando columnas booleanas…
                      </div>
                    ) : booleanColumns.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        No hay columnas booleanas en esta tabla.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500">
                          Selecciona las columnas booleanas que actuarán como filtro base
                          (deben ser <code className="font-mono">true</code>).
                        </p>

                        <div className="space-y-2">
                          {booleanColumns.map((col) => (
                            <div key={col.name} className="flex items-center gap-2">
                              <Checkbox
                                id={`col-${col.name}`}
                                checked={baseFilterColumns.includes(col.name)}
                                onCheckedChange={(checked) =>
                                  toggleFilterColumn(col.name, !!checked)
                                }
                              />
                              <label
                                htmlFor={`col-${col.name}`}
                                className="text-sm font-mono cursor-pointer select-none"
                              >
                                {col.name}
                                <span className="ml-1.5 text-xs text-gray-400 font-sans">
                                  ({col.type})
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>

                        {baseFilterColumns.length > 1 && (
                          <div className="flex items-center gap-2 pt-1">
                            <Label className="text-xs">Lógica:</Label>
                            <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs">
                              <button
                                type="button"
                                onClick={() => setBaseFilterLogic('AND')}
                                className={`px-3 py-1 transition-colors ${
                                  baseFilterLogic === 'AND'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                AND
                              </button>
                              <button
                                type="button"
                                onClick={() => setBaseFilterLogic('OR')}
                                className={`px-3 py-1 transition-colors ${
                                  baseFilterLogic === 'OR'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                OR
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Section 4 — Institución */}
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Institución
                  </p>

                  <div>
                    <Label className="text-xs mb-1 block">Institución asociada</Label>
                    <Select value={institutionId} onValueChange={setInstitutionId}>
                      <SelectTrigger>
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
                </div>

              </div>
            </ScrollArea>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || !selectedTable}>
                {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                {isEdit ? 'Guardar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
