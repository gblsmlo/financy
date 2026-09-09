const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// Sem separador de milhar: o campo é editável, e um ponto que aparece sozinho no
// meio da digitação confunde quem está corrigindo o valor.
const inputFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
})

export function formatCents(amountInCents: number): string {
  return formatter.format(amountInCents / 100)
}

/** Valor pro campo de formulário: mesma vírgula da listagem, sem o "R$". */
export function formatCentsForInput(amountInCents: number): string {
  return inputFormatter.format(amountInCents / 100)
}

/**
 * A vírgula é o separador decimal do formulário, mas quem digita em teclado
 * numérico costuma acertar o ponto. Com vírgula presente, os pontos são milhar;
 * sem ela, o ponto é o próprio decimal.
 */
export function parseAmount(value: string): number {
  const trimmed = value.trim()
  const normalized = trimmed.includes(',') ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed

  return Number.parseFloat(normalized)
}

export function parseAmountToCents(value: string): number {
  return Math.round(parseAmount(value) * 100)
}
