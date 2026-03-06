import { createRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { useCurrentUser, useLogout, isAuthenticated } from '@/hooks/use-auth'
import { useInstitutionPreset, useConsultaDashboard } from '@/hooks/use-consulta'
import { useDashboard } from '@/hooks/use-dashboard'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { LogOut, Users, ChevronRight, Database, Plus } from 'lucide-react'
import DashboardWidgets from '@/components/DashboardWidgets'
import AdminDashboard from '@/components/AdminDashboard'
import type { AdminDashboardStats } from '@/lib/dashboard-types'

import type { AnyRoute } from '@tanstack/react-router'

// ── Helpers ──────────────────────────────────────────────────────────

function formatNum(n: number | undefined | null): string {
  return (n ?? 0).toLocaleString('es-GT')
}

function pct(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// ── Stat Card ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'blue',
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  accent?: 'blue' | 'green' | 'purple' | 'orange' | 'rose' | 'cyan' | 'amber'
}) {
  const colors: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  }
  const c = colors[accent] ?? colors.blue

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`p-3 rounded-xl ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-gray-500 truncate">{label}</p>
          {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Horizontal bar ───────────────────────────────────────────────────

function HorizontalBar({
  items,
  color = 'bg-blue-500',
  maxItems,
}: {
  items: { label: string; value: number }[]
  color?: string
  maxItems?: number
}) {
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const display = maxItems ? sorted.slice(0, maxItems) : sorted
  const max = display.length > 0 ? display[0].value : 1

  return (
    <div className="space-y-2.5">
      {display.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs w-32 truncate text-gray-600">{item.label}</span>
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all duration-500`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700 w-14 text-right tabular-nums">
            {formatNum(item.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Donut-like percentage rings (CSS only) ───────────────────────────

function PercentageRing({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const p = pct(value, total)
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
          <circle
            cx="18" cy="18" r="15.9155"
            fill="none" stroke="#f3f4f6" strokeWidth="3"
          />
          <circle
            cx="18" cy="18" r="15.9155"
            fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${p} ${100 - p}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
          {p}%
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">{formatNum(value)}</p>
        <p className="text-[11px] text-gray-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ── Intervention Cards (existing consulta feature) ───────────────────

function InstitutionCards() {
  const navigate = useNavigate()
  const { data: preset, isLoading: presetLoading } = useInstitutionPreset()
  const { data: dashboard, isLoading: dashLoading } = useConsultaDashboard()

  if (presetLoading || dashLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!preset || !dashboard) return null

  const countMap = new Map(
    (dashboard.por_intervencion ?? []).map((item) => [item.intervencion, item.cantidad]),
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {preset.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {preset.intervention_columns.map((col) => {
            const label = preset.labels[col] || col
            const count = countMap.get(label) ?? 0

            return (
              <div
                key={col}
                className="group cursor-pointer rounded-lg border border-gray-100 bg-gray-50/50 p-4 hover:bg-blue-50/50 hover:border-blue-200 transition-all"
                onClick={() =>
                  navigate({ to: '/consulta', search: { intervencion: col } })
                }
              >
                <p className="text-xs font-medium text-gray-600 group-hover:text-blue-700 truncate">
                  {label}
                </p>
                <p className="text-xl font-bold text-gray-900 mt-1">{formatNum(count)}</p>
                <p className="text-[11px] text-gray-400">hogares</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Super Admin View ─────────────────────────────────────────────────

function SuperAdminView({ data }: { data: SuperAdminDashboard }) {
  const totalSexo = data.personas_por_sexo.reduce((s, x) => s + x.cantidad, 0)
  const totalIpm = data.por_ipm_clasificacion.reduce((s, x) => s + x.cantidad, 0)

  return (
    <div className="space-y-6">
      {/* Row 1 — Global KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Hogares Registrados" value={formatNum(data.total_hogares)} icon={Home} accent="blue" />
        <StatCard label="Personas Registradas" value={formatNum(data.total_personas)} icon={Users} accent="green" />
        <StatCard label="Departamentos" value={data.departamentos_cubiertos} sub={`${data.municipios_cubiertos} municipios`} icon={MapPin} accent="purple" />
        <StatCard label="Promedio IPM" value={data.promedio_ipm.toFixed(4)} icon={BarChart3} accent="orange" />
      </div>

      {/* Row 2 — Admin KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Instituciones" value={data.total_instituciones} icon={Building2} accent="cyan" />
        <StatCard label="Usuarios" value={data.total_usuarios} icon={UserCheck} accent="amber" />
        <StatCard label="Consultas Guardadas" value={data.total_consultas_guardadas} icon={FileText} accent="rose" />
        <StatCard label="Lugares Poblados" value={formatNum(data.lugares_poblados)} icon={Globe} accent="green" />
      </div>

      {/* Row 3 — Municipios progress + IPM + Sexo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Municipios */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avance Municipios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <div>
                <p className="text-3xl font-bold text-gray-900">{data.municipios_finalizados}</p>
                <p className="text-xs text-gray-400">finalizados</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-amber-600">{data.municipios_en_progreso}</p>
                <p className="text-xs text-gray-400">en progreso</p>
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${pct(data.municipios_finalizados, data.municipios_cubiertos)}%` }}
              />
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${pct(data.municipios_en_progreso, data.municipios_cubiertos)}%` }}
              />
            </div>
            <div className="flex gap-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Finalizados</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> En progreso</span>
            </div>
          </CardContent>
        </Card>

        {/* IPM Classification */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Clasificacion IPM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.por_ipm_clasificacion.map((item) => (
              <PercentageRing
                key={item.clasificacion}
                label={item.clasificacion}
                value={item.cantidad}
                total={totalIpm}
                color={item.clasificacion.toLowerCase().includes('no pobre') ? '#22c55e' : '#ef4444'}
              />
            ))}
          </CardContent>
        </Card>

        {/* Sexo distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Personas por Sexo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.personas_por_sexo.map((item) => (
              <PercentageRing
                key={item.sexo}
                label={item.sexo}
                value={item.cantidad}
                total={totalSexo}
                color={item.sexo.toLowerCase().includes('hombre') ? '#3b82f6' : '#ec4899'}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 4 — Institutions table + Beneficiaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Usuarios por Institucion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-400 uppercase">
                    <th className="text-left py-2 font-medium">Institucion</th>
                    <th className="text-center py-2 font-medium">Usuarios</th>
                    <th className="text-center py-2 font-medium">Consultas</th>
                  </tr>
                </thead>
                <tbody>
                  {data.usuarios_por_institucion.map((inst) => (
                    <tr key={inst.code} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5">
                        <div>
                          <p className="font-medium text-gray-800 truncate max-w-[200px]">{inst.institution}</p>
                          <Badge variant="outline" className="text-[10px] font-mono mt-0.5">{inst.code}</Badge>
                        </div>
                      </td>
                      <td className="text-center font-semibold">{inst.usuarios}</td>
                      <td className="text-center font-semibold">{inst.consultas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Beneficiarios por Institucion</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBar
              items={data.beneficiarios_por_institucion.map((b) => ({
                label: b.code,
                value: b.potenciales_beneficiarios,
              }))}
              color="bg-cyan-500"
            />
          </CardContent>
        </Card>
      </div>

      {/* Row 5 — Departamentos + Inseguridad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500">Por Departamento</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{data.por_departamento.length} deptos</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <HorizontalBar
              items={data.por_departamento.map((d) => ({
                label: d.departamento,
                value: d.cantidad,
              }))}
              color="bg-blue-500"
              maxItems={10}
            />
            {data.por_departamento.length > 10 && (
              <p className="text-[11px] text-gray-400 mt-3 text-center">
                Mostrando top 10 de {data.por_departamento.length}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Inseguridad Alimentaria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.inseguridad_alimentaria.map((item, i) => {
              const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-green-500']
              const textColors = ['text-red-600', 'text-orange-600', 'text-amber-600', 'text-green-600']
              const total = data.inseguridad_alimentaria.reduce((s, x) => s + x.cantidad, 0)
              return (
                <div key={item.nivel} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 truncate pr-2">{item.nivel}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${textColors[i] ?? 'text-gray-600'}`}>
                        {pct(item.cantidad, total)}%
                      </span>
                      <span className="text-xs text-gray-400 tabular-nums w-16 text-right">
                        {formatNum(item.cantidad)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[i] ?? 'bg-gray-400'} rounded-full transition-all duration-500`}
                      style={{ width: `${pct(item.cantidad, total)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Institutional View ───────────────────────────────────────────────

function InstitutionalView({ data }: { data: InstitutionalDashboard }) {
  const totalSexo = data.personas_por_sexo.reduce((s, x) => s + x.cantidad, 0)
  const totalIpm = data.por_ipm_clasificacion.reduce((s, x) => s + x.cantidad, 0)

  return (
    <div className="space-y-6">
      {/* Institution badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs font-mono px-2.5 py-1">
          {data.institution_code}
        </Badge>
        <span className="text-sm text-gray-500">{data.institution_name}</span>
      </div>

      {/* Row 1 — KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Hogares" value={formatNum(data.total_hogares)} icon={Home} accent="blue" />
        <StatCard label="Personas" value={formatNum(data.total_personas)} icon={Users} accent="green" />
        <StatCard label="Departamentos" value={data.departamentos_cubiertos} sub={`${data.municipios_cubiertos} municipios`} icon={MapPin} accent="purple" />
        <StatCard label="Promedio IPM" value={data.promedio_ipm.toFixed(4)} icon={BarChart3} accent="orange" />
      </div>

      {/* Row 2 — Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lugares Poblados" value={formatNum(data.lugares_poblados)} icon={Globe} accent="cyan" />
        <StatCard label="Consultas Guardadas" value={data.total_consultas} icon={FileText} accent="rose" />
        <StatCard label="Fuentes de Datos" value={data.total_fuentes_datos} icon={Database} accent="amber" />
        <StatCard
          label="Municipios Finalizados"
          value={data.municipios_finalizados}
          sub={`${data.municipios_en_progreso} en progreso`}
          icon={TrendingUp}
          accent="green"
        />
      </div>

      {/* Row 3 — IPM + Sexo + Municipios progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avance Municipios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <div>
                <p className="text-3xl font-bold text-gray-900">{data.municipios_finalizados}</p>
                <p className="text-xs text-gray-400">finalizados</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-amber-600">{data.municipios_en_progreso}</p>
                <p className="text-xs text-gray-400">en progreso</p>
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${pct(data.municipios_finalizados, data.municipios_cubiertos)}%` }}
              />
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${pct(data.municipios_en_progreso, data.municipios_cubiertos)}%` }}
              />
            </div>
            <div className="flex gap-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Finalizados</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> En progreso</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Clasificacion IPM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.por_ipm_clasificacion.map((item) => (
              <PercentageRing
                key={item.clasificacion}
                label={item.clasificacion}
                value={item.cantidad}
                total={totalIpm}
                color={item.clasificacion.toLowerCase().includes('no pobre') ? '#22c55e' : '#ef4444'}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Personas por Sexo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.personas_por_sexo.map((item) => (
              <PercentageRing
                key={item.sexo}
                label={item.sexo}
                value={item.cantidad}
                total={totalSexo}
                color={item.sexo.toLowerCase().includes('hombre') ? '#3b82f6' : '#ec4899'}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 4 — Departamentos + Inseguridad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500">Por Departamento</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{data.por_departamento.length} deptos</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <HorizontalBar
              items={data.por_departamento.map((d) => ({
                label: d.departamento,
                value: d.cantidad,
              }))}
              color="bg-purple-500"
              maxItems={10}
            />
            {data.por_departamento.length > 10 && (
              <p className="text-[11px] text-gray-400 mt-3 text-center">
                Mostrando top 10 de {data.por_departamento.length}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Inseguridad Alimentaria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.inseguridad_alimentaria.map((item, i) => {
              const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-green-500']
              const textColors = ['text-red-600', 'text-orange-600', 'text-amber-600', 'text-green-600']
              const total = data.inseguridad_alimentaria.reduce((s, x) => s + x.cantidad, 0)
              return (
                <div key={item.nivel} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 truncate pr-2">{item.nivel}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${textColors[i] ?? 'text-gray-600'}`}>
                        {pct(item.cantidad, total)}%
                      </span>
                      <span className="text-xs text-gray-400 tabular-nums w-16 text-right">
                        {formatNum(item.cantidad)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[i] ?? 'bg-gray-400'} rounded-full transition-all duration-500`}
                      style={{ width: `${pct(item.cantidad, total)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Loading skeleton ─────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────

function DashboardPage() {
  const { data: user, isLoading, isError } = useCurrentUser()
  const isAdmin = !!user?.permissions?.includes('system:config')
  const { data: unifiedDashboard, isLoading: dashboardLoading } = useDashboard(isAdmin)
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate({ to: '/login' }),
    })
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)]">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (isError || !user) {
    if (!isAuthenticated()) {
      navigate({ to: '/login' })
      return null
    }
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)]">
        <p className="text-destructive">Error al cargar el perfil</p>
      </div>
    )
  }

  const isSuperAdmin = dashData ? isSuperAdminDashboard(dashData) : false

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500">
              {user.full_name}
              <span className="mx-1.5 text-gray-300">|</span>
              <span className="text-gray-400">{user.role_name}</span>
              {user.institution_name && (
                <>
                  <span className="mx-1.5 text-gray-300">|</span>
                  <span className="text-gray-400">{user.institution_name}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/queries">
              <Button variant="outline" size="sm">
                <Database className="mr-1.5 h-3.5 w-3.5" />
                Consultas
              </Button>
            </Link>
            <Link to="/queries/new">
              <Button variant="outline" size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Nueva
              </Button>
            </Link>
            {!user.institution_code && (
              <Link to="/beneficiarios">
                <Button size="sm">
                  <Users className="mr-1.5 h-3.5 w-3.5" />
                  Beneficiarios
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              {logout.isPending ? 'Cerrando...' : 'Salir'}
            </Button>
          </div>
        </div>

        {isAdmin ? (
          <AdminDashboard
            stats={unifiedDashboard as AdminDashboardStats | undefined}
            isLoading={dashboardLoading}
          />
        ) : (
          <>
            {user.institution_code && <InstitutionCards />}
            <DashboardWidgets />
          </>
        )}
      </div>
    </div>
  )
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: '/dashboard',
    component: DashboardPage,
    getParentRoute: () => parentRoute,
    beforeLoad: () => {
      if (!isAuthenticated()) {
        throw redirect({ to: '/login' })
      }
    },
  })
