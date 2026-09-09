import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LogOut, Mail, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, FieldError, FieldHelper } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { logout, updateProfile } from '../../features/auth/api'
import { sessionQueryOptions, useSession } from '../../features/auth/session'
import { apiErrorMessage } from '../../lib/api-error'

export const Route = createFileRoute('/_authenticated/perfil')({
  component: PerfilPage,
})

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.').max(100, 'Máximo de 100 caracteres.'),
})

type ProfileForm = z.infer<typeof profileSchema>

function PerfilPage() {
  const { user } = useSession()
  const navigate = useNavigate()
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

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, null)
      navigate({ to: '/' })
    },
  })

  // Sem isso o "salvo com sucesso" da primeira gravação fica na tela enquanto o usuário digita
  // a alteração seguinte, dizendo que já salvou o que ainda nem foi enviado.
  function submit(data: ProfileForm) {
    mutation.reset()
    mutation.mutate(data)
  }

  if (!user) return null

  return (
    <Card className="mx-auto flex w-full max-w-[448px] flex-col gap-8 p-8">
      <header className="flex flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-gray-300 text-xl/7 font-medium text-gray-800">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-xl/7 font-bold text-gray-800">{user.name}</h1>
          <p className="text-base/6 text-gray-500">{user.email}</p>
        </div>
      </header>

      <form
        className="flex flex-col gap-6 border-t border-gray-200 pt-8"
        onSubmit={handleSubmit(submit)}
      >
        <div className="flex flex-col gap-4">
          <Field>
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" icon={UserRound} aria-invalid={!!errors.name} {...register('name')} />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <Field>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" icon={Mail} value={user.email} disabled />
            <FieldHelper>O e-mail não pode ser alterado</FieldHelper>
          </Field>
        </div>

        {mutation.isSuccess && (
          <p className="text-sm/5 text-success">Alterações salvas com sucesso.</p>
        )}

        {mutation.isError && (
          <p className="text-sm/5 text-danger">
            {apiErrorMessage(mutation.error, 'Não foi possível salvar as alterações.')}
          </p>
        )}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : 'Salvar alterações'}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="size-4 text-danger" />
          Sair da conta
        </Button>
      </form>
    </Card>
  )
}
