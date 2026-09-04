import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { login } from '../../features/auth/api'
import { sessionQueryOptions } from '../../features/auth/session'

export const Route = createFileRoute('/_guest/login')({
  component: LoginPage,
})

const loginSchema = z.object({
  email: z.email('E-mail inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, user)
      navigate({ to: '/' })
    },
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900">Fazer login</h1>
        <p className="mb-6 text-sm text-gray-500">Entre na sua conta para continuar</p>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="mail@exemplo.com" {...register('email')} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>

          {mutation.isError && (
            <p className="text-sm text-danger">
              {mutation.error instanceof Error ? mutation.error.message : 'Erro ao entrar.'}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Ainda não tem uma conta?{' '}
          <Link to="/cadastro" className="font-medium text-brand-base hover:underline">
            Criar conta
          </Link>
        </p>
      </Card>
    </main>
  )
}
