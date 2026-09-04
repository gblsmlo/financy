import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { Card } from '../../components/ui/card'
import { categoriesQueryOptions } from '../../features/categories/api'
import { transactionsQueryOptions } from '../../features/transactions/api'
import { formatCents } from '../../lib/money'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
})

function isCurrentMonth(isoDate: string): boolean {
  const date = new Date(isoDate)
  const now = new Date()
  return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth()
}

function DashboardPage() {
  const { data: transactions = [] } = useQuery(transactionsQueryOptions)
  const { data: categories = [] } = useQuery(categoriesQueryOptions)

  const saldoTotal = transactions.reduce(
    (total, t) => total + (t.type === 'INCOME' ? t.amountInCents : -t.amountInCents),
    0,
  )

  const receitasDoMes = transactions
    .filter((t) => t.type === 'INCOME' && isCurrentMonth(t.date))
    .reduce((total, t) => total + t.amountInCents, 0)

  const despesasDoMes = transactions
    .filter((t) => t.type === 'EXPENSE' && isCurrentMonth(t.date))
    .reduce((total, t) => total + t.amountInCents, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase text-gray-500">Saldo total</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCents(saldoTotal)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-gray-500">Receitas do mês</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCents(receitasDoMes)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-gray-500">Despesas do mês</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCents(despesasDoMes)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase text-gray-500">
            Transações recentes
          </h2>
          <ul className="flex flex-col divide-y divide-gray-100">
            {transactions.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{t.description}</p>
                  <p className="text-gray-500">{t.category.name}</p>
                </div>
                <span
                  className={
                    t.type === 'INCOME' ? 'font-medium text-success' : 'font-medium text-danger'
                  }
                >
                  {t.type === 'INCOME' ? '+' : '-'} {formatCents(t.amountInCents)}
                </span>
              </li>
            ))}
            {transactions.length === 0 && (
              <li className="py-3 text-sm text-gray-500">Nenhuma transação ainda.</li>
            )}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase text-gray-500">Categorias</h2>
          <ul className="flex flex-col divide-y divide-gray-100">
            {categories.map((category) => (
              <li key={category.id} className="py-3 text-sm font-medium text-gray-900">
                {category.name}
              </li>
            ))}
            {categories.length === 0 && (
              <li className="py-3 text-sm text-gray-500">Nenhuma categoria ainda.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  )
}
