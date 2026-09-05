import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { ClientError } from 'graphql-request'

const request = mock()
const setAuthHeader = mock()
const clearAuthHeader = mock()
const setToken = mock()
const clearToken = mock()

mock.module('../../lib/graphql-client', () => ({
  graphqlClient: { request },
  setAuthHeader,
  clearAuthHeader,
}))

mock.module('../../lib/auth-token', () => ({
  getToken: () => null,
  setToken,
  clearToken,
}))

const { fetchSession, login, logout } = await import('./api')

type ClientErrorArgs = ConstructorParameters<typeof ClientError>

// O tipo da resposta do graphql-request descreve o payload GraphQL inteiro; o código sob teste
// só lê `errors[0].extensions.code`, então o resto não precisa ser montado.
function clientError(code: string) {
  const response = { errors: [{ message: 'boom', extensions: { code } }], status: 200 }

  return new ClientError(response as unknown as ClientErrorArgs[0], { query: '' })
}

beforeEach(() => {
  for (const fn of [request, setAuthHeader, clearAuthHeader, setToken, clearToken]) {
    fn.mockReset()
  }
})

describe('fetchSession', () => {
  test('devolve o usuário quando há sessão', async () => {
    request.mockResolvedValueOnce({ me: { id: 'u1', name: 'Ana', email: 'ana@x.com' } })

    expect(await fetchSession()).toEqual({ id: 'u1', name: 'Ana', email: 'ana@x.com' })
  })

  test('trata UNAUTHENTICATED como "sem sessão", não como erro', async () => {
    request.mockRejectedValueOnce(clientError('UNAUTHENTICATED'))

    expect(await fetchSession()).toBeNull()
  })

  // Só o UNAUTHENTICATED vira `null`: engolir os outros faria uma rota protegida abrir vazia
  // quando o back-end está fora do ar, em vez de estourar pro error boundary.
  test('propaga qualquer outro erro da API', async () => {
    request.mockRejectedValueOnce(clientError('INTERNAL_SERVER_ERROR'))

    await expect(fetchSession()).rejects.toBeInstanceOf(ClientError)
  })
})

describe('login', () => {
  test('persiste o token e passa a mandá-lo nas próximas requisições', async () => {
    request.mockResolvedValueOnce({
      login: { token: 'tok-123', user: { id: 'u1', name: 'Ana', email: 'ana@x.com' } },
    })

    const user = await login({ email: 'ana@x.com', password: 'senha12345' })

    expect(user).toEqual({ id: 'u1', name: 'Ana', email: 'ana@x.com' })
    expect(setToken).toHaveBeenCalledWith('tok-123')
    expect(setAuthHeader).toHaveBeenCalledWith('tok-123')
  })
})

describe('logout', () => {
  test('limpa a sessão local mesmo se a mutation falhar', async () => {
    request.mockRejectedValueOnce(clientError('INTERNAL_SERVER_ERROR'))

    await expect(logout()).rejects.toBeInstanceOf(ClientError)
    expect(clearToken).toHaveBeenCalled()
    expect(clearAuthHeader).toHaveBeenCalled()
  })
})
