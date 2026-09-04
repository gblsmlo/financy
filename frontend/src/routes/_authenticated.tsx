import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'

import { logout } from '../features/auth/api'
import { sessionQueryOptions } from '../features/auth/session'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(sessionQueryOptions)

    if (!user) throw redirect({ to: '/login' })

    return { user }
  },
  component: AuthenticatedLayout,
})

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/transacoes', label: 'Transações' },
  { to: '/categorias', label: 'Categorias' },
] as const

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, null)
      navigate({ to: '/login' })
    },
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold text-brand-dark">Financy</span>

          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={pathname === link.to ? 'text-brand-base' : 'hover:text-gray-900'}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/perfil" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Perfil
            </Link>
            <button
              type="button"
              onClick={() => mutation.mutate()}
              className="text-sm font-medium text-gray-600 hover:text-danger"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </div>
    </div>
  )
}
