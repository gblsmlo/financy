import { describe, expect, test } from 'bun:test'
import { ClientError } from 'graphql-request'

import { apiErrorCode, apiErrorMessage } from './api-error'

type ClientErrorArgs = ConstructorParameters<typeof ClientError>

function clientError(message: string, code?: string) {
  const response = { errors: [{ message, extensions: code ? { code } : {} }], status: 200 }

  return new ClientError(response as unknown as ClientErrorArgs[0], { query: 'query Q { q }' })
}

describe('apiErrorMessage', () => {
  test('devolve só a mensagem, sem o payload que o ClientError concatena', () => {
    const error = clientError('Categoria não encontrada.')

    expect(error.message).toContain('{')
    expect(apiErrorMessage(error, 'Erro ao salvar.')).toBe('Categoria não encontrada.')
  })

  test('cai no fallback pra erro que não é da API', () => {
    expect(apiErrorMessage(new TypeError('fetch failed'), 'Erro ao salvar.')).toBe(
      'Erro ao salvar.',
    )
    expect(apiErrorMessage(undefined, 'Erro ao salvar.')).toBe('Erro ao salvar.')
  })
})

describe('apiErrorCode', () => {
  test('lê o código da extensão quando existe', () => {
    expect(apiErrorCode(clientError('boom', 'CONFLICT'))).toBe('CONFLICT')
  })

  test('devolve undefined sem código ou sem ser erro da API', () => {
    expect(apiErrorCode(clientError('boom'))).toBeUndefined()
    expect(apiErrorCode(new Error('boom'))).toBeUndefined()
  })
})
