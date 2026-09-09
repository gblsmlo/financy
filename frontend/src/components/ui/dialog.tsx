import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-2rem)] w-full max-w-[448px] -translate-x-1/2 -translate-y-1/2 flex-col gap-6 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

/** Título e descrição à esquerda, o botão de fechar ancorado à direita. */
export function DialogHeader({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)} {...props}>
      <div className="flex flex-col gap-0.5">{children}</div>

      <DialogPrimitive.Close className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none">
        <X className="size-4" />
        <span className="sr-only">Fechar</span>
      </DialogPrimitive.Close>
    </div>
  )
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-base/6 font-semibold text-gray-800', className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn('text-sm/5 text-gray-600', className)} {...props} />
  )
}
