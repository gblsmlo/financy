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
