# Task 004 — API de domínio: transações e categorias

## Objetivo

CRUD completo de transações e categorias via GraphQL, sempre restrito ao usuário autenticado.

## Critérios de aceite

- [ ] Schema GraphQL: tipos `Transaction`, `Category`, queries de listagem e mutations de
      criar/editar/deletar para ambos.
- [ ] Todo resolver de domínio exige usuário autenticado (via contexto da Task 003) e filtra por
      `userId` — nunca retorna nem altera dado de outro usuário.
- [ ] Validação de entrada (Zod ou validação nativa do schema GraphQL) para os payloads de
      criação/edição.
- [ ] Categoria não pode ser deletada/editada por usuário que não é dono; mesma regra pra
      transação.
- [ ] Testes de resolver cobrindo os 8 requisitos funcionais (FR-03 a FR-10 do
      [requirements.md](../requirements.md)) e o isolamento por usuário (FR-02).

## Evidências

(preencher ao concluir)

## Fora de escopo

- UI — [Task 006](006-frontend-features.md).
- Regras de negócio além do CRUD (ex.: saldo agregado, relatórios) — só se aparecerem no Figma
  como parte das 6 páginas obrigatórias.
