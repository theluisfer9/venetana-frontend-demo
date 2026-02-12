import { useState } from 'react'
import { createRoute, redirect, useNavigate, useSearch } from '@tanstack/react-router'
import { isAuthenticated } from '@/hooks/use-auth'
import {
  useInstitutionPreset,
  useConsultaList,
  useConsultaDetail,
} from '@/hooks/use-consulta'
import ConsultaFiltersPanel from '@/components/ConsultaFilters'
import ConsultaTable from '@/components/ConsultaTable'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, X, Users, Home, CheckCircle2, XCircle } from 'lucide-react'
import type { ConsultaFilters, InstitutionPreset } from '@/lib/consulta-types'
import type { AnyRoute } from '@tanstack/react-router'

function ConsultaDetailPanel({
  id,
  onClose,
  preset,
}: {
  id: number
  onClose: () => void
  preset: InstitutionPreset
}) {
  const { data, isLoading } = useConsultaDetail(id)

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
        <CardTitle className="text-lg">Hogar {data.hogar_id}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Ubicacion</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Departamento</p>
                <p className="font-medium">{data.departamento}</p>
              </div>
              <div>
                <p className="text-gray-500">Municipio</p>
                <p className="font-medium">{data.municipio}</p>
              </div>
              <div>
                <p className="text-gray-500">Lugar Poblado</p>
                <p className="font-medium">{data.lugar_poblado}</p>
              </div>
              <div>
                <p className="text-gray-500">Area</p>
                <p className="font-medium">{data.area}</p>
              </div>
            </div>
          </div>

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
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Indice de Pobreza Multidimensional</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">IPM</p>
                <p className="font-mono">{(data.ipm_gt ?? 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Clasificacion</p>
                <p className="font-medium">{data.ipm_gt_clasificacion}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Intervenciones</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {preset.intervention_columns.map((col) => (
                <div key={col} className="flex items-center gap-2">
                  {data[col] === 1 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-300" />
                  )}
                  <span className={data[col] === 1 ? 'font-medium' : 'text-gray-500'}>
                    {preset.labels[col] || col}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ConsultaPage() {
  const { intervencion } = useSearch({ strict: false }) as { intervencion?: string }
  const navigate = useNavigate()
  const { data: preset, isLoading: presetLoading, error: presetError } = useInstitutionPreset()

  const [geoFilters, setGeoFilters] = useState<ConsultaFilters>({})
  const [offset, setOffset] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const limit = 10

  const mergedFilters: ConsultaFilters = {
    ...geoFilters,
    ...(intervencion ? { [intervencion]: true } : {}),
  }

  const { data, isLoading } = useConsultaList(mergedFilters, offset, limit)

  function handleApplyFilters(newFilters: ConsultaFilters) {
    setGeoFilters(newFilters)
    setOffset(0)
    setSelectedId(null)
  }

  if (presetLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (presetError || !preset) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 font-medium mb-2">No tiene acceso a consulta institucional</p>
            <p className="text-sm text-gray-500">
              Su usuario no tiene permisos para acceder a esta funcionalidad.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const interventionLabel = intervencion
    ? (preset.labels[intervencion] || intervencion)
    : 'Todas las intervenciones'

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{interventionLabel}</h2>
            <p className="text-sm text-gray-600">{preset.name}</p>
          </div>
        </div>

        {data && (
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Home className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">{data.total.toLocaleString()}</span> hogares
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="font-semibold">
                {data.items.reduce((sum, item) => sum + item.numero_personas, 0).toLocaleString()}
              </span> personas (en pagina)
            </div>
          </div>
        )}

        <ConsultaFiltersPanel
          preset={preset}
          onApply={handleApplyFilters}
          currentFilters={geoFilters}
        />

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
            <ConsultaDetailPanel
              id={selectedId}
              onClose={() => setSelectedId(null)}
              preset={preset}
            />
          </div>
        ) : (
          <ConsultaTable
            data={data}
            isLoading={isLoading}
            offset={offset}
            limit={limit}
            onPageChange={setOffset}
            onSelectHogar={setSelectedId}
            preset={preset}
          />
        )}
      </div>
    </div>
  )
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: '/consulta',
    component: ConsultaPage,
    getParentRoute: () => parentRoute,
    validateSearch: (search: Record<string, unknown>) => ({
      intervencion: (search.intervencion as string) || '',
    }),
    beforeLoad: () => {
      if (!isAuthenticated()) {
        throw redirect({ to: '/login' })
      }
    },
  })
