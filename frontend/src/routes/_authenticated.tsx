import { createFileRoute, Link, Outlet, redirect, useRouterState } from '@tanstack/react-router'

import { Logo } from '../components/logo'
import { sessionQueryOptions, useSession } from '../features/auth/session'
import { cn } from '../lib/utils'

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
  const { user } = useSession()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        {/* Três colunas em vez de space-between: no Figma a navegação fica no centro exato
            da faixa, não no meio do espaço que sobra entre a logo e o avatar. */}
        <div className="mx-auto grid h-[68px] max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-12">
          <Link to="/" className="justify-self-start">
            <Logo />
          </Link>

          <nav className="flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'text-sm/5',
                  pathname === link.to
                    ? 'font-semibold text-brand-base'
                    : 'text-gray-600 hover:text-gray-800',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/perfil"
            aria-label="Perfil"
            className="flex size-9 items-center justify-center justify-self-end rounded-full bg-gray-300 text-sm/5 font-medium text-gray-800"
          >
            {user?.name.slice(0, 2).toUpperCase()}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1280px] flex-col gap-8 px-12 py-12">
        <Outlet />
      </main>
    </div>
  )
}
