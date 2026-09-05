import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'

import { Button } from '../components/ui/button'

export type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 p-4 text-center">
      <span className="text-lg font-semibold text-brand-dark">Financy</span>
      <h1 className="text-2xl font-semibold text-gray-900">Página não encontrada</h1>
      <p className="text-sm text-gray-500">O endereço que você tentou acessar não existe.</p>
      <Button asChild>
        <Link to="/">Voltar pro início</Link>
      </Button>
    </main>
  )
}
