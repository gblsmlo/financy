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

## Adendo — achados do Figma (fidelidade visual, FR-12)

Duplicata do Figma inspecionada (ver [Task 005](005-frontend-foundation.md)) depois desta task já
"concluída". Dois achados batiam direto no schema/resolvers já escritos aqui, corrigidos no mesmo
dia:

- O modal "Nova categoria" tem ícone (14 opções) e cor (7 opções fixas) além de nome e descrição
  opcional — `Category` ganhou `icon: String!`, `color: CategoryColor!` (enum
  BLUE/PURPLE/PINK/RED/ORANGE/YELLOW/GREEN) e `description: String?`.
  `createCategory`/`updateCategory` passaram a receber `CategoryInput` em vez de argumentos soltos.
- A página "Perfil" edita nome e tem botão de sair — não existia mutation pra isso. Adicionado
  `updateProfile(name)` (via `auth.api.updateUser`) e `logout` (via `auth.api.signOut`) em
  `backend/src/graphql/account/`.

Migration `20260904224543_category_icon_color_description`. 5 testes novos (3 categoria com
ícone/cor, 2 account). Filtro/busca/paginação da página de Transações e os totais do Dashboard
ficam por conta do front (Task 006) computados em cima das listas completas que `transactions`/
`categories` já retornam — sem paginação, dataset pessoal pequeno, sem necessidade de mudar o
schema GraphQL pra isso.

**Pegadinha de schema encontrada nos testes:** `Transaction.categoryId` é `onDelete: Restrict`
enquanto `Category.userId`/`Transaction.userId` são `onDelete: Cascade`. Apagar um `User` que
ainda tem transação vinculada a uma categoria pode falhar com violação de FK — o SQLite checa
cada FK conforme a linha é apagada dentro do cascade, não no fim da operação inteira, então nada
garante que a Transaction some antes da Category ser cascade-apagada. Não afeta nenhum resolver
hoje (não existe "apagar conta"), mas pegou a limpeza dos testes (`prisma.user.deleteMany()` direto).
Resolvido com `resetDatabase()` em `test-helpers.ts`, que apaga na ordem certa
(Transaction → Category → User) em vez de contar com o cascade. Se um dia existir "apagar conta",
mesma ordem manual vai ser necessária no resolver.

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
