import { Link } from '@tanstack/react-router'
import { isAuthenticated } from '@/hooks/use-auth'

function App() {
  const authed = isAuthenticated()

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-72px)] bg-muted/40 p-4">
      <div className="text-center max-w-lg space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-blue-600">Ventana</span> Magica
        </h1>
        <p className="text-muted-foreground text-lg">
          Sistema de gestion de beneficiarios
        </p>
        <div className="flex gap-4 justify-center">
          {authed ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Ir al Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Iniciar sesion
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
