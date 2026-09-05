import { ClientError } from 'graphql-request'

/**
 * `ClientError.message` é `"<mensagem>: {…json da resposta e da request…}"` — mostrar isso na
 * tela vaza o payload inteiro pro usuário. A mensagem legível só existe dentro de `response`.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ClientError)) return fallback

  return error.response.errors?.[0]?.message ?? fallback
}

export function apiErrorCode(error: unknown): string | undefined {
  if (!(error instanceof ClientError)) return undefined

  const code = error.response.errors?.[0]?.extensions?.code

  return typeof code === 'string' ? code : undefined
}
