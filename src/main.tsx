import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import TanStackQueryDemo from './routes/demo/tanstack-query.tsx'
import LoginRoute from './routes/login.tsx'
import DashboardRoute from './routes/dashboard.tsx'
import BeneficiariosRoute from './routes/beneficiarios.tsx'
import ConsultaRoute from './routes/consulta.tsx'
import QueriesRoute from './routes/queries.tsx'
import QueryBuilderRoute from './routes/query-builder.tsx'
import UsersRoute from './routes/users.tsx'
import RolesRoute from './routes/roles.tsx'
import InstitutionsRoute from './routes/institutions.tsx'
import DataSourcesRoute from './routes/datasources.tsx'

import Header from './components/Header'

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

import { Toaster } from 'sonner'
import App from './App.tsx'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
      <TanStackRouterDevtools />
    </>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  TanStackQueryDemo(rootRoute),
  LoginRoute(rootRoute),
  DashboardRoute(rootRoute),
  BeneficiariosRoute(rootRoute),
  ConsultaRoute(rootRoute),
  QueriesRoute(rootRoute),
  QueryBuilderRoute(rootRoute),
  UsersRoute(rootRoute),
  RolesRoute(rootRoute),
  InstitutionsRoute(rootRoute),
  DataSourcesRoute(rootRoute),
])

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <RouterProvider router={router} />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
