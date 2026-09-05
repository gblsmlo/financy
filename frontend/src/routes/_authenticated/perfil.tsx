import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { updateProfile } from '../../features/auth/api'
import { sessionQueryOptions, useSession } from '../../features/auth/session'

export const Route = createFileRoute('/_authenticated/perfil')({
  component: PerfilPage,
})

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.'),
})

type ProfileForm = z.infer<typeof profileSchema>

function PerfilPage() {
  const { user } = useSession()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '' },
  })

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, updatedUser)
    },
  })

  if (!user) return null

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-600">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-lg font-semibold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" value={user.email} disabled />
            <p className="text-xs text-gray-400">O e-mail não pode ser alterado</p>
          </div>

          {mutation.isSuccess && (
            <p className="text-sm text-success">Alterações salvas com sucesso.</p>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
