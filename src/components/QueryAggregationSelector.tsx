import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DataSourceColumn, Aggregation } from '@/lib/query-builder-types'

interface Props {
  columns: DataSourceColumn[]
  aggregations: Aggregation[]
  onChange: (aggregations: Aggregation[]) => void
}

const AGG_FUNCTIONS = [
  { value: 'COUNT', label: 'Contar' },
  { value: 'SUM', label: 'Sumar' },
]

export default function QueryAggregationSelector({ columns, aggregations, onChange }: Props) {
  const measures = columns.filter((c) => c.category === 'MEASURE')

  // COUNT(*) is always the first aggregation, auto-managed
  const hasCountStar = aggregations.some((a) => a.column === '*' && a.function === 'COUNT')

  function toggleMeasure(colName: string, func: string) {
    const exists = aggregations.find((a) => a.column === colName)
    if (exists) {
      onChange(aggregations.filter((a) => a.column !== colName))
    } else {
      onChange([...aggregations, { column: colName, function: func as 'COUNT' | 'SUM' }])
    }
  }

  function changeMeasureFunc(colName: string, func: string) {
    onChange(
      aggregations.map((a) =>
        a.column === colName ? { ...a, function: func as 'COUNT' | 'SUM' } : a
      )
    )
  }

  // Ensure COUNT(*) is always present when this component renders
  if (!hasCountStar) {
    onChange([{ column: '*', function: 'COUNT' }, ...aggregations])
    return null
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Medidas a calcular
      </Label>
      <p className="text-[11px] text-gray-400">COUNT(*) se incluye automaticamente</p>
      {measures.length > 0 && (
        <div className="space-y-1.5">
          {measures.map((col) => {
            const current = aggregations.find((a) => a.column === col.column_name)
            return (
              <div key={col.column_name} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!current}
                  onChange={() => toggleMeasure(col.column_name, 'SUM')}
                  className="h-3.5 w-3.5 rounded border-gray-300"
                />
                <span className="text-xs text-gray-700 w-40">{col.label}</span>
                {current && (
                  <Select
                    value={current.function}
                    onValueChange={(v) => changeMeasureFunc(col.column_name, v)}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGG_FUNCTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
