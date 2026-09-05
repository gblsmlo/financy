/** O que a comparação precisa saber sobre "hoje": só o mês do calendário de quem está olhando. */
type CalendarMonth = Pick<Date, 'getFullYear' | 'getMonth'>

/**
 * Transação é gravada como meia-noite UTC do dia escolhido no `<input type="date">` — o instante
 * não significa nada, o que vale é a data do calendário. Por isso o lado da transação é lido em
 * UTC e o "hoje" no fuso do usuário: comparar os dois em UTC faz as últimas horas de cada mês em
 * fuso negativo (30/09 21:00 em BRT já é 01/10 em UTC) caírem no mês seguinte.
 */
export function isSameMonthAsToday(isoDate: string, today: CalendarMonth = new Date()): boolean {
  const date = new Date(isoDate)

  return date.getUTCFullYear() === today.getFullYear() && date.getUTCMonth() === today.getMonth()
}
