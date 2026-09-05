import './test-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, type RenderResult, render, renderHook, waitFor } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

/**
 * Devolve as queries desta render (ligadas ao `document.body`, então enxergam portal de dialog).
 * Preferir a essas o `screen` global do testing-library não funciona aqui: ele é construído
 * quando o módulo é avaliado, e nesse instante o `document` do happy-dom pode ainda não existir.
 */
export function renderWithQuery(ui: ReactElement): RenderResult {
  return render(ui, { wrapper: createWrapper() })
}

export function renderHookWithQuery<T>(hook: () => T) {
  return renderHook(hook, { wrapper: createWrapper() })
}

export { fireEvent, waitFor }
