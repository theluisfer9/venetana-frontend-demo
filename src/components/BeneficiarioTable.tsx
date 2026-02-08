import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginatedResponse } from '@/lib/beneficiario-types'

interface Props {
  data: PaginatedResponse | undefined
  isLoading: boolean
  offset: number
  limit: number
  onPageChange: (newOffset: number) => void
  onSelectBeneficiario: (id: number) => void
}

function clasificacionPill(clasificacion: string) {
  const colors: Record<string, string> = {
    'Pobreza Extrema': 'bg-red-100 text-red-800',
    'Pobreza': 'bg-orange-100 text-orange-800',
    'Pobreza Moderada': 'bg-yellow-100 text-yellow-800',
    'No Pobre': 'bg-green-100 text-green-800',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[clasificacion] ?? 'bg-gray-100 text-gray-800'}`}>
      {clasificacion}
    </span>
  )
}

export default function BeneficiarioTable({
  data,
  isLoading,
  offset,
  limit,
  onPageChange,
  onSelectBeneficiario,
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
        No se encontraron beneficiarios con los filtros aplicados.
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
              <TableHead>Jefe Hogar</TableHead>
              <TableHead>CUI</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Lugar Poblado</TableHead>
              <TableHead>No. Personas</TableHead>
              <TableHead>IPM</TableHead>
              <TableHead>Clasif. IPM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((b) => (
              <TableRow
                key={b.hogar_id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSelectBeneficiario(b.hogar_id)}
              >
                <TableCell className="font-medium">{b.nombre_completo}</TableCell>
                <TableCell className="font-mono text-xs">{b.cui_jefe_hogar ?? 'N/A'}</TableCell>
                <TableCell>{b.sexo_jefe_hogar === 'Femenino' ? 'F' : 'M'}</TableCell>
                <TableCell>{b.departamento}</TableCell>
                <TableCell>{b.municipio}</TableCell>
                <TableCell>{b.lugar_poblado}</TableCell>
                <TableCell className="text-center">{b.numero_personas}</TableCell>
                <TableCell>
                  <Badge variant={(b.ipm_gt ?? 0) >= 0.7 ? 'destructive' : (b.ipm_gt ?? 0) >= 0.4 ? 'secondary' : 'outline'}>
                    {(b.ipm_gt ?? 0).toFixed(2)}
                  </Badge>
                </TableCell>
                <TableCell>{clasificacionPill(b.ipm_gt_clasificacion)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginacion */}
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
