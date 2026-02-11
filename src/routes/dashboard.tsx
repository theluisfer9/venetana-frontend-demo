import { createRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { useCurrentUser, useLogout, isAuthenticated } from '@/hooks/use-auth'

import { Button } from '@/components/ui/button'
import { Building2, LogOut, Users } from 'lucide-react'
import DashboardWidgets from '@/components/DashboardWidgets'

import type { AnyRoute } from '@tanstack/react-router'

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
            {user.institution_code && (
              <Link to="/consulta">
                <Button variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Consulta Institucional
                </Button>
              </Link>
            )}
            <Link to="/beneficiarios">
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Consultar Beneficiarios
              </Button>
            </Link>
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
