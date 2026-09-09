import { zodResolver } from '@hookform/resolvers/zod'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleArrowDown, CircleArrowUp, type LucideIcon } from 'lucide-react'
import { type ReactNode, useEffect, useId, useState } from 'react'
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
import { Field, FieldError } from '../../components/ui/field'
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
import { apiErrorMessage } from '../../lib/api-error'
import { formatCentsForInput, parseAmount, parseAmountToCents } from '../../lib/money'
import { cn } from '../../lib/utils'
import { categoriesQueryOptions } from '../categories/api'
import { createTransaction, updateTransaction } from './api'

const transactionSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']),
  description: z
    .string()
    .trim()
    .min(1, 'Descrição é obrigatória.')
    .max(200, 'Máximo de 200 caracteres.'),
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

function TypeOption({
  value,
  label,
  icon: Icon,
  selected,
  accentClassName,
}: {
  value: TransactionType
  label: string
  icon: LucideIcon
  selected: boolean
  accentClassName: string
}) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'flex h-[46px] items-center justify-center gap-3 rounded-lg border px-3 text-base/6 font-medium',
        selected
          ? cn('bg-gray-100 text-gray-800', accentClassName)
          : 'border-transparent text-gray-600',
      )}
    >
      <Icon className={cn('size-4', selected ? undefined : 'text-gray-400')} />
      {label}
    </TabsPrimitive.Trigger>
  )
}

export function TransactionFormDialog({ transaction, trigger }: TransactionFormDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const isEditing = Boolean(transaction)
  const { data: categories = [] } = useQuery(categoriesQueryOptions)
  const descriptionId = useId()
  const dateId = useId()
  const amountId = useId()
  const categorySelectId = useId()

  const defaultValues: TransactionForm = {
    type: (transaction?.type as TransactionType) ?? 'EXPENSE',
    description: transaction?.description ?? '',
    date: transaction ? transaction.date.slice(0, 10) : '',
    amount: transaction ? formatCentsForInput(transaction.amountInCents) : '',
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
        amountInCents: parseAmountToCents(data.amount),
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
          className="flex flex-col gap-6"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          <TabsPrimitive.Root
            value={type}
            onValueChange={(value) => setValue('type', value as TransactionType)}
          >
            <TabsPrimitive.List className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 p-2">
              <TypeOption
                value="EXPENSE"
                label="Despesa"
                icon={CircleArrowDown}
                selected={type === 'EXPENSE'}
                accentClassName="border-red-600 [&>svg]:text-red-600"
              />
              <TypeOption
                value="INCOME"
                label="Receita"
                icon={CircleArrowUp}
                selected={type === 'INCOME'}
                accentClassName="border-green-600 [&>svg]:text-green-600"
              />
            </TabsPrimitive.List>
          </TabsPrimitive.Root>

          <div className="flex flex-col gap-4">
            <Field>
              <Label htmlFor={descriptionId}>Descrição</Label>
              <Input
                id={descriptionId}
                placeholder="Ex. Almoço no restaurante"
                aria-invalid={!!errors.description}
                {...register('description')}
              />
              {errors.description && <FieldError>{errors.description.message}</FieldError>}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor={dateId}>Data</Label>
                <Input id={dateId} type="date" aria-invalid={!!errors.date} {...register('date')} />
                {errors.date && <FieldError>{errors.date.message}</FieldError>}
              </Field>

              <Field>
                <Label htmlFor={amountId}>Valor</Label>
                <Input
                  id={amountId}
                  inputMode="decimal"
                  prefix="R$"
                  placeholder="0,00"
                  aria-invalid={!!errors.amount}
                  {...register('amount')}
                />
                {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
              </Field>
            </div>

            <Field>
              <Label htmlFor={categorySelectId}>Categoria</Label>
              <Select value={categoryId} onValueChange={(value) => setValue('categoryId', value)}>
                <SelectTrigger id={categorySelectId}>
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
              {errors.categoryId && <FieldError>{errors.categoryId.message}</FieldError>}
            </Field>
          </div>

          {mutation.isError && (
            <p className="text-sm/5 text-danger">
              {apiErrorMessage(mutation.error, 'Erro ao salvar.')}
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
