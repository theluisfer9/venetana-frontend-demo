import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import type { DataSourceColumn, QueryFilter } from '@/lib/query-builder-types'

interface Props {
  columns: DataSourceColumn[]
  filters: QueryFilter[]
  onChange: (filters: QueryFilter[]) => void
}

const OPERATORS = [
  { value: 'eq', label: '=' },
  { value: 'neq', label: '!=' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'gte', label: '>=' },
  { value: 'lte', label: '<=' },
  { value: 'like', label: 'Contiene' },
]

export default function QueryFilterBuilder({ columns, filters, onChange }: Props) {
  const filterable = columns.filter((c) => c.is_filterable)

  function addFilter() {
    if (filterable.length === 0) return
    onChange([...filters, { column: filterable[0].column_name, op: 'eq', value: '' }])
  }

  function updateFilter(index: number, patch: Partial<QueryFilter>) {
    const updated = filters.map((f, i) => (i === index ? { ...f, ...patch } : f))
    onChange(updated)
  }

  function removeFilter(index: number) {
    onChange(filters.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Filtros
      </Label>
      {filters.map((filter, i) => (
        <div key={i} className="flex items-center gap-2">
          <Select value={filter.column} onValueChange={(v) => updateFilter(i, { column: v })}>
            <SelectTrigger className="h-8 text-xs w-48">
              <SelectValue />
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
            <SelectTrigger className="h-8 text-xs w-28">
              <SelectValue />
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
            className="h-8 text-xs flex-1"
            placeholder="Valor..."
          />

          <Button variant="ghost" size="sm" onClick={() => removeFilter(i)} className="h-8 w-8 p-0">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addFilter} className="gap-1">
        <Plus className="h-3.5 w-3.5" />
        Agregar filtro
      </Button>
    </div>
  )
}
