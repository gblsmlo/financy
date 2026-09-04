import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { sessionQueryOptions } from '../features/auth/session'

export const Route = createFileRoute('/_guest')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(sessionQueryOptions)

    if (user) throw redirect({ to: '/' })
  },
  component: () => <Outlet />,
})
