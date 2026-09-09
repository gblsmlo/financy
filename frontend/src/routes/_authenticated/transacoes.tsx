import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  CircleArrowDown,
  CircleArrowUp,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useId, useMemo, useState } from 'react'

import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Section, SectionFooter } from '../../components/ui/section'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { categoriesQueryOptions } from '../../features/categories/api'
import { CategoryBadge, CategoryIconBox } from '../../features/categories/category-visual'
import { deleteTransaction, transactionsQueryOptions } from '../../features/transactions/api'
import { TransactionFormDialog } from '../../features/transactions/transaction-form-dialog'
import { apiErrorMessage } from '../../lib/api-error'
import {
  isWithinPeriod,
  type TransactionPeriod,
  transactionPeriodLabels,
  transactionPeriods,
} from '../../lib/dates'
import { formatCents } from '../../lib/money'
import { cn } from '../../lib/utils'

export const Route = createFileRoute('/_authenticated/transacoes')({
  component: TransacoesPage,
})

const PAGE_SIZE = 10

const columnClassName = {
  description: 'flex-1 min-w-0',
  date: 'w-20 shrink-0',
  category: 'w-36 shrink-0',
  type: 'w-24 shrink-0',
  amount: 'w-32 shrink-0 text-right',
  actions: 'w-20 shrink-0 text-right',
} as const

function TransacoesPage() {
  const { data: transactions = [], isLoading } = useQuery(transactionsQueryOptions)
  const { data: categories = [] } = useQuery(categoriesQueryOptions)
  const queryClient = useQueryClient()
  const searchId = useId()
  const typeId = useId()
  const categorySelectId = useId()
  const periodId = useId()

  const [search, setSearch] = useState('')
  const [type, setType] = useState('ALL')
  const [categoryId, setCategoryId] = useState('ALL')
  const [period, setPeriod] = useState<TransactionPeriod>('ALL')
  const [page, setPage] = useState(1)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      setDeleteError(null)
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (error) => {
      setDeleteError(apiErrorMessage(error, 'Erro ao apagar.'))
    },
  })

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
      if (type !== 'ALL' && t.type !== type) return false
      if (categoryId !== 'ALL' && t.category.id !== categoryId) return false
      if (!isWithinPeriod(t.date, period)) return false
      return true
    })
  }, [transactions, search, type, categoryId, period])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <>
      <PageHeader
        title="Transações"
        description="Gerencie todas as suas transações financeiras"
        action={
          <TransactionFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Nova transação
              </Button>
            }
          />
        }
      />

      {deleteError && <p className="text-sm/5 text-danger">{deleteError}</p>}

      <Card className="grid grid-cols-1 gap-4 px-6 pb-6 pt-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field>
          <Label htmlFor={searchId}>Buscar</Label>
          <Input
            id={searchId}
            icon={Search}
            placeholder="Buscar por descrição"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </Field>

        <Field>
          <Label htmlFor={typeId}>Tipo</Label>
          <Select
            value={type}
            onValueChange={(value) => {
              setType(value)
              setPage(1)
            }}
          >
            <SelectTrigger id={typeId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="INCOME">Entrada</SelectItem>
              <SelectItem value="EXPENSE">Saída</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <Label htmlFor={categorySelectId}>Categoria</Label>
          <Select
            value={categoryId}
            onValueChange={(value) => {
              setCategoryId(value)
              setPage(1)
            }}
          >
            <SelectTrigger id={categorySelectId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <Label htmlFor={periodId}>Período</Label>
          <Select
            value={period}
            onValueChange={(value) => {
              setPeriod(value as TransactionPeriod)
              setPage(1)
            }}
          >
            <SelectTrigger id={periodId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {transactionPeriods.map((option) => (
                <SelectItem key={option} value={option}>
                  {transactionPeriodLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Card>

      <Section>
        <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-5 text-xs/4 font-medium uppercase tracking-[0.6px] text-gray-500">
          <span className={columnClassName.description}>Descrição</span>
          <span className={columnClassName.date}>Data</span>
          <span className={columnClassName.category}>Categoria</span>
          <span className={columnClassName.type}>Tipo</span>
          <span className={columnClassName.amount}>Valor</span>
          <span className={columnClassName.actions}>Ações</span>
        </div>

        <ul className="flex flex-col divide-y divide-gray-200">
          {isLoading && (
            <li className="px-6 py-6 text-center text-sm/5 text-gray-500">Carregando…</li>
          )}

          {!isLoading &&
            paginated.map((t) => (
              <li key={t.id} className="flex h-18 items-center gap-4 px-6">
                <div className={cn('flex items-center gap-4', columnClassName.description)}>
                  <CategoryIconBox category={t.category} />
                  <p className="truncate text-base/6 font-medium text-gray-800">{t.description}</p>
                </div>

                <span className={cn('text-sm/5 text-gray-500', columnClassName.date)}>
                  {new Date(t.date).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC',
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })}
                </span>

                <span className={columnClassName.category}>
                  <CategoryBadge category={t.category} />
                </span>

                <span
                  className={cn(
                    'flex items-center gap-2 text-sm/5 font-medium',
                    t.type === 'INCOME' ? 'text-green-700' : 'text-red-700',
                    columnClassName.type,
                  )}
                >
                  {t.type === 'INCOME' ? (
                    <CircleArrowUp className="size-4 shrink-0 text-green-600" />
                  ) : (
                    <CircleArrowDown className="size-4 shrink-0 text-red-600" />
                  )}
                  {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                </span>

                <span
                  className={cn('text-base/6 font-medium text-gray-800', columnClassName.amount)}
                >
                  {t.type === 'INCOME' ? '+' : '-'} {formatCents(t.amountInCents)}
                </span>

                <span className={columnClassName.actions}>
                  <span className="flex items-center justify-end gap-2">
                    <DeleteConfirmDialog
                      trigger={
                        <button
                          type="button"
                          aria-label="Apagar transação"
                          className="flex size-8 items-center justify-center rounded-lg text-danger hover:bg-red-100"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      }
                      title="Apagar transação"
                      description={`Tem certeza que quer apagar "${t.description}"? Essa ação não pode ser desfeita.`}
                      onConfirm={() => deleteMutation.mutate(t.id)}
                    />
                    <TransactionFormDialog
                      transaction={t}
                      trigger={
                        <button
                          type="button"
                          aria-label="Editar transação"
                          className="flex size-8 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                          <Pencil className="size-4" />
                        </button>
                      }
                    />
                  </span>
                </span>
              </li>
            ))}

          {!isLoading && filtered.length === 0 && (
            <li className="px-6 py-6 text-center text-sm/5 text-gray-500">
              Nenhuma transação encontrada.
            </li>
          )}
        </ul>

        {filtered.length > 0 && (
          <SectionFooter>
            <span className="text-sm/5 text-gray-500">
              {(currentPage - 1) * PAGE_SIZE + 1} a{' '}
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} | {filtered.length} resultados
            </span>

            <nav className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Página anterior"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                className="flex size-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  aria-current={number === currentPage ? 'page' : undefined}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-lg text-sm/5 font-medium',
                    number === currentPage
                      ? 'bg-brand-base text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100',
                  )}
                >
                  {number}
                </button>
              ))}

              <button
                type="button"
                aria-label="Próxima página"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="flex size-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                <ChevronRight className="size-4" />
              </button>
            </nav>
          </SectionFooter>
        )}
      </Section>
    </>
  )
}
