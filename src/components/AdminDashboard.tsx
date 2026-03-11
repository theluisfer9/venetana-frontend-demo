import { Building2, Map, MapPinned, Users, House, UsersRound, Download, CircleDashed, CircleCheckBig, Landmark, UserRound, Scale, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
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

const COLORS_PIE = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
const COLORS_INSEG = ['#22c55e', '#facc15', '#f97316', '#ef4444']
const COLORS_SEXO = ['#6366f1', '#ec4899']

function formatNumber(value: number | undefined) {
  return (value ?? 0).toLocaleString()
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-slate-600">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-semibold text-slate-900">{formatNumber(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; name: string
}) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#475569" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  )
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

  // Prepare chart data
  const deptoData = [...stats.por_departamento]
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 15)
    .map((d) => ({ name: d.departamento, hogares: d.cantidad }))

  const benefData = stats.beneficiarios_por_institucion.map((b) => ({
    name: b.institution,
    beneficiarios: b.potenciales_beneficiarios,
  }))

  const ipmData = stats.por_ipm_clasificacion.map((c) => ({
    name: c.clasificacion,
    value: c.cantidad,
  }))

  const sexoData = stats.personas_por_sexo.map((s) => ({
    name: s.sexo,
    value: s.cantidad,
  }))

  const insegData = stats.inseguridad_alimentaria.map((i) => ({
    name: i.nivel,
    value: i.cantidad,
  }))

  return (
    <div className="space-y-6">
      {/* ── Summary metric cards ── */}
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

      {/* ── Promedios IPM / PMT / NBI ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 bg-slate-950 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Scale className="h-4 w-4" />
              Promedio IPM
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight">{stats.promedio_ipm.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-indigo-950 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
              <Scale className="h-4 w-4" />
              Promedio PMT
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight">{(stats.promedio_pmt ?? 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-emerald-950 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <Scale className="h-4 w-4" />
              Promedio NBI
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight">{(stats.promedio_nbi ?? 0).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Row: Departamentos bar chart + Beneficiarios bar chart ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Distribucion por departamento</CardTitle>
            <CardDescription>Top 15 departamentos por concentracion de hogares.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={deptoData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v.toLocaleString()} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hogares" name="Hogares" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Beneficiarios por institucion</CardTitle>
            <CardDescription>Personas distintas por CUI derivadas de los programas.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={benefData} margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="beneficiarios" name="Beneficiarios" radius={[4, 4, 0, 0]}>
                  {benefData.map((_, i) => (
                    <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Row: IPM Pie + Sexo Pie + Inseguridad Pie ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Clasificacion IPM</CardTitle>
            <CardDescription>Distribucion de hogares por nivel de pobreza multidimensional.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ipmData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={PieLabel}
                >
                  {ipmData.map((_, i) => (
                    <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatNumber(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Composicion por sexo</CardTitle>
            <CardDescription>Distribucion de personas por genero.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sexoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={PieLabel}
                >
                  {sexoData.map((_, i) => (
                    <Cell key={i} fill={COLORS_SEXO[i % COLORS_SEXO.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatNumber(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Inseguridad alimentaria</CardTitle>
            <CardDescription>Hogares por nivel de inseguridad alimentaria.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={insegData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={PieLabel}
                >
                  {insegData.map((_, i) => (
                    <Cell key={i} fill={COLORS_INSEG[i % COLORS_INSEG.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatNumber(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Row: Usuarios table + Estado territorial ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Usuarios por institucion</CardTitle>
            <CardDescription>Incluye el conteo de consultas guardadas por institucion.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institucion</TableHead>
                  <TableHead>Codigo</TableHead>
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
            <CardTitle>Estado territorial</CardTitle>
            <CardDescription>Seguimiento de municipios y composicion por sexo.</CardDescription>
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
      </div>
    </div>
  )
}
