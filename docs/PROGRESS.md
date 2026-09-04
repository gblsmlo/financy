# Progresso do Financy

## Estado atual

**Fase 4 — Fundação do front-end** (não iniciada)

## Fases

| Fase | Tarefa | Estado |
| --- | --- | --- |
| 0. Limpeza do Brev.ly | [001](tasks/001-cleanup-brevly.md) | Concluída |
| 1. Fundação e tooling | [002](tasks/002-foundation-tooling.md) | Concluída |
| 2. Auth (BetterAuth) | [003](tasks/003-auth-betterauth.md) | Concluída |
| 3. API de domínio (transações/categorias) | [004](tasks/004-domain-api.md) | Concluída |
| 4. Fundação do front-end | [005](tasks/005-frontend-foundation.md) | Não iniciada |
| 5. Páginas e features do front-end | [006](tasks/006-frontend-features.md) | Não iniciada |
| 6. Aceitação e entrega | [007](tasks/007-acceptance-delivery.md) | Não iniciada |

## Registro de sessões

### 2026-09-03 — Planejamento

- Lidos os requisitos do desafio na plataforma da Rocketseat (enunciado, checklist, Figma).
- Identificado que o repositório inteiro era o projeto anterior (Brev.ly — encurtador de link):
  nome, stack (Fastify + Drizzle + Postgres + REST) e domínio não batem com o Financy.
- Confirmado com o usuário: reescrita completa de stack e domínio, não só troca de nome.
- Decisões de arquitetura fechadas e registradas nos ADRs 001–004.
- Apagadas as docs do projeto anterior (`decisions/`, `tasks/`, `architecture.md`,
  `testing.md`, `environment.md`, `api-contract.md`, `IMPLEMENTATION.md`, `test-plan.md`) —
  serão recriadas por fase, conforme cada uma for implementada.
- `requirements.md` e este arquivo recriados para o Financy.
- Plano de fases criado em `docs/tasks/001` a `007`.

### 2026-09-03 — Fase 0: limpeza do Brev.ly

- `server/` → `backend/`, `web/` → `frontend/` (histórico git preservado via `git mv`).
- Removido todo código de domínio do encurtador de links (contracts, repositories, use-cases,
  handlers, rotas, componentes, hooks, actions HTTP) e a infra do Brev.ly (Postgres dev/test via
  Docker, adapter Cloudflare R2, `@aws-sdk/client-s3`).
- `backend/src` e `frontend/src` reduzidos a um placeholder mínimo (`server.ts` / `main.tsx`) só
  pra manter `build`/`typecheck` verdes até a Fase 1.
- `package.json` (raiz, `backend`, `frontend`), `README.md`, `AGENTS.md`, `Dockerfile`,
  `.env.example` (backend/frontend/test) e `tsconfig.json` raiz atualizados pro Financy.
- `bun install`, `bun run lint`, `bun run typecheck`, `bun run test` e `bun run build` aprovados
  no esqueleto limpo. Evidências completas em [Task 001](tasks/001-cleanup-brevly.md).

### 2026-09-04 — Fase 1: fundação e tooling do back-end

- `backend/prisma/schema.prisma`: modelos `User`, `Category`, `Transaction` (+ enum
  `TransactionType`), SQLite, generator `prisma-client` gerando em `backend/src/generated/prisma`
  (gitignored).
- Primeira migration (`prisma/migrations/20260904192212_init`) criada e aplicada.
- `backend/src/env-schema.ts` valida `JWT_SECRET`/`DATABASE_URL` (obrigatórias) e
  `CORS_ORIGIN`/`NODE_ENV`/`PORT` (com default) no boot.
- `backend/src/http/app.ts`: Fastify + `@fastify/cors` + `mercurius`, schema GraphQL mínimo
  (`Query.health`) em `backend/src/graphql/schema.ts`.
- Corrigido: `prisma.config.ts` gerado pelo `prisma init` não carrega `.env` sozinho — precisa
  de `import 'dotenv/config'` no topo, senão `prisma migrate`/`generate` falham mesmo com
  `DATABASE_URL` setado.
- Removidas as skills de IA que o `prisma init` instala por padrão
  (`.claude/skills`, `.windsurf/skills`, `.agents/skills`, `skills-lock.json`) — não fazem parte
  do código do desafio.
- `test/env-schema.ts` ganhou `DATABASE_URL`/`JWT_SECRET` (valores fixos de teste) pra
  `createServerEnv()` não quebrar nos testes.
- `biome.json` passou a ignorar `backend/src/generated` (client Prisma é código gerado).
- Lint, typecheck, 2 testes e build aprovados na raiz. Smoke test manual do servidor real
  confirmou `POST /graphql { health { status } }` → `{"data":{"health":{"status":"ok"}}}`.
  Evidências completas em [Task 002](tasks/002-foundation-tooling.md).

### 2026-09-04 — Fase 2: auth com BetterAuth

