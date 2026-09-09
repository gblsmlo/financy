import { describe, expect, test } from 'bun:test'

import { formatCents, formatCentsForInput, parseAmount, parseAmountToCents } from './money'

//   é o espaço não-quebrável que o Intl insere depois do símbolo em pt-BR.
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

describe('formatCentsForInput', () => {
  test('usa a vírgula da listagem, sem símbolo', () => {
    expect(formatCentsForInput(4590)).toBe('45,90')
    expect(formatCentsForInput(0)).toBe('0,00')
  })

  test('não insere separador de milhar', () => {
    expect(formatCentsForInput(123_456)).toBe('1234,56')
  })
})

describe('parseAmount', () => {
  test('lê a vírgula como decimal', () => {
    expect(parseAmount('45,90')).toBe(45.9)
  })

  test('lê o ponto como decimal quando não há vírgula', () => {
    expect(parseAmount('45.90')).toBe(45.9)
  })

  test('trata o ponto como milhar quando há vírgula', () => {
    expect(parseAmount('1.234,56')).toBe(1234.56)
  })

  test('devolve NaN pro que não é número', () => {
    expect(parseAmount('abc')).toBeNaN()
    expect(parseAmount('')).toBeNaN()
  })
})

describe('parseAmountToCents', () => {
  test('arredonda pro centavo', () => {
    expect(parseAmountToCents('45,90')).toBe(4590)
    expect(parseAmountToCents('0,015')).toBe(2)
  })

  // 19,99 * 100 dá 1998.9999999999998 em ponto flutuante.
  test('não perde um centavo no binário', () => {
    expect(parseAmountToCents('19,99')).toBe(1999)
  })
})
