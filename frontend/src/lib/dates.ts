/** O que as comparações precisam saber sobre "hoje": só a data do calendário de quem está olhando. */
type CalendarDate = Pick<Date, 'getFullYear' | 'getMonth' | 'getDate'>

export const transactionPeriods = ['ALL', 'THIS_MONTH', 'LAST_30_DAYS', 'THIS_YEAR'] as const

export type TransactionPeriod = (typeof transactionPeriods)[number]

export const transactionPeriodLabels: Record<TransactionPeriod, string> = {
  ALL: 'Todo o período',
  THIS_MONTH: 'Este mês',
  LAST_30_DAYS: 'Últimos 30 dias',
  THIS_YEAR: 'Este ano',
}

const DAY_IN_MS = 86_400_000
const LAST_30_DAYS_WINDOW = 30

/**
 * Transação é gravada como meia-noite UTC do dia escolhido no `<input type="date">` — o instante
 * não significa nada, o que vale é a data do calendário. Por isso o lado da transação é lido em
 * UTC e o "hoje" no fuso do usuário: comparar os dois em UTC faz as últimas horas de cada mês em
 * fuso negativo (30/09 21:00 em BRT já é 01/10 em UTC) caírem no mês seguinte.
 */
export function isSameMonthAsToday(isoDate: string, today: CalendarDate = new Date()): boolean {
  const date = new Date(isoDate)

  return date.getUTCFullYear() === today.getFullYear() && date.getUTCMonth() === today.getMonth()
}

/** Ambos os lados viram meia-noite UTC do seu próprio calendário, pra subtração render dias inteiros. */
function daysBetween(isoDate: string, today: CalendarDate): number {
  const date = new Date(isoDate)
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())

  return (todayDay - day) / DAY_IN_MS
}

export function isWithinPeriod(
  isoDate: string,
  period: TransactionPeriod,
  today: CalendarDate = new Date(),
): boolean {
  switch (period) {
    case 'ALL':
      return true
    case 'THIS_MONTH':
      return isSameMonthAsToday(isoDate, today)
    case 'THIS_YEAR':
      return new Date(isoDate).getUTCFullYear() === today.getFullYear()
    case 'LAST_30_DAYS': {
      // Janela fechada nos dois lados: hoje conta, e data futura fica de fora — o rótulo diz
      // "últimos", então uma despesa agendada pra semana que vem não pertence a ele.
      const days = daysBetween(isoDate, today)

      return days >= 0 && days < LAST_30_DAYS_WINDOW
    }
  }
}
