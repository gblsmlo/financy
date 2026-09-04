# Progresso do Financy

## Estado atual

**Fase 2 — Auth (BetterAuth)** (não iniciada)

## Fases

| Fase | Tarefa | Estado |
| --- | --- | --- |
| 0. Limpeza do Brev.ly | [001](tasks/001-cleanup-brevly.md) | Concluída |
| 1. Fundação e tooling | [002](tasks/002-foundation-tooling.md) | Concluída |
| 2. Auth (BetterAuth) | [003](tasks/003-auth-betterauth.md) | Não iniciada |
| 3. API de domínio (transações/categorias) | [004](tasks/004-domain-api.md) | Não iniciada |
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
- Próxima ação: Fase 2 — BetterAuth (validar handler genérico sob Fastify/Bun primeiro; ver
  risco técnico no [ADR 003](decisions/003-auth-betterauth.md)).
