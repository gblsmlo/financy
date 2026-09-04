const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatCents(amountInCents: number): string {
  return formatter.format(amountInCents / 100)
}
