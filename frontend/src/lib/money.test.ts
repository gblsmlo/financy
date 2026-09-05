import { describe, expect, test } from 'bun:test'

import { formatCents } from './money'

//   é o espaço não-quebrável que o Intl insere depois do símbolo em pt-BR.
describe('formatCents', () => {
  test('formata centavos como moeda brasileira', () => {
    expect(formatCents(5000)).toBe('R$ 50,00')
    expect(formatCents(1)).toBe('R$ 0,01')
    expect(formatCents(123_456)).toBe('R$ 1.234,56')
  })

  test('formata zero e saldo negativo', () => {
    expect(formatCents(0)).toBe('R$ 0,00')
    expect(formatCents(-2500)).toBe('-R$ 25,00')
  })
})
