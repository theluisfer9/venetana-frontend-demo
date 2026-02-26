import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { DataSourceColumn } from '@/lib/query-builder-types'

interface Props {
  columns: DataSourceColumn[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function QueryGroupBySelector({ columns, selected, onChange }: Props) {
  const groupable = columns.filter((c) => c.is_groupable)

  if (groupable.length === 0) return null

  function toggle(colName: string) {
    if (selected.includes(colName)) {
      onChange(selected.filter((c) => c !== colName))
    } else {
      onChange([...selected, colName])
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Agrupar por
      </Label>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {groupable.map((col) => (
          <div key={col.column_name} className="flex items-center gap-1.5">
            <Checkbox
              id={`grp-${col.column_name}`}
              checked={selected.includes(col.column_name)}
              onCheckedChange={() => toggle(col.column_name)}
              className="h-3.5 w-3.5"
            />
            <label
              htmlFor={`grp-${col.column_name}`}
              className="text-xs text-gray-700 cursor-pointer"
            >
              {col.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
