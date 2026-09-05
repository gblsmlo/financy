import { describe, expect, test } from 'bun:test'

import { isSameMonthAsToday, isWithinPeriod } from './dates'

/** "Hoje" visto pelo usuário. Stub em vez de `Date` real pra não depender do fuso do runner. */
function hoje(year: number, monthIndex: number, day = 15) {
  return { getFullYear: () => year, getMonth: () => monthIndex, getDate: () => day }
}

/** Transação como o back-end grava: meia-noite UTC do dia escolhido. */
function transacaoEm(isoDay: string) {
  return `${isoDay}T00:00:00.000Z`
}

const SETEMBRO = 8
const OUTUBRO = 9

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

describe('isWithinPeriod', () => {
  const dezDeOutubro = hoje(2026, OUTUBRO, 10)

  test('ALL não filtra nada', () => {
    expect(isWithinPeriod(transacaoEm('2019-01-01'), 'ALL', dezDeOutubro)).toBe(true)
    expect(isWithinPeriod(transacaoEm('2030-01-01'), 'ALL', dezDeOutubro)).toBe(true)
  })

  test('THIS_MONTH pega o mês do calendário do usuário', () => {
    expect(isWithinPeriod(transacaoEm('2026-10-01'), 'THIS_MONTH', dezDeOutubro)).toBe(true)
    expect(isWithinPeriod(transacaoEm('2026-09-30'), 'THIS_MONTH', dezDeOutubro)).toBe(false)
  })

  test('THIS_YEAR ignora o mês mas não o ano', () => {
    expect(isWithinPeriod(transacaoEm('2026-01-01'), 'THIS_YEAR', dezDeOutubro)).toBe(true)
    expect(isWithinPeriod(transacaoEm('2026-12-31'), 'THIS_YEAR', dezDeOutubro)).toBe(true)
    expect(isWithinPeriod(transacaoEm('2025-12-31'), 'THIS_YEAR', dezDeOutubro)).toBe(false)
  })

  describe('LAST_30_DAYS', () => {
    const dentro = (isoDay: string) =>
      isWithinPeriod(transacaoEm(isoDay), 'LAST_30_DAYS', dezDeOutubro)

    test('inclui hoje e o 30º dia, exclui o 31º', () => {
      expect(dentro('2026-10-10')).toBe(true) // hoje
      expect(dentro('2026-09-11')).toBe(true) // 29 dias atrás
      expect(dentro('2026-09-10')).toBe(false) // 30 dias atrás, fora da janela
    })

    test('atravessa a virada de mês', () => {
      expect(dentro('2026-09-30')).toBe(true)
    })

    // "Últimos" é passado: despesa agendada pra frente não pertence à janela.
    test('exclui data futura', () => {
      expect(dentro('2026-10-11')).toBe(false)
    })
  })
})
