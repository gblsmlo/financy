/**
 * O better-auth carrega o próprio catálogo de mensagens, em inglês, e `APIError`
 * chega aqui já com esse texto pronto. Traduzir pelo `code` é o único ponto em
 * que dá pra interceptar sem reescrever a mensagem que o usuário lê na tela.
 */
const messagesByCode: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'E-mail ou senha incorretos.',
  INVALID_EMAIL: 'E-mail inválido.',
  INVALID_PASSWORD: 'Senha incorreta.',
  USER_NOT_FOUND: 'Usuário não encontrado.',
  USER_ALREADY_EXISTS: 'Esse e-mail já está cadastrado.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Esse e-mail já está cadastrado.',
  CREDENTIAL_ACCOUNT_NOT_FOUND: 'Essa conta não usa e-mail e senha.',
  PASSWORD_TOO_SHORT: 'A senha é curta demais.',
  PASSWORD_TOO_LONG: 'A senha é longa demais.',
  EMAIL_NOT_VERIFIED: 'Confirme seu e-mail antes de entrar.',
  SESSION_EXPIRED: 'Sua sessão expirou. Entre de novo.',
  FAILED_TO_CREATE_USER: 'Não foi possível criar a conta.',
  FAILED_TO_CREATE_SESSION: 'Não foi possível iniciar a sessão.',
  FAILED_TO_UPDATE_USER: 'Não foi possível salvar as alterações.',
}

export function authErrorMessage(code: unknown, fallback: string): string {
  if (typeof code !== 'string') return fallback

  return messagesByCode[code] ?? fallback
}
