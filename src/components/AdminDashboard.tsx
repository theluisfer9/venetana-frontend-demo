import { Building2, Map, MapPinned, Users, House, UsersRound, Download, CircleDashed, CircleCheckBig, Landmark, UserRound, Scale, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AdminDashboardStats } from '@/lib/dashboard-types'

type Props = {
  stats?: AdminDashboardStats
  isLoading: boolean
}

type SummaryMetric = {
  key: string
  label: string
  value: number | string
  description: string
  icon: typeof Building2
  tone: string
}

function formatNumber(value: number | undefined) {
  return (value ?? 0).toLocaleString()
}

export default function AdminDashboard({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!stats) return null

  const summaryMetrics: SummaryMetric[] = [
    {
      key: 'instituciones',
      label: 'Instituciones',
      value: stats.total_instituciones,
      description: 'Instituciones activas en el sistema',
      icon: Building2,
      tone: 'bg-sky-50 text-sky-700',
    },
    {
      key: 'usuarios',
      label: 'Usuarios',
      value: stats.total_usuarios,
      description: 'Usuarios activos con acceso',
      icon: Users,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      key: 'consultas',
      label: 'Consultas guardadas',
      value: stats.total_consultas_guardadas,
      description: 'Consultas registradas en el sistema',
      icon: Download,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      key: 'hogares',
      label: 'Hogares',
      value: stats.total_hogares,
      description: 'Hogares visibles en el dashboard admin',
      icon: House,
      tone: 'bg-rose-50 text-rose-700',
    },
    {
      key: 'personas',
      label: 'Personas',
      value: stats.total_personas,
      description: 'Personas agregadas en la cobertura total',
      icon: UsersRound,
      tone: 'bg-violet-50 text-violet-700',
    },
    {
      key: 'departamentos',
      label: 'Departamentos',
      value: stats.departamentos_cubiertos,
      description: 'Cobertura geográfica por departamento',
      icon: Map,
      tone: 'bg-cyan-50 text-cyan-700',
    },
    {
      key: 'municipios',
      label: 'Municipios',
      value: stats.municipios_cubiertos,
      description: 'Cobertura geográfica por municipio',
      icon: MapPinned,
      tone: 'bg-lime-50 text-lime-700',
    },
    {
      key: 'lugares',
      label: 'Lugares poblados',
      value: stats.lugares_poblados,
      description: 'Lugares poblados identificados',
      icon: Landmark,
      tone: 'bg-orange-50 text-orange-700',
    },
  ]

  const maxDepto = Math.max(...stats.por_departamento.map((item) => item.cantidad), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map((metric) => (
          <Card key={metric.key} className="border-slate-200 shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <div className={`rounded-xl p-3 ${metric.tone}`}>
                <metric.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-600">{metric.label}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                  {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Usuarios por institución</CardTitle>
            <CardDescription>Incluye el conteo de consultas guardadas por institución.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institución</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-right">Usuarios</TableHead>
                  <TableHead className="text-right">Consultas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.usuarios_por_institucion.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                      No hay instituciones registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.usuarios_por_institucion.map((item) => (
                    <TableRow key={item.code}>
                      <TableCell className="font-medium">{item.institution}</TableCell>
                      <TableCell className="font-mono text-xs">{item.code}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.usuarios)}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.consultas)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Potenciales beneficiarios por institución</CardTitle>
            <CardDescription>Derivado de los programas configurados en ClickHouse.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.beneficiarios_por_institucion.map((item) => (
              <div key={item.code} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{item.institution}</p>
                    <p className="text-xs font-mono text-slate-500">{item.code}</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-950">
                    {formatNumber(item.potenciales_beneficiarios)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Estado territorial</CardTitle>
            <CardDescription>Seguimiento de municipios y composición por sexo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CircleCheckBig className="h-4 w-4" />
                  Municipios finalizados
                </div>
                <p className="mt-2 text-3xl font-bold">
                  {formatNumber(stats.municipios_finalizados)}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 text-amber-900">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CircleDashed className="h-4 w-4" />
                  Municipios en progreso
                </div>
                <p className="mt-2 text-3xl font-bold">
                  {formatNumber(stats.municipios_en_progreso)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stats.personas_por_sexo.map((item) => (
                <div key={item.sexo} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <UserRound className="h-4 w-4" />
                    {item.sexo}
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {formatNumber(item.cantidad)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Pobreza e inseguridad alimentaria</CardTitle>
            <CardDescription>Promedio IPM, clasificación e inseguridad alimentaria.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Scale className="h-4 w-4" />
                Promedio IPM
              </div>
              <p className="mt-2 text-3xl font-bold">{stats.promedio_ipm.toFixed(2)}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-600">Clasificación IPM</p>
              {stats.por_ipm_clasificacion.map((item) => (
                <div key={item.clasificacion} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
                  <span className="text-sm text-slate-700">{item.clasificacion}</span>
                  <span className="text-sm font-semibold text-slate-950">{formatNumber(item.cantidad)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-600">Inseguridad alimentaria</p>
              {stats.inseguridad_alimentaria.map((item) => (
                <div key={item.nivel} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <ShieldAlert className="h-4 w-4 text-orange-600" />
                    {item.nivel}
                  </span>
                  <span className="text-sm font-semibold text-slate-950">{formatNumber(item.cantidad)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Distribución por departamento</CardTitle>
          <CardDescription>Concentración de hogares por departamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.por_departamento.map((item) => (
            <div key={item.codigo} className="flex items-center gap-3">
              <div className="w-40 shrink-0">
                <p className="truncate text-sm font-medium text-slate-700">{item.departamento}</p>
                <p className="text-xs font-mono text-slate-400">{item.codigo}</p>
              </div>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{ width: `${(item.cantidad / maxDepto) * 100}%` }}
                />
              </div>
              <p className="w-16 text-right text-sm font-semibold text-slate-950">
                {formatNumber(item.cantidad)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
