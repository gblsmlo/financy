import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Link, Outlet, useRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Button } from '../components/ui/button'

export type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  errorComponent: ErrorPage,
  notFoundComponent: NotFound,
})

function Message({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 p-4 text-center">
      <span className="text-lg font-semibold text-brand-dark">Financy</span>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="max-w-sm text-sm text-gray-500">{description}</p>
      {action}
    </main>
  )
}

function NotFound() {
  return (
    <Message
      title="Página não encontrada"
      description="O endereço que você tentou acessar não existe."
      action={
        <Button asChild>
          <Link to="/">Voltar pro início</Link>
        </Button>
      }
    />
  )
}

// Cobre o caso mais comum aqui: back-end fora do ar durante o `beforeLoad` de uma rota protegida.
// Sem isso, o TanStack Router mostra a própria tela sem estilo, com a mensagem crua em inglês.
function ErrorPage() {
  const router = useRouter()

  return (
    <Message
      title="Algo deu errado"
      description="Não foi possível carregar esta página. Verifique sua conexão e tente de novo."
      action={<Button onClick={() => router.invalidate()}>Tentar de novo</Button>}
    />
  )
}
