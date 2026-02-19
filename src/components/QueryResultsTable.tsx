import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { QueryExecuteResponse } from '@/lib/query-builder-types'

interface Props {
  data: QueryExecuteResponse | undefined
  isLoading: boolean
  offset: number
  limit: number
  onPageChange: (offset: number) => void
}

export default function QueryResultsTable({ data, isLoading, offset, limit, onPageChange }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {data ? 'No se encontraron resultados.' : 'Ejecuta una consulta para ver resultados.'}
      </div>
    )
  }

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(data.total / limit)
  const hasPrev = offset > 0
  const hasNext = offset + limit < data.total

  return (
    <div>
      <div className="rounded-lg border bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {data.columns_meta.map((col) => (
                <TableHead key={col.column_name}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((row, i) => (
              <TableRow key={i}>
                {data.columns_meta.map((col) => (
                  <TableCell key={col.column_name} className="text-sm">
                    {String(row[col.column_name] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">
          Mostrando {offset + 1}-{Math.min(offset + limit, data.total)} de {data.total}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => onPageChange(Math.max(0, offset - limit))}>
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <span className="text-sm text-gray-600">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onPageChange(offset + limit)}>
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
