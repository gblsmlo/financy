import { describe, expect, test } from 'bun:test'

import { isSameMonthAsToday } from './dates'

/** "Hoje" visto pelo usuário. Stub em vez de `Date` real pra não depender do fuso do runner. */
function hoje(year: number, monthIndex: number) {
  return { getFullYear: () => year, getMonth: () => monthIndex }
}

const SETEMBRO = 8

describe('isSameMonthAsToday', () => {
  test('conta a transação quando bate com o mês do calendário do usuário', () => {
    expect(isSameMonthAsToday('2026-09-30T00:00:00.000Z', hoje(2026, SETEMBRO))).toBe(true)
    expect(isSameMonthAsToday('2026-09-01T00:00:00.000Z', hoje(2026, SETEMBRO))).toBe(true)
  })

  test('deixa de fora mês diferente e mesmo mês de outro ano', () => {
    expect(isSameMonthAsToday('2026-10-01T00:00:00.000Z', hoje(2026, SETEMBRO))).toBe(false)
    expect(isSameMonthAsToday('2025-09-15T00:00:00.000Z', hoje(2026, SETEMBRO))).toBe(false)
  })

  // 30/09 às 21:30 em BRT já é 01/10 em UTC. Lendo o "hoje" em UTC, as últimas ~3h de todo mês
  // trocavam os totais do Dashboard pro mês seguinte.
  test('a virada de mês segue o fuso do usuário, não o UTC', () => {
    const ultimaNoiteDeSetembroEmBrt = hoje(2026, SETEMBRO)

    expect(isSameMonthAsToday('2026-09-30T00:00:00.000Z', ultimaNoiteDeSetembroEmBrt)).toBe(true)
    expect(isSameMonthAsToday('2026-10-01T00:00:00.000Z', ultimaNoiteDeSetembroEmBrt)).toBe(false)
  })
})
