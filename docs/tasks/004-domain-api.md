# Task 004 — API de domínio: transações e categorias

## Objetivo

CRUD completo de transações e categorias via GraphQL, sempre restrito ao usuário autenticado.

## Critérios de aceite

- [x] Schema GraphQL: tipos `Transaction`, `Category`, queries de listagem e mutations de
      criar/editar/deletar para ambos.
- [x] Todo resolver de domínio exige usuário autenticado (via contexto da Task 003) e filtra por
      `userId` — nunca retorna nem altera dado de outro usuário.
- [x] Validação de entrada (Zod) para os payloads de criação/edição.
- [x] Categoria não pode ser deletada/editada por usuário que não é dono; mesma regra pra
      transação.
- [x] Testes de resolver cobrindo os 8 requisitos funcionais (FR-03 a FR-10 do
      [requirements.md](../requirements.md)) e o isolamento por usuário (FR-02).

## Evidências

- `backend/src/graphql/categories/{type-defs,resolvers,resolvers.test}.ts`,
  `backend/src/graphql/transactions/{type-defs,resolvers,resolvers.test}.ts`.
- `backend/src/graphql/schema.ts` combina type-defs (`extend type Query/Mutation`) e resolvers de
  auth + categoria + transação num único schema/resolver map pro Mercurius.
- `backend/src/graphql/require-user.ts` (helper `UNAUTHENTICATED` compartilhado) e
  `backend/src/graphql/prisma-errors.ts` (traduz `P2002`/`P2003` do Prisma pra `GraphQLError` com
  `CONFLICT`, e um helper `NOT_FOUND`).
- Ownership check: `update`/`delete` usam `updateMany`/`deleteMany` com
  `where: { id, userId }` e checam `count === 0` → `NOT_FOUND` — uma query só, sem
  select-then-update, não revela se o registro existe pra outro usuário.
- `createTransaction`/`updateTransaction` verificam a categoria com `findFirst({ id, userId })`
  antes de gravar — a FK do SQLite só garante que a categoria existe, não que é do usuário; sem
  esse check um usuário linkaria transação a categoria alheia.
- `deleteCategory` traduz a violação de FK (`Transaction.categoryId` é `onDelete: Restrict`) pra
  `CONFLICT` com mensagem amigável, em vez de vazar o erro cru do SQLite.
- `backend/src/graphql/test-helpers.ts`: `graphqlRequest`/`createTestUser` compartilhados entre
  os 3 arquivos de teste de resolver (auth, categoria, transação) — antes duplicados.
- 25 testes no total (17 novos de domínio): criar/listar/editar/apagar categoria e transação,
  nome duplicado, categoria com transação vinculada, categoria/transação de outro usuário negada
  em update e delete, listagem só retorna o que é do usuário, entrada inválida (nome vazio, valor
  não positivo) rejeitada.
- Lint, typecheck, 25 testes e build aprovados. Smoke test manual do servidor real: signup →
  criar categoria → criar transação → listar transações/categorias, tudo com o token do usuário.

## Fora de escopo

- UI — [Task 006](006-frontend-features.md).
- Regras de negócio além do CRUD (ex.: saldo agregado, relatórios) — só se aparecerem no Figma
  como parte das 6 páginas obrigatórias.
