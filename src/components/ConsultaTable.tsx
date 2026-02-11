import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import type { PaginatedConsulta, InstitutionPreset } from '@/lib/consulta-types'

interface Props {
  data: PaginatedConsulta | undefined
  isLoading: boolean
  offset: number
  limit: number
  onPageChange: (newOffset: number) => void
  onSelectHogar: (id: number) => void
  preset: InstitutionPreset
}

function InterventionIcon({ value }: { value: number }) {
  if (value === 1) {
    return <CheckCircle2 className="h-4 w-4 text-green-600" />
  }
  return <XCircle className="h-4 w-4 text-gray-300" />
}

export default function ConsultaTable({
  data,
  isLoading,
  offset,
  limit,
  onPageChange,
  onSelectHogar,
  preset,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No se encontraron hogares con los filtros aplicados.
      </div>
    )
  }

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(data.total / limit)
  const hasPrev = offset > 0
  const hasNext = offset + limit < data.total

  return (
    <div>
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hogar ID</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead className="text-center">No. Personas</TableHead>
              {preset.intervention_columns.map((col) => (
                <TableHead key={col} className="text-center">
                  {preset.labels[col] || col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item) => (
              <TableRow
                key={item.hogar_id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSelectHogar(item.hogar_id)}
              >
                <TableCell className="font-mono font-medium">{item.hogar_id}</TableCell>
                <TableCell>{item.departamento}</TableCell>
                <TableCell>{item.municipio}</TableCell>
                <TableCell className="text-center">{item.numero_personas}</TableCell>
                {preset.intervention_columns.map((col) => (
                  <TableCell key={col} className="text-center">
                    <InterventionIcon value={item[col] as number} />
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
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            onClick={() => onPageChange(Math.max(0, offset - limit))}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() => onPageChange(offset + limit)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
