import { createFileRoute } from '@tanstack/react-router'

import { LoginPage } from '../../features/auth/login-page'

// A tela de login vive na raiz; `/login` continua respondendo porque é o endereço
// que as pessoas guardam e o que a versão anterior do app usava.
export const Route = createFileRoute('/_guest/login')({
  component: LoginPage,
})
