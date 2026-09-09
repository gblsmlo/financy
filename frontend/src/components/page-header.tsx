import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl/8 font-bold text-gray-800">{title}</h1>
        <p className="text-base/6 text-gray-600">{description}</p>
      </div>
      {action}
    </div>
  )
}
