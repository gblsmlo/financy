import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Textarea } from '../../components/ui/textarea'
import type { CategoryColor } from '../../gql/graphql'
import type { Category } from '../../gql/schema-types'
import { apiErrorCode, apiErrorMessage } from '../../lib/api-error'
import { cn } from '../../lib/utils'
import { createCategory, updateCategory } from './api'
import { categoryColorClasses, categoryColors, categoryIconNames, categoryIcons } from './visuals'

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.').max(100, 'Máximo de 100 caracteres.'),
  description: z.string().trim().max(200, 'Máximo de 200 caracteres.').optional(),
  icon: z.enum(categoryIconNames, { error: 'Escolha um ícone.' }),
  color: z.enum(categoryColors, { error: 'Escolha uma cor.' }),
})

type CategoryForm = z.infer<typeof categorySchema>

type CategoryFormDialogProps = {
  category?: Pick<Category, 'id' | 'name' | 'description' | 'icon' | 'color'>
  trigger: ReactNode
}

export function CategoryFormDialog({ category, trigger }: CategoryFormDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const isEditing = Boolean(category)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      icon: (category?.icon as CategoryForm['icon']) ?? 'briefcase',
      color: (category?.color as CategoryColor) ?? 'GREEN',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? '',
        description: category?.description ?? '',
        icon: (category?.icon as CategoryForm['icon']) ?? 'briefcase',
        color: (category?.color as CategoryColor) ?? 'GREEN',
      })
    }
  }, [open, category, reset])

  const selectedIcon = watch('icon')
  const selectedColor = watch('color')

  const mutation = useMutation({
    mutationFn: (data: CategoryForm) =>
      category ? updateCategory({ id: category.id, input: data }) : createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setOpen(false)
    },
    onError: (error) => {
      if (apiErrorCode(error) === 'CONFLICT') {
        setError('name', { message: apiErrorMessage(error, 'Nome já usado.') })
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
          <DialogDescription>Organize suas transações com categorias</DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Título</Label>
            <Input
              id="name"
              placeholder="Ex. Alimentação"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">
              Descrição <span className="font-normal text-gray-400">(opcional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Descrição da categoria"
              {...register('description')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Ícone</Label>
            <div className="grid grid-cols-7 gap-2">
              {categoryIconNames.map((name) => {
                const Icon = categoryIcons[name]
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setValue('icon', name)}
                    className={cn(
                      'flex size-9 items-center justify-center rounded-lg border text-gray-500',
                      selectedIcon === name
                        ? 'border-brand-base text-brand-base'
                        : 'border-gray-200 hover:bg-gray-50',
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                )
              })}
            </div>
            {errors.icon && <p className="text-xs text-danger">{errors.icon.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Cor</Label>
            <div className="flex gap-2">
              {categoryColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={cn(
                    'size-8 rounded-full border-2',
                    categoryColorClasses[color].dot,
                    selectedColor === color ? 'border-gray-900' : 'border-transparent',
                  )}
                >
                  <span className="sr-only">{color}</span>
                </button>
              ))}
            </div>
            {errors.color && <p className="text-xs text-danger">{errors.color.message}</p>}
          </div>

          {mutation.isError && !errors.name && (
            <p className="text-sm text-danger">
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
