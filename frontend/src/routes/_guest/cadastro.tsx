import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { signup } from '../../features/auth/api'
import { sessionQueryOptions } from '../../features/auth/session'

export const Route = createFileRoute('/_guest/cadastro')({
  component: CadastroPage,
})

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.'),
  email: z.email('E-mail inválido.'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
})

type SignupForm = z.infer<typeof signupSchema>

function CadastroPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: (user) => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, user)
      navigate({ to: '/' })
    },
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900">Criar conta</h1>
        <p className="mb-6 text-sm text-gray-500">Comece a controlar suas finanças ainda hoje</p>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" placeholder="Seu nome completo" {...register('name')} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="mail@exemplo.com" {...register('email')} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password ? (
              <p className="text-xs text-danger">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-gray-400">A senha deve ter no mínimo 8 caracteres</p>
            )}
          </div>

          {mutation.isError && (
            <p className="text-sm text-danger">
              {mutation.error instanceof Error ? mutation.error.message : 'Erro ao cadastrar.'}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Cadastrando…' : 'Cadastrar'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-brand-base hover:underline">
            Fazer login
          </Link>
        </p>
      </Card>
    </main>
  )
}
