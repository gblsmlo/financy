import { zodResolver } from '@hookform/resolvers/zod'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import type { TransactionType } from '../../gql/graphql'
import type { Transaction } from '../../gql/schema-types'
import { cn } from '../../lib/utils'
import { categoriesQueryOptions } from '../categories/api'
import { createTransaction, updateTransaction } from './api'

function parseAmount(value: string): number {
  return Number.parseFloat(value.replace(',', '.'))
}

const transactionSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']),
  description: z.string().trim().min(1, 'Descrição é obrigatória.'),
  date: z.string().min(1, 'Data é obrigatória.'),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório.')
    .refine(
      (v) => !Number.isNaN(parseAmount(v)) && parseAmount(v) > 0,
      'Valor precisa ser maior que zero.',
    ),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
})

type TransactionForm = z.infer<typeof transactionSchema>

type TransactionFormDialogProps = {
  transaction?: Pick<Transaction, 'id' | 'description' | 'amountInCents' | 'type' | 'date'> & {
    category: { id: string }
  }
  trigger: ReactNode
}

export function TransactionFormDialog({ transaction, trigger }: TransactionFormDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const isEditing = Boolean(transaction)
  const { data: categories = [] } = useQuery(categoriesQueryOptions)

  const defaultValues: TransactionForm = {
    type: (transaction?.type as TransactionType) ?? 'EXPENSE',
    description: transaction?.description ?? '',
    date: transaction ? transaction.date.slice(0, 10) : '',
    amount: transaction ? (transaction.amountInCents / 100).toFixed(2) : '',
    categoryId: transaction?.category.id ?? '',
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  })

  // Reseta só quando o modal abre — defaultValues/reset mudam toda render, não podem entrar nas deps.
  // biome-ignore lint/correctness/useExhaustiveDependencies: ver comentário acima
  useEffect(() => {
    if (open) reset(defaultValues)
  }, [open])

  const type = watch('type')
  const categoryId = watch('categoryId')

  const mutation = useMutation({
    mutationFn: (data: TransactionForm) => {
      const input = {
        type: data.type,
        description: data.description,
        date: data.date,
        amountInCents: Math.round(parseAmount(data.amount) * 100),
        categoryId: data.categoryId,
      }
      return transaction
        ? updateTransaction({ id: transaction.id, input })
        : createTransaction(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar transação' : 'Nova transação'}</DialogTitle>
          <DialogDescription>Registre sua despesa ou receita</DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          <TabsPrimitive.Root
            value={type}
            onValueChange={(value) => setValue('type', value as TransactionType)}
          >
            <TabsPrimitive.List className="grid grid-cols-2 gap-2">
              <TabsPrimitive.Trigger
                value="EXPENSE"
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium',
                  type === 'EXPENSE'
                    ? 'border-danger text-danger'
                    : 'border-gray-200 text-gray-500',
                )}
              >
                <ArrowDownCircle className="size-4" />
                Despesa
              </TabsPrimitive.Trigger>
              <TabsPrimitive.Trigger
                value="INCOME"
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium',
                  type === 'INCOME'
                    ? 'border-success text-success'
                    : 'border-gray-200 text-gray-500',
                )}
              >
                <ArrowUpCircle className="size-4" />
                Receita
              </TabsPrimitive.Trigger>
            </TabsPrimitive.List>
          </TabsPrimitive.Root>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex. Almoço no restaurante"
              aria-invalid={!!errors.description}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-danger">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" aria-invalid={!!errors.date} {...register('date')} />
              {errors.date && <p className="text-xs text-danger">{errors.date.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="0,00"
                aria-invalid={!!errors.amount}
                {...register('amount')}
              />
              {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={(value) => setValue('categoryId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-danger">{errors.categoryId.message}</p>
            )}
          </div>

          {mutation.isError && (
            <p className="text-sm text-danger">
              {mutation.error instanceof Error ? mutation.error.message : 'Erro ao salvar.'}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
