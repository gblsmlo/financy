import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Lock, Mail, UserRoundPlus } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Logo } from '../../components/logo'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
import { Field, FieldError } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { login } from '../../features/auth/api'
import { sessionQueryOptions } from '../../features/auth/session'
import { apiErrorMessage } from '../../lib/api-error'

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
  const [showPassword, setShowPassword] = useState(false)

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
    <main className="flex min-h-screen flex-col items-center gap-8 bg-gray-100 p-12">
      <Logo />

      <Card className="flex w-full max-w-[448px] flex-col gap-8 p-8">
        <header className="flex flex-col gap-1 text-center">
          <h1 className="text-xl/7 font-bold text-gray-800">Fazer login</h1>
          <p className="text-base/6 text-gray-600">Entre na sua conta para continuar</p>
        </header>

        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          <div className="flex flex-col gap-4">
            <Field>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                icon={Mail}
                placeholder="mail@exemplo.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Digite sua senha"
                aria-invalid={!!errors.password}
                action={
                  <button
                    type="button"
                    aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
                {...register('password')}
              />
              {errors.password && <FieldError>{errors.password.message}</FieldError>}
            </Field>
          </div>

          <div className="flex h-5 items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id={rememberMeId} />
              <Label htmlFor={rememberMeId} className="font-normal text-gray-700">
                Lembrar-me
              </Label>
            </div>
            <span
              className="cursor-not-allowed text-sm/5 font-medium text-gray-400"
              title="Em breve"
            >
              Recuperar senha
            </span>
          </div>

          {mutation.isError && (
            <p className="text-sm/5 text-danger">
              {apiErrorMessage(mutation.error, 'Erro ao entrar.')}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Entrando…' : 'Entrar'}
          </Button>

          <div className="flex h-5 items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-sm/5 text-gray-500">ou</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-center text-sm/5 text-gray-600">Ainda não tem uma conta?</p>
            <Button variant="outline" asChild>
              <Link to="/cadastro">
                <UserRoundPlus className="size-4" />
                Criar conta
              </Link>
            </Button>
          </div>
        </form>
      </Card>
    </main>
  )
}