- Revisado o risco técnico do ADR 003 lendo o código fonte do BetterAuth: descartado montar rota
  HTTP no Fastify **e** descartado o plugin `jwt` (usa JWKS próprio, não uma secret
  compartilhada). Decisão final: API programática (`auth.api.signUpEmail/signInEmail/getSession`)
  + `secret` nativo (mapeado de `JWT_SECRET`) + plugin `bearer`. ADR 003 reescrito.
  Prisma schema ganhou `Session`/`Account`/`Verification` seguindo o core schema exato do
  BetterAuth 1.7.2; migration `20260904193202_add_betterauth_tables`.
- Mutations `signup`/`login` e query `me` (protegida) em
  `backend/src/graphql/{type-defs,resolvers,context}.ts`; contexto do Mercurius resolve
  `context.user` via `auth.api.getSession` a partir do header `Authorization`.
- 3 bugs de ambiente encontrados e corrigidos, documentados nos ADRs 001–002 e na
  [Task 003](tasks/003-auth-betterauth.md):
  1. O client `prisma-client` (Prisma 7) exige um driver adapter explícito — `@prisma/adapter-better-sqlite3`
     não roda sob Bun (`ERR_DLOPEN_FAILED`); trocado por `@prisma/adapter-libsql`.
  2. `mercurius@16.10.0` só suporta `graphql@^16`; `graphql@17` (ESM-only) quebra o
     `require('graphql')` interno do mercurius sob Bun ao formatar um erro GraphQL — só aparece
     quando um resolver realmente lança erro. Fixado `graphql` em `16.14.2`.
  3. `bun test --isolate` isola módulos por arquivo de um jeito que invalidou migrar o banco de
     teste via import do Prisma Client dentro do preload (tabelas “desapareciam” pros arquivos de
     teste mesmo com o client emitindo sucesso). Resolvido rodando `prisma migrate deploy` como
     processo filho de verdade no preload, banco de teste fixo em `backend/prisma/test.db`.
- `backend/src/graphql/resolvers.test.ts`: 6 testes (signup ok/duplicado, login ok/errado, `me`
  nega sem token / autoriza com token).
- Lint, typecheck, 8 testes (Fases 1+2) e build aprovados. Smoke test manual do servidor real:
  signup → token → `me` autoriza; sem token → `UNAUTHENTICATED`.
  Evidências completas em [Task 003](tasks/003-auth-betterauth.md).
- Próxima ação: Fase 3 — CRUD GraphQL de transações e categorias, sempre restrito ao usuário
  autenticado ([Task 004](tasks/004-domain-api.md)).

### 2026-09-04 — Fase 3: API de domínio (transações e categorias)

- Schema GraphQL de `Category`/`Transaction` + mutations `create/update/delete` e queries
  `categories`/`transactions`, em `backend/src/graphql/{categories,transactions}/`. Arquivos de
  auth renomeados (`auth-type-defs.ts`, `auth-resolvers.ts`) e combinados num `schema.ts` que
  junta type-defs (`extend type Query/Mutation`) e resolvers dos três domínios.
- Todo resolver de domínio exige `context.user` (helper `require-user.ts`, reaproveitado do `me`
  da Fase 2) e restringe leitura/escrita a `userId` do chamador. `update`/`delete` usam
  `updateMany`/`deleteMany` com `where: { id, userId }` — uma query só, `count === 0` vira
  `NOT_FOUND`, sem revelar se o registro existe pra outro usuário.
- Achado de segurança durante a escrita: a FK do SQLite em `Transaction.categoryId` só garante
  que a categoria existe — não que é do usuário. Sem checar `Category.findFirst({ id, userId })`
  antes de criar/editar uma transação, um usuário conseguiria linkar a categoria de outra pessoa.
  Adicionado o check explícito.
- Erros conhecidos do Prisma (nome de categoria duplicado, categoria com transação vinculada por
  causa do `onDelete: Restrict`) traduzidos pra `GraphQLError` com código `CONFLICT`
  (`backend/src/graphql/prisma-errors.ts`), em vez de vazar a mensagem crua do SQLite.
- Validação de entrada com Zod (nome não vazio, descrição não vazia, valor positivo, data ISO).
- `backend/src/graphql/test-helpers.ts` extraído dos testes de auth pra ser reaproveitado pelos
  3 arquivos de teste de resolver.
- 25 testes no total (17 novos): CRUD de categoria/transação, nome duplicado, categoria com
  transação vinculada, acesso de outro usuário negado em update/delete, listagem restrita ao
  dono, entrada inválida rejeitada.
- Lint, typecheck, 25 testes e build aprovados. Smoke test manual do servidor real: signup →
  criar categoria → criar transação → listar ambos, tudo autenticado.
  Evidências completas em [Task 004](tasks/004-domain-api.md).
- Próxima ação: Fase 4 — fundação do front-end (Vite + React + TypeScript, cliente GraphQL)
  ([Task 005](tasks/005-frontend-foundation.md)).
