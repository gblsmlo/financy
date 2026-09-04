import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ClientError } from 'graphql-request'
import { LogIn } from 'lucide-react'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
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
  const rememberMeId = useId()

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

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Checkbox id={rememberMeId} />
              <Label htmlFor={rememberMeId} className="font-normal text-gray-600">
                Lembrar-me
              </Label>
            </div>
            <span className="cursor-not-allowed text-gray-400" title="Em breve">
              Recuperar senha
            </span>
          </div>

          {mutation.isError && (
            <p className="text-sm text-danger">
              {mutation.error instanceof ClientError
                ? (mutation.error.response.errors?.[0]?.message ?? 'Erro ao entrar.')
                : 'Erro ao entrar.'}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          ou
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <p className="mb-3 text-center text-sm text-gray-500">Ainda não tem uma conta?</p>
        <Button variant="outline" asChild className="w-full">
          <Link to="/cadastro">
            <LogIn className="size-4" />
            Criar conta
          </Link>
        </Button>
      </Card>
    </main>
  )
}
