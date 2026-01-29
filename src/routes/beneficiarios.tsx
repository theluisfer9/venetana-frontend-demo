import { useState } from 'react'
import { createRoute, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '@/hooks/use-auth'
import { useBeneficiarios, useBeneficiarioStats, useBeneficiarioDetail, useExportExcel, useExportPdf } from '@/hooks/use-beneficiarios'
import StatsBar from '@/components/StatsBar'
import BeneficiarioFiltersPanel from '@/components/BeneficiarioFilters'
import BeneficiarioTable from '@/components/BeneficiarioTable'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, X, FileSpreadsheet, FileText } from 'lucide-react'
import type { BeneficiarioFilters } from '@/lib/beneficiario-types'
import type { AnyRoute } from '@tanstack/react-router'

function BeneficiarioDetailPanel({
  id,
  onClose,
}: {
  id: number
  onClose: () => void
}) {
  const { data, isLoading } = useBeneficiarioDetail(id)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Cargando detalle...
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{data.nombre_completo}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">DPI</p>
            <p className="font-mono">{data.dpi}</p>
          </div>
          <div>
            <p className="text-gray-500">Genero</p>
            <p>{data.genero === 'F' ? 'Femenino' : 'Masculino'}</p>
          </div>
          <div>
            <p className="text-gray-500">Edad</p>
            <p>{data.edad} anios</p>
          </div>
          <div>
            <p className="text-gray-500">Fecha nacimiento</p>
            <p>{data.fecha_nacimiento}</p>
          </div>
          <div>
            <p className="text-gray-500">Departamento</p>
            <p>{data.departamento}</p>
          </div>
          <div>
            <p className="text-gray-500">Municipio</p>
            <p>{data.municipio}</p>
          </div>
          <div>
            <p className="text-gray-500">Miembros hogar</p>
            <p>{data.miembros_hogar}</p>
          </div>
          <div>
            <p className="text-gray-500">Menores &lt;5</p>
            <p>{data.menores_5}</p>
          </div>
          <div>
            <p className="text-gray-500">Adultos mayores</p>
            <p>{data.adultos_mayores}</p>
          </div>
          <div>
            <p className="text-gray-500">IPM</p>
            <Badge
              variant={data.ipm >= 0.7 ? 'destructive' : data.ipm >= 0.4 ? 'secondary' : 'outline'}
            >
              {data.ipm.toFixed(2)}
            </Badge>
          </div>
          <div>
            <p className="text-gray-500">Nivel privacion</p>
            <p className="capitalize">{data.nivel_privacion}</p>
          </div>
        </div>

        {data.intervenciones.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Intervenciones ({data.intervenciones.length})</p>
            <div className="space-y-2">
              {data.intervenciones.map((iv, i) => (
                <div key={i} className="text-sm p-2 bg-gray-50 rounded border">
                  <p className="font-medium">{iv.tipo_name}</p>
                  <p className="text-gray-500">{iv.institucion_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.intervenciones.length === 0 && (
          <p className="text-sm text-gray-400 italic">Sin intervenciones registradas</p>
        )}
      </CardContent>
    </Card>
  )
}

function BeneficiariosPage() {
  const [filters, setFilters] = useState<BeneficiarioFilters>({})
  const [offset, setOffset] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const limit = 10

  const { data, isLoading } = useBeneficiarios(filters, offset, limit)
  const { data: stats, isLoading: statsLoading } = useBeneficiarioStats(filters)
  const exportExcel = useExportExcel(filters)
  const exportPdf = useExportPdf(filters)

  function handleApplyFilters(newFilters: BeneficiarioFilters) {
    setFilters(newFilters)
    setOffset(0)
    setSelectedId(null)
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Consulta de Beneficiarios</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportExcel.mutate()}
              disabled={exportExcel.isPending}
            >
              <FileSpreadsheet className="mr-1.5 h-4 w-4" />
              {exportExcel.isPending ? 'Exportando...' : 'Excel'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPdf.mutate()}
              disabled={exportPdf.isPending}
            >
              <FileText className="mr-1.5 h-4 w-4" />
              {exportPdf.isPending ? 'Exportando...' : 'PDF'}
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <StatsBar stats={stats} isLoading={statsLoading} />

        {/* Main layout: filters + table/detail */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Filters panel */}
          <div className="order-2 lg:order-1">
            <BeneficiarioFiltersPanel
              onApply={handleApplyFilters}
              currentFilters={filters}
            />
          </div>

          {/* Content area */}
          <div className="order-1 lg:order-2">
            {selectedId !== null ? (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedId(null)}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Volver a lista
                </Button>
                <BeneficiarioDetailPanel
                  id={selectedId}
                  onClose={() => setSelectedId(null)}
                />
              </div>
            ) : (
              <BeneficiarioTable
                data={data}
                isLoading={isLoading}
                offset={offset}
                limit={limit}
                onPageChange={setOffset}
                onSelectBeneficiario={setSelectedId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: '/beneficiarios',
    component: BeneficiariosPage,
    getParentRoute: () => parentRoute,
    beforeLoad: () => {
      if (!isAuthenticated()) {
        throw redirect({ to: '/login' })
      }
    },
  })
