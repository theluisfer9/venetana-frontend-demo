import { createRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { useCurrentUser, useLogout, isAuthenticated } from '@/hooks/use-auth'
import { useInstitutionPreset, useConsultaDashboard } from '@/hooks/use-consulta'
import { useDashboard } from '@/hooks/use-dashboard'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LogOut, Users, Database, Plus } from 'lucide-react'
import AdminDashboard from '@/components/AdminDashboard'
import InstitutionalDashboard from '@/components/InstitutionalDashboard'
import type { AdminDashboardStats } from '@/lib/dashboard-types'

import type { AnyRoute } from '@tanstack/react-router'

// ── Helpers ──────────────────────────────────────────────────────────

function formatNum(n: number | undefined | null): string {
  return (n ?? 0).toLocaleString('es-GT')
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

// ── Main Page ────────────────────────────────────────────────────────

function DashboardPage() {
  const { data: user, isLoading, isError } = useCurrentUser()
  const isAdmin = !!user?.permissions?.includes('system:config')
  const { data: adminDashboard, isLoading: adminLoading } = useDashboard(undefined, isAdmin)
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate({ to: '/login' }),
    })
  }

  if (isLoading) {
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
            stats={adminDashboard as AdminDashboardStats | undefined}
            isLoading={adminLoading}
          />
        ) : (
          <>
            {user.institution_code && <InstitutionCards />}
            <InstitutionalDashboard />
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
