import type { LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

type InputProps = ComponentProps<'input'> & {
  icon?: LucideIcon
  /** Texto fixo à esquerda do valor, como o "R$" do campo de valor. */
  prefix?: ReactNode
  /** Ação ancorada na direita de dentro do campo (o olho de "mostrar senha", por exemplo). */
  action?: ReactNode
}

// A borda mora na moldura, não no <input>: no Figma o campo é uma linha de
// ícone + texto + ação com gap 12, e só assim um prefixo de largura variável
// ("R$") empurra o valor em vez de ficar por cima dele.
export function Input({ className, icon: Icon, prefix, action, ...props }: InputProps) {
  return (
    <div
      className={cn(
        'flex h-12 w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-3',
        'focus-within:border-brand-base focus-within:ring-1 focus-within:ring-brand-base',
        'has-[input[aria-invalid=true]]:border-danger has-[input[aria-invalid=true]]:focus-within:ring-danger',
        className,
      )}
    >
      {Icon && <Icon className="size-4 shrink-0 text-gray-400" />}
      {prefix && <span className="shrink-0 text-base/6 text-gray-600">{prefix}</span>}

      <input
        className="min-w-0 flex-1 bg-transparent text-base/6 text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-gray-400"
        {...props}
      />

      {action}
    </div>
  )
}
