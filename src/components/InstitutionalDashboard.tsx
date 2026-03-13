import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  House, UsersRound, Map as MapIcon, MapPinned, Scale, ShieldAlert, Hammer,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { useDashboard } from '@/hooks/use-dashboard'
import type { InstitutionalDashboardStats } from '@/lib/dashboard-types'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
const COLORS_INSEG = ['#22c55e', '#facc15', '#f97316', '#ef4444']
const COLORS_SEXO = ['#6366f1', '#ec4899']
const COLORS_STACKED = ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6', '#ec4899']

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

function ClassificationPie({ title, description, data, colors }: {
  title: string; description: string; data: { name: string; value: number }[]; colors: string[]
}) {
  if (data.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-sm text-slate-400">
          Sin datos disponibles
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={PieLabel}>
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => formatNumber(v)} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function buildStackedDeptoData(
  raw: { departamento: string; codigo: string; clasificacion: string; cantidad: number }[],
) {
  const byDepto = new Map<string, Record<string, number>>()
  const clasifs = new Set<string>()

  for (const r of raw) {
    clasifs.add(r.clasificacion)
    const existing = byDepto.get(r.departamento) ?? {}
    existing[r.clasificacion] = (existing[r.clasificacion] ?? 0) + r.cantidad
    byDepto.set(r.departamento, existing)
  }

  const data = Array.from(byDepto.entries())
    .map(([name, vals]) => ({ name, ...vals }))
    .sort((a, b) => {
      const totalA = Object.values(a).filter((v): v is number => typeof v === 'number').reduce((s, v) => s + v, 0)
      const totalB = Object.values(b).filter((v): v is number => typeof v === 'number').reduce((s, v) => s + v, 0)
      return totalB - totalA
    })
    .slice(0, 10)

  return { data, classifications: Array.from(clasifs) }
}

function StackedDeptoChart({ title, description, raw }: {
  title: string; description: string; raw: { departamento: string; codigo: string; clasificacion: string; cantidad: number }[]
}) {
  if (!raw || raw.length === 0) return null
  const { data, classifications } = buildStackedDeptoData(raw)
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(data.length * 36, 200)}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v.toLocaleString()} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#475569' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {classifications.map((c, i) => (
              <Bar key={c} dataKey={c} name={c} stackId="stack" fill={COLORS_STACKED[i % COLORS_STACKED.length]} radius={i === classifications.length - 1 ? [0, 4, 4, 0] : undefined} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default function InstitutionalDashboard() {
  const { data: rawStats, isLoading } = useDashboard()
  const stats = rawStats as InstitutionalDashboardStats | undefined

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

  const ipmData = (stats.por_ipm_clasificacion ?? []).map((c) => ({ name: c.clasificacion, value: c.cantidad }))
  const pmtData = (stats.por_pmt_clasificacion ?? []).map((c) => ({ name: c.clasificacion, value: c.cantidad }))
  const nbiData = (stats.por_nbi_clasificacion ?? []).map((c) => ({ name: c.clasificacion, value: c.cantidad }))
  const sexoData = stats.personas_por_sexo.map((s) => ({ name: s.sexo, value: s.cantidad }))
  const insegData = stats.inseguridad_alimentaria.map((i) => ({ name: i.nivel, value: i.cantidad }))

  const BONO_LABELS: Record<string, string> = {
    estufa_mejorada: 'Estufa mejorada',
    ecofiltro: 'Ecofiltro',
    letrina: 'Letrina',
    repello: 'Repello',
    piso: 'Piso',
  }

  const bonosEntries = stats.bonos
    ? Object.entries(stats.bonos).filter(([k]) => k !== 'total_intervenciones')
    : []

  return (
    <div className="space-y-6">
      {/* ── Summary metrics ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: 'Hogares', value: stats.total_hogares, icon: House, tone: 'bg-rose-50 text-rose-700' },
          { label: 'Personas (CUI)', value: stats.total_personas, icon: UsersRound, tone: 'bg-violet-50 text-violet-700' },
          { label: 'Departamentos', value: stats.departamentos_cubiertos, icon: MapIcon, tone: 'bg-cyan-50 text-cyan-700' },
          { label: 'Municipios', value: stats.municipios_cubiertos, icon: MapPinned, tone: 'bg-lime-50 text-lime-700' },
          { label: 'Consultas', value: stats.total_consultas, icon: MapIcon, tone: 'bg-amber-50 text-amber-700' },
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

      {/* ── Clasificaciones: IPM + PMT + NBI (siempre 3 columnas) ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ClassificationPie title="Clasificación IPM" description="Pobreza multidimensional." data={ipmData} colors={COLORS} />
        <ClassificationPie title="Clasificación PMT" description="Proxy means test." data={pmtData} colors={COLORS} />
        <ClassificationPie title="Clasificación NBI" description="Necesidades básicas insatisfechas." data={nbiData} colors={COLORS} />
      </div>

      {/* ── Clasificación por departamento (stacked bars) ── */}
      {(stats.ipm_por_departamento ?? []).length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <StackedDeptoChart
            title="IPM por departamento"
            description="Clasificación de pobreza multidimensional por departamento."
            raw={stats.ipm_por_departamento}
          />
          <StackedDeptoChart
            title="PMT por departamento"
            description="Proxy means test por departamento."
            raw={stats.pmt_por_departamento ?? []}
          />
        </div>
      )}

      {(stats.nbi_por_departamento ?? []).length > 0 && (
        <StackedDeptoChart
          title="NBI por departamento"
          description="Necesidades básicas insatisfechas por departamento."
          raw={stats.nbi_por_departamento}
        />
      )}

      {/* ── Sexo + Inseguridad ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ClassificationPie title="Composición por sexo" description="Distribución de personas por género." data={sexoData} colors={COLORS_SEXO} />
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-orange-600" />
              Inseguridad alimentaria
            </CardTitle>
            <CardDescription>Hogares por nivel de inseguridad alimentaria.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={insegData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={PieLabel}>
                  {insegData.map((_, i) => <Cell key={i} fill={COLORS_INSEG[i % COLORS_INSEG.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatNumber(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Departamentos ── */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Distribución por departamento</CardTitle>
          <CardDescription>Hogares por departamento de la institución.</CardDescription>
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

      {/* ── Bonos / Intervenciones ── */}
      {stats.bonos && bonosEntries.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Hammer className="h-4 w-4 text-indigo-600" />
                Intervenciones
              </CardTitle>
              <CardDescription>
                Total: {formatNumber(stats.bonos.total_intervenciones)} intervenciones entregadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {bonosEntries.map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">{BONO_LABELS[key] ?? key}</p>
                    <p className="mt-1 text-xl font-bold text-slate-950">{formatNumber(value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(stats.bonos_por_departamento ?? []).length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Intervenciones por departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Departamento</TableHead>
                      {bonosEntries.map(([key]) => (
                        <TableHead key={key} className="text-right text-xs">{BONO_LABELS[key] ?? key}</TableHead>
                      ))}
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.bonos_por_departamento.map((row) => (
                      <TableRow key={row.codigo}>
                        <TableCell className="font-medium text-sm">{row.departamento}</TableCell>
                        {bonosEntries.map(([key]) => (
                          <TableCell key={key} className="text-right text-sm">{formatNumber(row[key] as number)}</TableCell>
                        ))}
                        <TableCell className="text-right font-semibold text-sm">{formatNumber(row.total_intervenciones)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
