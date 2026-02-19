import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { DataSourceColumn } from '@/lib/query-builder-types'

interface Props {
  columns: DataSourceColumn[]
  selected: string[]
  onChange: (selected: string[]) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  GEO: 'Geograficos',
  DIMENSION: 'Dimensiones',
  MEASURE: 'Medidas',
  INTERVENTION: 'Intervenciones',
}

export default function QueryColumnSelector({ columns, selected, onChange }: Props) {
  const selectable = columns.filter((c) => c.is_selectable)
  const grouped = new Map<string, DataSourceColumn[]>()
  for (const col of selectable) {
    const group = grouped.get(col.category) || []
    group.push(col)
    grouped.set(col.category, group)
  }

  function toggle(colName: string) {
    if (selected.includes(colName)) {
      onChange(selected.filter((c) => c !== colName))
    } else {
      onChange([...selected, colName])
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Columnas a mostrar
      </Label>
      {Array.from(grouped.entries()).map(([category, cols]) => (
        <div key={category}>
          <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">
            {CATEGORY_LABELS[category] || category}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {cols.map((col) => (
              <div key={col.column_name} className="flex items-center gap-1.5">
                <Checkbox
                  id={`col-${col.column_name}`}
                  checked={selected.includes(col.column_name)}
                  onCheckedChange={() => toggle(col.column_name)}
                  className="h-3.5 w-3.5"
                />
                <label
                  htmlFor={`col-${col.column_name}`}
                  className="text-xs text-gray-700 cursor-pointer"
                >
                  {col.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
