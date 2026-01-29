import { Link } from '@tanstack/react-router'

import { useState } from 'react'
import { Home, LayoutDashboard, LogIn, LogOut, Menu, Users, X } from 'lucide-react'
import { isAuthenticated, useLogout } from '@/hooks/use-auth'
import { useNavigate } from '@tanstack/react-router'

const linkClass =
  'flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2'
const activeLinkClass =
  'flex items-center gap-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors mb-2'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const authed = isAuthenticated()
  const logout = useLogout()
  const navigate = useNavigate()

  return (
    <>
      <header className="p-4 flex items-center bg-gray-800 text-white shadow-lg">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-xl font-semibold tracking-tight">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-blue-400">Ventana</span>
            <span>Magica</span>
          </Link>
        </h1>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">
            <span className="text-blue-400">Ventana</span> Magica
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Cerrar menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={linkClass}
            activeProps={{ className: activeLinkClass }}
          >
            <Home size={20} />
            <span className="font-medium">Inicio</span>
          </Link>

          {authed ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={linkClass}
                activeProps={{ className: activeLinkClass }}
              >
                <LayoutDashboard size={20} />
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link
                to="/beneficiarios"
                onClick={() => setIsOpen(false)}
                className={linkClass}
                activeProps={{ className: activeLinkClass }}
              >
                <Users size={20} />
                <span className="font-medium">Beneficiarios</span>
              </Link>

              <div className="border-t border-gray-700 mt-4 pt-4">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    logout.mutate(undefined, {
                      onSettled: () => navigate({ to: '/login' }),
                    })
                  }}
                  className={`${linkClass} w-full text-left text-red-400 hover:text-red-300`}
                >
                  <LogOut size={20} />
                  <span className="font-medium">Cerrar sesion</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className={linkClass}
              activeProps={{ className: activeLinkClass }}
            >
              <LogIn size={20} />
              <span className="font-medium">Iniciar sesion</span>
            </Link>
          )}
        </nav>
      </aside>
    </>
  )
}
