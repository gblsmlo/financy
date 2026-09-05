import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ClientError } from 'graphql-request'
import { LogIn } from 'lucide-react'
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
    setError,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: (user) => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, user)
      navigate({ to: '/' })
    },
    onError: (error) => {
      if (
        error instanceof ClientError &&
        error.response.errors?.[0]?.extensions?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'
      ) {
        setError('email', { message: 'Esse e-mail já está cadastrado.' })
      }
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
            <Input
              id="name"
              placeholder="Seu nome completo"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="mail@exemplo.com"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-xs text-danger">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-gray-400">A senha deve ter no mínimo 8 caracteres</p>
            )}
          </div>

          {mutation.isError && !errors.email && (
            <p className="text-sm text-danger">
              {mutation.error instanceof ClientError
                ? (mutation.error.response.errors?.[0]?.message ?? 'Erro ao cadastrar.')
                : 'Erro ao cadastrar.'}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Cadastrando…' : 'Cadastrar'}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          ou
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <p className="mb-3 text-center text-sm text-gray-500">Já tem uma conta?</p>
        <Button variant="outline" asChild className="w-full">
          <Link to="/login">
            <LogIn className="size-4" />
            Fazer login
          </Link>
        </Button>
      </Card>
    </main>
  )
}
