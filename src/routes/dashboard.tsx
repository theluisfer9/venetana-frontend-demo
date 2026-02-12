import { createRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { useCurrentUser, useLogout, isAuthenticated } from '@/hooks/use-auth'
import { useInstitutionPreset, useConsultaDashboard } from '@/hooks/use-consulta'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LogOut, Users, ChevronRight } from 'lucide-react'
import DashboardWidgets from '@/components/DashboardWidgets'

import type { AnyRoute } from '@tanstack/react-router'

function InstitutionCards() {
  const navigate = useNavigate()
  const { data: preset, isLoading: presetLoading } = useInstitutionPreset()
  const { data: dashboard, isLoading: dashLoading } = useConsultaDashboard()

  if (presetLoading || dashLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Consultas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!preset || !dashboard) return null

  const countMap = new Map(
    (dashboard.por_intervencion ?? []).map((item) => [item.intervencion, item.cantidad])
  )

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{preset.name}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {preset.intervention_columns.map((col) => {
          const label = preset.labels[col] || col
          const count = countMap.get(label) ?? 0

          return (
            <Card
              key={col}
              className="cursor-pointer transition-shadow hover:shadow-md hover:border-blue-300"
              onClick={() =>
                navigate({ to: '/consulta', search: { intervencion: col } })
              }
            >
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {count.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">hogares</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function DashboardPage() {
  const { data: user, isLoading, isError } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        navigate({ to: '/login' })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)]">
        <p className="text-muted-foreground">Cargando perfil...</p>
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
    <div className="min-h-[calc(100vh-72px)] bg-muted/40 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header con info de usuario */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">
              Bienvenido, {user.full_name} &mdash; {user.role_name}
              {user.institution_name && ` / ${user.institution_name}`}
            </p>
          </div>
          <div className="flex gap-2">
            {!user.institution_code && (
              <Link to="/beneficiarios">
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Consultar Beneficiarios
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logout.isPending ? 'Cerrando...' : 'Salir'}
            </Button>
          </div>
        </div>

        {/* Institutional intervention cards */}
        {user.institution_code && <InstitutionCards />}

        {/* Dashboard widgets */}
        <DashboardWidgets />
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
