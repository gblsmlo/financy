import { describe, expect, mock, test } from 'bun:test'

mock.module('../../lib/graphql-client', () => ({
  graphqlClient: { request: () => Promise.resolve({ categories: [] }) },
  setAuthHeader: () => {},
  clearAuthHeader: () => {},
}))

const { fireEvent, renderWithQuery, waitFor } = await import('../../test-helpers')
const { CategoryCard } = await import('./category-card')

const category = {
  id: 'c1',
  name: 'Alimentação',
  description: 'Mercado e restaurantes',
  icon: 'utensils',
  color: 'GREEN' as const,
}

describe('CategoryCard', () => {
  test('mostra nome, descrição e o resumo de uso', () => {
    const view = renderWithQuery(
      <CategoryCard category={category} itemCount={2} totalInCents={7500} onDelete={() => {}} />,
    )

    expect(view.getAllByText('Alimentação').length).toBeGreaterThan(0)
    expect(view.getByText('Mercado e restaurantes')).toBeDefined()
    expect(view.getByText(/2 itens · R\$ 75,00/)).toBeDefined()
  })

  test('omite o total quando a categoria não tem transação', () => {
    const view = renderWithQuery(
      <CategoryCard category={category} itemCount={0} totalInCents={0} onDelete={() => {}} />,
    )

    expect(view.getByText('0 itens')).toBeDefined()
    expect(view.queryByText(/R\$/)).toBeNull()
  })

  // Apagar é destrutivo: o clique no ícone abre o diálogo, quem apaga é a confirmação.
  test('só apaga depois da confirmação', async () => {
    const onDelete = mock()

    const view = renderWithQuery(
      <CategoryCard category={category} itemCount={0} totalInCents={0} onDelete={onDelete} />,
    )

    const [, deleteTrigger] = view.getAllByRole('button')
    fireEvent.click(deleteTrigger)

    await waitFor(() => expect(view.getByText('Apagar categoria')).toBeDefined())
    expect(onDelete).not.toHaveBeenCalled()

    fireEvent.click(view.getByRole('button', { name: 'Apagar' }))

    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1))
  })
})
