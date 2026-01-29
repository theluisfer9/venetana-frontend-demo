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

function ipmColor(ipm: number): string {
  if (ipm >= 0.7) return 'destructive'
  if (ipm >= 0.4) return 'secondary'
  return 'outline'
}

function privacionPill(nivel: string) {
  const colors: Record<string, string> = {
    extrema: 'bg-red-100 text-red-800',
    alta: 'bg-orange-100 text-orange-800',
    media: 'bg-yellow-100 text-yellow-800',
    baja: 'bg-green-100 text-green-800',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[nivel] ?? 'bg-gray-100 text-gray-800'}`}>
      {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
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
              <TableHead>Nombre</TableHead>
              <TableHead>DPI</TableHead>
              <TableHead>Genero</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>IPM</TableHead>
              <TableHead>Privacion</TableHead>
              <TableHead className="text-center">Intervenciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((b) => (
              <TableRow
                key={b.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSelectBeneficiario(b.id)}
              >
                <TableCell className="font-medium">{b.nombre_completo}</TableCell>
                <TableCell className="font-mono text-xs">{b.dpi}</TableCell>
                <TableCell>{b.genero === 'F' ? 'Femenino' : 'Masculino'}</TableCell>
                <TableCell>{b.edad}</TableCell>
                <TableCell>{b.departamento}</TableCell>
                <TableCell>{b.municipio}</TableCell>
                <TableCell>
                  <Badge variant={ipmColor(b.ipm) as 'destructive' | 'secondary' | 'outline'}>
                    {b.ipm.toFixed(2)}
                  </Badge>
                </TableCell>
                <TableCell>{privacionPill(b.nivel_privacion)}</TableCell>
                <TableCell className="text-center">{b.num_intervenciones}</TableCell>
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
