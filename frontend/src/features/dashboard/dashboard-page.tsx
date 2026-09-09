import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  ChevronRight,
  CircleArrowDown,
  CircleArrowUp,
  type LucideIcon,
  Plus,
  Wallet,
} from 'lucide-react'

import { Card } from '../../components/ui/card'
import { Eyebrow, Section, SectionFooter, SectionHeader } from '../../components/ui/section'
import { isSameMonthAsToday } from '../../lib/dates'
import { formatCents } from '../../lib/money'
import { CategoryBadge, CategoryIconBox } from '../categories/category-visual'
import { useCategoryStats } from '../categories/use-category-stats'
import { transactionsQueryOptions } from '../transactions/api'
import { TransactionFormDialog } from '../transactions/transaction-form-dialog'

function StatCard({
  icon: Icon,
  iconClassName,
  label,
  value,
}: {
  icon: LucideIcon
  iconClassName: string
  label: string
  value: string
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex h-5 items-center gap-3">
        <Icon className={`size-5 shrink-0 ${iconClassName}`} />
        <Eyebrow>{label}</Eyebrow>
      </div>
      <p className="text-[28px]/8 font-bold text-gray-800">{value}</p>
    </Card>
  )
}

export function DashboardPage() {
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <StatCard
        icon={Wallet}
        iconClassName="text-purple-600"
        label="Saldo total"
        value={formatCents(saldoTotal)}
      />
      <StatCard
        icon={CircleArrowUp}
        iconClassName="text-green-600"
        label="Receitas do mês"
        value={formatCents(receitasDoMes)}
      />
      <StatCard
        icon={CircleArrowDown}
        iconClassName="text-red-600"
        label="Despesas do mês"
        value={formatCents(despesasDoMes)}
      />

      <Section className="flex flex-col lg:col-span-2">
        <SectionHeader>
          <Eyebrow>Transações recentes</Eyebrow>
          <Link
            to="/transacoes"
            className="flex items-center gap-1 px-3 text-sm/5 font-medium text-brand-base hover:underline"
          >
            Ver todas <ChevronRight className="size-4" />
          </Link>
        </SectionHeader>

        <ul className="flex flex-1 flex-col divide-y divide-gray-200">
          {recent.map((t) => (
            <li key={t.id} className="flex h-20 items-center gap-4 px-6">
              <CategoryIconBox category={t.category} />

              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-base/6 font-medium text-gray-800">{t.description}</p>
                <p className="text-sm/5 text-gray-500">
                  {new Date(t.date).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC',
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })}
                </p>
              </div>

              <div className="w-40 shrink-0">
                <CategoryBadge category={t.category} />
              </div>

              <div className="flex w-40 shrink-0 items-center justify-end gap-2">
                <span className="text-base/6 font-medium text-gray-800">
                  {t.type === 'INCOME' ? '+' : '-'} {formatCents(t.amountInCents)}
                </span>
                {t.type === 'INCOME' ? (
                  <CircleArrowUp className="size-4 shrink-0 text-green-600" />
                ) : (
                  <CircleArrowDown className="size-4 shrink-0 text-red-600" />
                )}
              </div>
            </li>
          ))}
          {recent.length === 0 && (
            <li className="flex h-20 items-center px-6 text-sm/5 text-gray-500">
              Nenhuma transação ainda.
            </li>
          )}
        </ul>

        <SectionFooter className="justify-center">
          <TransactionFormDialog
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 text-base/6 font-medium text-brand-base hover:underline"
              >
                <Plus className="size-4" /> Nova transação
              </button>
            }
          />
        </SectionFooter>
      </Section>

      <Section>
        <SectionHeader>
          <Eyebrow>Categorias</Eyebrow>
          <Link
            to="/categorias"
            className="flex items-center gap-1 px-3 text-sm/5 font-medium text-brand-base hover:underline"
          >
            Gerenciar <ChevronRight className="size-4" />
          </Link>
        </SectionHeader>

        <ul className="flex flex-col py-2">
          {topCategories.map(({ category, itemCount, totalInCents }) => (
            <li key={category.id} className="flex h-12 items-center gap-3 px-6">
              <CategoryBadge category={category} />
              <span className="flex-1 text-right text-sm/5 text-gray-500">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </span>
              <span className="text-base/6 font-medium text-gray-800">
                {formatCents(totalInCents)}
              </span>
            </li>
          ))}
          {topCategories.length === 0 && (
            <li className="flex h-12 items-center px-6 text-sm/5 text-gray-500">
              Nenhuma categoria ainda.
            </li>
          )}
        </ul>
      </Section>
    </div>
  )
}
