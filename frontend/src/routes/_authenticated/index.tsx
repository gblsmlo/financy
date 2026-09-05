import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, Plus, Wallet } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { useCategoryStats } from '../../features/categories/use-category-stats'
import { categoryColorClasses } from '../../features/categories/visuals'
import { transactionsQueryOptions } from '../../features/transactions/api'
import { TransactionFormDialog } from '../../features/transactions/transaction-form-dialog'
import { isSameMonthAsToday } from '../../lib/dates'
import { formatCents } from '../../lib/money'
import { cn } from '../../lib/utils'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: transactions = [] } = useQuery(transactionsQueryOptions)
  const { stats } = useCategoryStats()

  const saldoTotal = transactions.reduce(
    (total, t) => total + (t.type === 'INCOME' ? t.amountInCents : -t.amountInCents),
    0,
  )

  const receitasDoMes = transactions
    .filter((t) => t.type === 'INCOME' && isSameMonthAsToday(t.date))
    .reduce((total, t) => total + t.amountInCents, 0)

  const despesasDoMes = transactions
    .filter((t) => t.type === 'EXPENSE' && isSameMonthAsToday(t.date))
    .reduce((total, t) => total + t.amountInCents, 0)

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const topCategories = [...stats].sort((a, b) => b.itemCount - a.itemCount).slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-gray-500">
            <Wallet className="size-3.5" /> Saldo total
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCents(saldoTotal)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-gray-500">Receitas do mês</p>
          <p className="mt-1 text-2xl font-semibold text-success">{formatCents(receitasDoMes)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-gray-500">Despesas do mês</p>
          <p className="mt-1 text-2xl font-semibold text-danger">{formatCents(despesasDoMes)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-gray-500">Transações recentes</h2>
            <Link
              to="/transacoes"
              className="flex items-center text-sm font-medium text-brand-base hover:underline"
            >
              Ver todas <ChevronRight className="size-4" />
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-gray-100">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{t.description}</p>
                  <p className="text-gray-500">{t.category.name}</p>
                </div>
                <span
                  className={cn(
                    'font-medium',
                    t.type === 'INCOME' ? 'text-success' : 'text-danger',
                  )}
                >
                  {t.type === 'INCOME' ? '+' : '-'} {formatCents(t.amountInCents)}
                </span>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="py-3 text-sm text-gray-500">Nenhuma transação ainda.</li>
            )}
          </ul>
          <TransactionFormDialog
            trigger={
              <Button variant="ghost" size="sm" className="mt-2 justify-start px-0">
                <Plus className="size-4" /> Nova transação
              </Button>
            }
          />
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-gray-500">Categorias</h2>
            <Link
              to="/categorias"
              className="flex items-center text-sm font-medium text-brand-base hover:underline"
            >
              Gerenciar <ChevronRight className="size-4" />
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-gray-100">
            {topCategories.map(({ category, itemCount, totalInCents }) => (
              <li key={category.id} className="flex items-center justify-between py-3 text-sm">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    categoryColorClasses[category.color].bg,
                    categoryColorClasses[category.color].text,
                  )}
                >
                  {category.name}
                </span>
                <span className="text-gray-500">
                  {itemCount} {itemCount === 1 ? 'item' : 'itens'} · {formatCents(totalInCents)}
                </span>
              </li>
            ))}
            {topCategories.length === 0 && (
              <li className="py-3 text-sm text-gray-500">Nenhuma categoria ainda.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  )
}
