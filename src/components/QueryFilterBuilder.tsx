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
import { Plus, X, Filter, Trash2 } from 'lucide-react'
import type { DataSourceColumn, QueryFilter } from '@/lib/query-builder-types'

interface Props {
  columns: DataSourceColumn[]
  filters: QueryFilter[]
  onChange: (filters: QueryFilter[]) => void
}

const OPERATORS = [
  { value: 'eq', label: '= Igual' },
  { value: 'neq', label: '≠ Diferente' },
  { value: 'gt', label: '> Mayor que' },
  { value: 'lt', label: '< Menor que' },
  { value: 'gte', label: '≥ Mayor o igual' },
  { value: 'lte', label: '≤ Menor o igual' },
  { value: 'like', label: '~ Contiene' },
]

const OP_SHORT: Record<string, string> = {
  eq: '=',
  neq: '≠',
  gt: '>',
  lt: '<',
  gte: '≥',
  lte: '≤',
  like: '~',
}

export default function QueryFilterBuilder({ columns, filters, onChange }: Props) {
  const filterable = columns.filter((c) => c.is_filterable)
  const getColumn = (columnName: string) =>
    filterable.find((col) => col.column_name === columnName)
  const isBooleanColumn = (columnName: string) => getColumn(columnName)?.data_type === 'BOOLEAN'
  const getDefaultValueForColumn = (columnName: string) =>
    isBooleanColumn(columnName) ? false : ''

  function addFilter() {
    if (filterable.length === 0) return
    const firstColumn = filterable[0].column_name
    onChange([
      ...filters,
      { column: firstColumn, op: 'eq', value: getDefaultValueForColumn(firstColumn) },
    ])
  }

  function updateFilter(index: number, patch: Partial<QueryFilter>) {
    const updated = filters.map((f, i) => {
      if (i !== index) return f

      const nextFilter = { ...f, ...patch }
      if (patch.column && patch.column !== f.column) {
        nextFilter.value = getDefaultValueForColumn(patch.column)
      }
      return nextFilter
    })
    onChange(updated)
  }

  function removeFilter(index: number) {
    onChange(filters.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Filtros
          </span>
          {filters.length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
              {filters.length}
            </Badge>
          )}
        </div>
        {filters.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange([])}
            className="gap-1 text-xs text-red-500 hover:text-red-600 h-7"
          >
            <Trash2 className="h-3 w-3" />
            Limpiar todos
          </Button>
        )}
      </div>

      {filters.length === 0 ? (
        <div className="flex items-center justify-center py-4 border border-dashed rounded-lg">
          <Button variant="ghost" size="sm" onClick={addFilter} className="gap-1.5 text-gray-400 hover:text-gray-600">
            <Plus className="h-4 w-4" />
            Agregar filtro
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filters.map((filter, i) => {
            const colLabel = getColumn(filter.column)?.label ?? filter.column

            return (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 group"
              >
                {i > 0 && (
                  <span className="text-[10px] font-semibold text-blue-500 uppercase mr-1">Y</span>
                )}

                <Select value={filter.column} onValueChange={(v) => updateFilter(i, { column: v })}>
                  <SelectTrigger className="h-8 text-xs w-48 bg-white border-gray-200">
                    <SelectValue>{colLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {filterable.map((col) => (
                      <SelectItem key={col.column_name} value={col.column_name}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filter.op} onValueChange={(v) => updateFilter(i, { op: v })}>
                  <SelectTrigger className="h-8 text-xs w-32 bg-white border-gray-200 font-mono">
                    <SelectValue>{OP_SHORT[filter.op] ?? filter.op}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={String(filter.value)}
                  onChange={(e) => updateFilter(i, { value: e.target.value })}
                  className={`h-8 text-xs flex-1 bg-white border-gray-200 ${isBooleanColumn(filter.column) ? 'hidden' : ''}`}
                  placeholder="Valor..."
                />

                {isBooleanColumn(filter.column) && (
                  <Select
                    value={String(filter.value || 'false')}
                    onValueChange={(value) => updateFilter(i, { value: value === 'true' })}
                  >
                    <SelectTrigger className="h-8 text-xs flex-1 bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Verdadero</SelectItem>
                      <SelectItem value="false">Falso</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(i)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}

          <Button variant="outline" size="sm" onClick={addFilter} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Agregar filtro
          </Button>
        </div>
      )}
    </div>
  )
}
