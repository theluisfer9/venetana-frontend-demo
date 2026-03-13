import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  House, UsersRound, Map, MapPinned, Scale, ShieldAlert,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useDashboard } from '@/hooks/use-dashboard'
import type { InstitutionalDashboardStats } from '@/lib/dashboard-types'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
const COLORS_INSEG = ['#22c55e', '#facc15', '#f97316', '#ef4444']
const COLORS_SEXO = ['#6366f1', '#ec4899']

function formatNumber(value: number | undefined | null) {
  return (value ?? 0).toLocaleString('es-GT')
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

export default function InstitutionalDashboard() {
  const { data: rawStats, isLoading } = useDashboard()
  const stats = rawStats as InstitutionalDashboardStats | undefined

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!stats) return null

  // Chart data
  const deptoData = [...stats.por_departamento]
    .sort((a, b) => b.cantidad - a.cantidad)
    .map((d) => ({ name: d.departamento, hogares: d.cantidad }))

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
      {/* ── Summary metrics ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: 'Hogares', value: stats.total_hogares, icon: House, tone: 'bg-rose-50 text-rose-700' },
          { label: 'Personas (CUI)', value: stats.total_personas, icon: UsersRound, tone: 'bg-violet-50 text-violet-700' },
          { label: 'Departamentos', value: stats.departamentos_cubiertos, icon: Map, tone: 'bg-cyan-50 text-cyan-700' },
          { label: 'Municipios', value: stats.municipios_cubiertos, icon: MapPinned, tone: 'bg-lime-50 text-lime-700' },
          { label: 'Consultas', value: stats.total_consultas, icon: Map, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Fuentes de datos', value: stats.total_fuentes_datos, icon: MapPinned, tone: 'bg-sky-50 text-sky-700' },
        ].map((m) => (
          <Card key={m.label} className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-xl p-3 ${m.tone}`}>
                <m.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-slate-950">{formatNumber(m.value)}</p>
                <p className="text-xs text-slate-500">{m.label}</p>
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
              <Scale className="h-4 w-4" /> Promedio IPM
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight">{(stats.promedio_ipm ?? 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-indigo-950 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
              <Scale className="h-4 w-4" /> Promedio PMT
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight">{(stats.promedio_pmt ?? 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-emerald-950 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <Scale className="h-4 w-4" /> Promedio NBI
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight">{(stats.promedio_nbi ?? 0).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts row: Departamentos + IPM clasificacion ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Distribucion por departamento</CardTitle>
            <CardDescription>Hogares por departamento de la institucion.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(deptoData.length * 32, 200)}>
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
            <CardTitle>Clasificacion IPM</CardTitle>
            <CardDescription>Distribucion de hogares por nivel de pobreza.</CardDescription>
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
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatNumber(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts row: Sexo + Inseguridad ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Composicion por sexo</CardTitle>
            <CardDescription>Distribucion de personas por genero.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
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
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-orange-600" />
              Inseguridad alimentaria
            </CardTitle>
            <CardDescription>Hogares por nivel de inseguridad alimentaria.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
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
    </div>
  )
}
