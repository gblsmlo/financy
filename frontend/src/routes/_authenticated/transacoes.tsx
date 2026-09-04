import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { Card } from '../../components/ui/card'
import { transactionsQueryOptions } from '../../features/transactions/api'
import { formatCents } from '../../lib/money'

export const Route = createFileRoute('/_authenticated/transacoes')({
  component: TransacoesPage,
})

function TransacoesPage() {
  const { data: transactions = [] } = useQuery(transactionsQueryOptions)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Transações</h1>
        <p className="text-sm text-gray-500">Gerencie todas as suas transações financeiras</p>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="px-6 py-3 font-medium text-gray-900">{t.description}</td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(t.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-3 text-gray-500">{t.category.name}</td>
                <td className="px-6 py-3 text-gray-500">
                  {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                </td>
                <td
                  className={
                    t.type === 'INCOME'
                      ? 'px-6 py-3 text-right font-medium text-success'
                      : 'px-6 py-3 text-right font-medium text-danger'
                  }
                >
                  {t.type === 'INCOME' ? '+' : '-'} {formatCents(t.amountInCents)}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                  Nenhuma transação ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
