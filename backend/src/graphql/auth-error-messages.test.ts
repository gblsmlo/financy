import { describe, expect, test } from 'bun:test'

import { authErrorMessage } from './auth-error-messages'

describe('authErrorMessage', () => {
  test('traduz o código de credencial inválida', () => {
    expect(authErrorMessage('INVALID_EMAIL_OR_PASSWORD', 'fallback')).toBe(
      'E-mail ou senha incorretos.',
    )
  })

  test('cai no fallback pro código que não está no catálogo', () => {
    expect(authErrorMessage('SOMETHING_ELSE', 'fallback')).toBe('fallback')
  })

  // `APIError` pode chegar sem `body.code`, e aí o resolver passa o status HTTP.
  test('cai no fallback quando o código não é string', () => {
    expect(authErrorMessage(401, 'fallback')).toBe('fallback')
    expect(authErrorMessage(undefined, 'fallback')).toBe('fallback')
  })
})
