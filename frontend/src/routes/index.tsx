import { createFileRoute } from '@tanstack/react-router'

import { AppShell } from '../components/app-shell'
import { LoginPage } from '../features/auth/login-page'
import { sessionQueryOptions, useSession } from '../features/auth/session'
import { DashboardPage } from '../features/dashboard/dashboard-page'

// O enunciado pede a raiz servindo as duas telas, então ela não pode viver sob
// `_guest` nem sob `_authenticated`: resolve a sessão antes de renderizar e
// escolhe a tela, em vez de redirecionar pra `/login`.
export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionQueryOptions),
  component: RootPage,
})

function RootPage() {
  const { user } = useSession()

  if (!user) return <LoginPage />

  return (
    <AppShell>
      <DashboardPage />
    </AppShell>
  )
}
