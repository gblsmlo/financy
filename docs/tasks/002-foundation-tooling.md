# Task 002 — Fundação e tooling do back-end

## Objetivo

Back-end mínimo executável: TypeScript, Prisma + SQLite, Fastify + Mercurius (GraphQL), schema
de dados inicial, CORS e variáveis de ambiente validadas.

## Critérios de aceite

- [ ] Prisma configurado (`schema.prisma`, `DATABASE_URL` para SQLite, `prisma migrate`).
- [ ] Modelos: `User`, `Category`, `Transaction` (transação pertence a usuário e a categoria;
      categoria pertence a usuário) — ajustar campos exatos ao inspecionar o Figma na Fase 5.
- [ ] Fastify bootstrap com `mercurius` registrado, endpoint `/graphql` respondendo a uma query
      trivial (ex.: health).
- [ ] CORS habilitado via `@fastify/cors` (ver ADR 002).
- [ ] `backend/.env.example` com `JWT_SECRET` e `DATABASE_URL`.
- [ ] Schema Zod de ambiente (`ServerEnv`) validando as duas chaves obrigatórias no boot.
- [ ] `bun run dev`, `bun run build`, `bun run typecheck`, `bun run test` passando no back-end.

## Evidências

(preencher ao concluir)

## Fora de escopo

- Autenticação real — [Task 003](003-auth-betterauth.md).
- Resolvers de domínio (transação/categoria) — [Task 004](004-domain-api.md).
