import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ClientError } from 'graphql-request'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { categoriesQueryOptions } from '../../features/categories/api'
import { categoryColorClasses } from '../../features/categories/visuals'
import { deleteTransaction, transactionsQueryOptions } from '../../features/transactions/api'
import { TransactionFormDialog } from '../../features/transactions/transaction-form-dialog'
import { formatCents } from '../../lib/money'
import { cn } from '../../lib/utils'

export const Route = createFileRoute('/_authenticated/transacoes')({
  component: TransacoesPage,
})

const PAGE_SIZE = 10

function TransacoesPage() {
  const { data: transactions = [], isLoading } = useQuery(transactionsQueryOptions)
  const { data: categories = [] } = useQuery(categoriesQueryOptions)
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [type, setType] = useState('ALL')
  const [categoryId, setCategoryId] = useState('ALL')
  const [page, setPage] = useState(1)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      setDeleteError(null)
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (error) => {
      setDeleteError(
        error instanceof ClientError
          ? (error.response.errors?.[0]?.message ?? 'Erro ao apagar.')
          : 'Erro ao apagar.',
      )
    },
  })

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
      if (type !== 'ALL' && t.type !== type) return false
      if (categoryId !== 'ALL' && t.category.id !== categoryId) return false
      return true
    })
  }, [transactions, search, type, categoryId])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Transações</h1>
          <p className="text-sm text-gray-500">Gerencie todas as suas transações financeiras</p>
        </div>
        <TransactionFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Nova transação
            </Button>
          }
        />
      </div>

      {deleteError && <p className="text-sm text-danger">{deleteError}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          placeholder="Buscar por descrição"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value)
            setPage(1)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os tipos</SelectItem>
            <SelectItem value="INCOME">Entrada</SelectItem>
            <SelectItem value="EXPENSE">Saída</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={categoryId}
          onValueChange={(value) => {
            setCategoryId(value)
            setPage(1)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Descrição</th>
              <th className="px-6 py-3 font-medium">Data</th>
              <th className="px-6 py-3 font-medium">Categoria</th>
              <th className="px-6 py-3 font-medium">Tipo</th>
              <th className="px-6 py-3 text-right font-medium">Valor</th>
              <th className="px-6 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                  Carregando…
                </td>
              </tr>
            )}
            {!isLoading &&
              paginated.map((t) => {
                const colors = categoryColorClasses[t.category.color]
                return (
                  <tr key={t.id}>
                    <td className="px-6 py-3 font-medium text-gray-900">{t.description}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium',
                          colors.bg,
                          colors.text,
                        )}
                      >
                        {t.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                    </td>
                    <td
                      className={cn(
                        'px-6 py-3 text-right font-medium',
                        t.type === 'INCOME' ? 'text-success' : 'text-danger',
                      )}
                    >
                      {t.type === 'INCOME' ? '+' : '-'} {formatCents(t.amountInCents)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <TransactionFormDialog
                          transaction={t}
                          trigger={
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                              <Pencil className="size-4" />
                            </button>
                          }
                        />
                        <DeleteConfirmDialog
                          trigger={
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-danger"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          }
                          title="Apagar transação"
                          description={`Tem certeza que quer apagar "${t.description}"? Essa ação não pode ser desfeita.`}
                          onConfirm={() => deleteMutation.mutate(t.id)}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                  Nenhuma transação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 text-sm text-gray-500">
            <span>
              {(currentPage - 1) * PAGE_SIZE + 1} a{' '}
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} resultados
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
