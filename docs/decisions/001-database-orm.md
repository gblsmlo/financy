# ADR 001 — Prisma + SQLite

## Contexto

O projeto anterior (Brev.ly) usava Drizzle + PostgreSQL. O enunciado do Financy exige Prisma
como ORM e permite SQLite ou Postgres como banco, com SQLite sendo a opção padrão do desafio.

## Decisão

Adotar Prisma como ORM e SQLite como banco. Remover Drizzle, `drizzle-kit`, `pg` e a infra Docker
de Postgres (`infra/dev/compose.yml`, `compose.test.yml`).

## Alternativas consideradas

- **Drizzle + Postgres (manter atual):** rejeitado — Prisma é requisito obrigatório do enunciado.
- **Prisma + Postgres:** válido pelo enunciado, mas exige manter Docker Compose só para o banco
  de um projeto de TCC de escopo pequeno. SQLite roda sem infra externa.

## Consequências

- Dev local não depende mais de Docker para o banco.
- `DATABASE_URL` do `.env.example` aponta para um arquivo SQLite (`file:./dev.db`).
- Migrations via `prisma migrate`.
- BetterAuth precisa do adapter Prisma (ver [ADR 003](003-auth-betterauth.md)).

## Pegadinha — driver adapter obrigatório no client, e não é `better-sqlite3`

O generator `prisma-client` do Prisma 7 (o que usamos, no lugar do clássico `prisma-client-js`)
não conecta sozinho a partir de `DATABASE_URL`: `new PrismaClient()` sem `adapter` lança
`PrismaClientInitializationError` em runtime. `prisma.config.ts` só resolve `DATABASE_URL` pra
`migrate`/`generate` (CLI); o client em `backend/src/prisma.ts` precisa do adapter explícito.

`@prisma/adapter-better-sqlite3` (a opção "óbvia") não funciona sob Bun — `better-sqlite3` é um
binding nativo que o `dlopen` do Bun ainda não carrega (`ERR_DLOPEN_FAILED`,
[oven-sh/bun#4290](https://github.com/oven-sh/bun/issues/4290)). Usamos
`@prisma/adapter-libsql` + `@libsql/client` — mesmo protocolo SQLite, roda bem em Bun, mesma
sintaxe `file:./dev.db` de `DATABASE_URL`.
