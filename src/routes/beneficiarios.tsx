import { useState } from 'react'
import { createRoute, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '@/hooks/use-auth'
import { useBeneficiarios, useBeneficiarioStats, useBeneficiarioDetail, useExportExcel, useExportPdf } from '@/hooks/use-beneficiarios'
import StatsBar from '@/components/StatsBar'
import BeneficiarioFiltersPanel from '@/components/BeneficiarioFilters'
import BeneficiarioTable from '@/components/BeneficiarioTable'
import PersonasList from '@/components/PersonasList'
import ViviendaInfo from '@/components/ViviendaInfo'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="personas">Personas</TabsTrigger>
            <TabsTrigger value="vivienda">Vivienda</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            {/* Datos principales */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Hogar ID</p>
                <p className="font-mono">{data.hogar_id}</p>
              </div>
              <div>
                <p className="text-gray-500">CUI Jefe</p>
                <p className="font-mono">{data.cui_jefe_hogar ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Sexo Jefe</p>
                <p>{data.sexo_jefe_hogar}</p>
              </div>
              <div>
                <p className="text-gray-500">Celular</p>
                <p className="font-mono">{data.celular_jefe ?? 'N/A'}</p>
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
                <p className="text-gray-500">Lugar Poblado</p>
                <p>{data.lugar_poblado}</p>
              </div>
              <div>
                <p className="text-gray-500">Area</p>
                <p>{data.area}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Direccion</p>
                <p>{data.direccion || 'N/A'}</p>
              </div>
            </div>

            {/* Composicion del hogar */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Composicion del Hogar</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Total Personas</p>
                  <p className="font-medium">{data.numero_personas}</p>
                </div>
                <div>
                  <p className="text-gray-500">Hombres / Mujeres</p>
                  <p className="font-medium">{data.hombres} / {data.mujeres}</p>
                </div>
                <div>
                  <p className="text-gray-500">Menores &lt;5</p>
                  <p>{data.menores_5 ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Adultos Mayores</p>
                  <p>{data.adultos_mayores ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Embarazadas</p>
                  <p>{data.personas_embarazadas ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Personas c/ Dificultad</p>
                  <p>{data.personas_con_dificultad ?? 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Indicadores de pobreza */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Indicadores de Pobreza</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">IPM</p>
                  <Badge
                    variant={(data.ipm_gt ?? 0) >= 0.7 ? 'destructive' : (data.ipm_gt ?? 0) >= 0.4 ? 'secondary' : 'outline'}
                  >
                    {(data.ipm_gt ?? 0).toFixed(2)}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500">Clasificacion IPM</p>
                  <p className="font-medium">{data.ipm_gt_clasificacion}</p>
                </div>
                <div>
                  <p className="text-gray-500">PMT</p>
                  <p className="font-mono">{(data.pmt ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Clasificacion PMT</p>
                  <p className="font-medium">{data.pmt_clasificacion}</p>
                </div>
                <div>
                  <p className="text-gray-500">NBI</p>
                  <p className="font-mono">{(data.nbi ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Clasificacion NBI</p>
                  <p className="font-medium">{data.nbi_clasificacion}</p>
                </div>
              </div>
            </div>

            {/* Demografia */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Demografia</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Tipo Jefatura</p>
                  <p>{data.tipo_jefatura}</p>
                </div>
                <div>
                  <p className="text-gray-500">Comunidad Linguistica</p>
                  <p>{data.comunidad_linguistica}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Pueblo de Pertenencia</p>
                  <p>{data.pueblo_de_pertenencia}</p>
                </div>
              </div>
            </div>

            {/* Inseguridad alimentaria */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Inseguridad Alimentaria</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Nivel</p>
                  <p className="font-medium">{data.nivel_inseguridad_alimentaria}</p>
                </div>
                <div>
                  <p className="text-gray-500">Puntos ELCSA</p>
                  <p>{data.puntos_elcsa ?? 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Grupos etarios */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Grupos Etarios</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Primera Infancia</p>
                  <p>{data.primera_infancia ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ninos</p>
                  <p>{data.ninos ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Adolescentes</p>
                  <p>{data.adolescentes ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jovenes</p>
                  <p>{data.jovenes ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Adultos</p>
                  <p>{data.adultos ?? 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Fase */}
            {data.fase && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Fase</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Fase</p>
                    <p className="font-medium">{data.fase}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Estado</p>
                    <p>{data.fase_estado}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="personas">
            <PersonasList hogarId={id} />
          </TabsContent>

          <TabsContent value="vivienda">
            <ViviendaInfo hogarId={id} />
          </TabsContent>
        </Tabs>
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
