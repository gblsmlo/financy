import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Lock, LogIn, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Logo } from '../../components/logo'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, FieldError, FieldHelper } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { signup } from '../../features/auth/api'
import { sessionQueryOptions } from '../../features/auth/session'
import { apiErrorCode, apiErrorMessage } from '../../lib/api-error'

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
  const [showPassword, setShowPassword] = useState(false)

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
      if (apiErrorCode(error) === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
        setError('email', { message: 'Esse e-mail já está cadastrado.' })
      }
    },
  })

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-gray-100 p-12">
      <Logo />

      <Card className="flex w-full max-w-[448px] flex-col gap-8 p-8">
        <header className="flex flex-col gap-1 text-center">
          <h1 className="text-xl/7 font-bold text-gray-800">Criar conta</h1>
          <p className="text-base/6 text-gray-600">Comece a controlar suas finanças ainda hoje</p>
        </header>

        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          <div className="flex flex-col gap-4">
            <Field>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                icon={UserRound}
                placeholder="Seu nome completo"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

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
              {errors.password ? (
                <FieldError>{errors.password.message}</FieldError>
              ) : (
                <FieldHelper>A senha deve ter no mínimo 8 caracteres</FieldHelper>
              )}
            </Field>
          </div>

          {mutation.isError && !errors.email && (
            <p className="text-sm/5 text-danger">
              {apiErrorMessage(mutation.error, 'Erro ao cadastrar.')}
            </p>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Cadastrando…' : 'Cadastrar'}
          </Button>

          <div className="flex h-5 items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-sm/5 text-gray-500">ou</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-center text-sm/5 text-gray-600">Já tem uma conta?</p>
            <Button variant="outline" asChild>
              <Link to="/">
                <LogIn className="size-4" />
                Fazer login
              </Link>
            </Button>
          </div>
        </form>
      </Card>
    </main>
  )
}
