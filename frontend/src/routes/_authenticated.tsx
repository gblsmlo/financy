import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AppShell } from '../components/app-shell'
import { sessionQueryOptions } from '../features/auth/session'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(sessionQueryOptions)

    // A raiz é a tela de login de quem está deslogado.
    if (!user) throw redirect({ to: '/' })

    return { user }
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
})
