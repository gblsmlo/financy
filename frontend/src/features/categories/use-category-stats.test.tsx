import { describe, expect, mock, test } from 'bun:test'

const categories = [
  { id: 'c1', name: 'Alimentação', description: null, icon: 'utensils', color: 'GREEN' },
  { id: 'c2', name: 'Transporte', description: null, icon: 'car', color: 'BLUE' },
  { id: 'c3', name: 'Sem uso', description: null, icon: 'home', color: 'RED' },
]

const transactions = [
  {
    id: 't1',
    description: 'Almoço',
    amountInCents: 5000,
    type: 'EXPENSE',
    date: '2026-09-01T00:00:00.000Z',
    category: { id: 'c1', name: 'Alimentação', color: 'GREEN' },
  },
  {
    id: 't2',
    description: 'Jantar',
    amountInCents: 2500,
    type: 'EXPENSE',
    date: '2026-09-02T00:00:00.000Z',
    category: { id: 'c1', name: 'Alimentação', color: 'GREEN' },
  },
  {
    id: 't3',
    description: 'Uber',
    amountInCents: 1800,
    type: 'EXPENSE',
    date: '2026-09-03T00:00:00.000Z',
    category: { id: 'c2', name: 'Transporte', color: 'BLUE' },
  },
]

mock.module('../../lib/graphql-client', () => ({
  graphqlClient: {
    request: (document: unknown) => {
      const source = JSON.stringify(document)
      return Promise.resolve(source.includes('Categories') ? { categories } : { transactions })
    },
  },
  setAuthHeader: () => {},
  clearAuthHeader: () => {},
}))

const { renderHookWithQuery, waitFor } = await import('../../test-helpers')
const { useCategoryStats } = await import('./use-category-stats')

describe('useCategoryStats', () => {
  test('agrega contagem e total por categoria', async () => {
    const { result } = renderHookWithQuery(() => useCategoryStats())

    await waitFor(() => expect(result.current.stats).toHaveLength(3))

    const byName = Object.fromEntries(result.current.stats.map((s) => [s.category.name, s]))

    expect(byName.Alimentação.itemCount).toBe(2)
    expect(byName.Alimentação.totalInCents).toBe(7500)
    expect(byName.Transporte.itemCount).toBe(1)
    expect(byName.Transporte.totalInCents).toBe(1800)
  })

  // Sem esse sinal a página de Categorias renderizava "Nenhuma categoria ainda." durante a
  // carga, dizendo que não existe categoria antes de saber.
  test('reporta carregamento em vez de entregar lista vazia', async () => {
    const { result } = renderHookWithQuery(() => useCategoryStats())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.stats).toHaveLength(0)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.stats).toHaveLength(3)
    expect(result.current.error).toBeNull()
  })

  test('categoria sem transação fica zerada em vez de sumir da lista', async () => {
    const { result } = renderHookWithQuery(() => useCategoryStats())

    await waitFor(() => expect(result.current.stats).toHaveLength(3))

    const semUso = result.current.stats.find((s) => s.category.name === 'Sem uso')

    expect(semUso?.itemCount).toBe(0)
    expect(semUso?.totalInCents).toBe(0)
  })
})
