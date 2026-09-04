# Task 002 — Fundação e tooling do back-end

## Objetivo

Back-end mínimo executável: TypeScript, Prisma + SQLite, Fastify + Mercurius (GraphQL), schema
de dados inicial, CORS e variáveis de ambiente validadas.

## Critérios de aceite

- [x] Prisma configurado (`schema.prisma`, `DATABASE_URL` para SQLite, `prisma migrate`).
- [x] Modelos: `User`, `Category`, `Transaction` (transação pertence a usuário e a categoria;
      categoria pertence a usuário) — ajustar campos exatos ao inspecionar o Figma na Fase 5.
- [x] Fastify bootstrap com `mercurius` registrado, endpoint `/graphql` respondendo a uma query
      trivial (health).
- [x] CORS habilitado via `@fastify/cors` (ver ADR 002).
- [x] `backend/.env.example` com `JWT_SECRET` e `DATABASE_URL`.
- [x] Schema Zod de ambiente (`ServerEnv`) validando as duas chaves obrigatórias no boot.
- [x] `bun run dev`, `bun run build`, `bun run typecheck`, `bun run test` passando no back-end.

## Evidências

- `bunx prisma migrate dev --name init` — criou `dev.db` e
  `prisma/migrations/20260904192212_init/migration.sql` com `User`, `Category`, `Transaction`.
- `bunx prisma generate` — client gerado em `backend/src/generated/prisma` (ignorado no git e
  no biome; ver `.gitignore` e `biome.json`).
- `bun run lint` / `bun run typecheck` / `bun run test` (2 testes) / `bun run build` — todos
  aprovados na raiz do monorepo.
- Smoke test manual: `bun --env-file=.env src/server.ts` + `curl -X POST /graphql -d
  '{"query":"{ health { status } }"}'` → `{"data":{"health":{"status":"ok"}}}`.
- `backend/src/http/app.test.ts` cobre a mesma query via `app.inject`.

### Nota técnica — Prisma CLI e `.env`

`prisma.config.ts` não carrega `.env` sozinho; precisa de `import 'dotenv/config'` no topo do
arquivo (dependência `dotenv` adicionada como devDependency do back-end). Sem isso,
`prisma migrate`/`generate` falham com "datasource.url property is required" mesmo com
`DATABASE_URL` presente no `.env`.

### Nota — skills geradas pelo `prisma init`

O `prisma init` cria por padrão `.claude/skills`, `.windsurf/skills`, `.agents/skills` e
`skills-lock.json` (documentação da Prisma para agentes de IA). Removidos por não serem pedidos
pelo desafio e não fazerem parte do código do projeto.

## Fora de escopo

- Autenticação real — [Task 003](003-auth-betterauth.md).
- Resolvers de domínio (transação/categoria) — [Task 004](004-domain-api.md).
