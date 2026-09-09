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
  test('mostra nome, descrição e a contagem de uso', () => {
    const view = renderWithQuery(
      <CategoryCard category={category} itemCount={2} onDelete={() => {}} />,
    )

    expect(view.getAllByText('Alimentação').length).toBeGreaterThan(0)
    expect(view.getByText('Mercado e restaurantes')).toBeDefined()
    expect(view.getByText('2 itens')).toBeDefined()
  })

  test('usa o singular quando a categoria tem uma transação só', () => {
    const view = renderWithQuery(
      <CategoryCard category={category} itemCount={1} onDelete={() => {}} />,
    )

    expect(view.getByText('1 item')).toBeDefined()
  })

  // Apagar é destrutivo: o clique no ícone abre o diálogo, quem apaga é a confirmação.
  test('só apaga depois da confirmação', async () => {
    const onDelete = mock()

    const view = renderWithQuery(
      <CategoryCard category={category} itemCount={0} onDelete={onDelete} />,
    )

    fireEvent.click(view.getByRole('button', { name: 'Apagar categoria' }))

    await waitFor(() => expect(view.getByText('Apagar categoria')).toBeDefined())
    expect(onDelete).not.toHaveBeenCalled()

    fireEvent.click(view.getByRole('button', { name: 'Apagar' }))

    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1))
  })
})
