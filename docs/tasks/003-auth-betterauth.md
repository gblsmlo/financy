# Task 003 — Autenticação com BetterAuth

## Objetivo

Cadastro e login funcionais via BetterAuth, com sessão/token utilizável pelos resolvers GraphQL
para restringir dados ao usuário autenticado.

## Critérios de aceite

- [x] Validado o risco técnico do [ADR 003](../decisions/003-auth-betterauth.md) — decisão
      revisada: nenhuma rota HTTP do BetterAuth é montada no Fastify, `signup`/`login` chamam
      `auth.api.signUpEmail`/`signInEmail` diretamente (API programática server-side).
- [x] BetterAuth configurado com adapter Prisma e `secret` (mapeado de `JWT_SECRET`) + plugin
      `bearer` — ver correção no ADR 003 (não é o plugin `jwt`).
- [x] Mutations GraphQL `signup` e `login` expostas, retornando `{ token, user }`.
- [x] Contexto GraphQL (`context` do Mercurius) resolve o usuário autenticado a partir do header
      `Authorization: Bearer <token>` em cada requisição (`auth.api.getSession`).
- [ ] Resolvers de domínio (Task 004) recusam acesso sem usuário autenticado — mecanismo
      (`context.user`) pronto aqui; a aplicação em transação/categoria é da Task 004.
- [x] Testes cobrindo: cadastro com sucesso, e-mail duplicado, login com credenciais corretas e
      incorretas, acesso negado a resolver protegido sem token (`me`, usado como resolver de
      prova antes da Task 004 existir).

## Evidências

- Schema Prisma ganhou `Session`, `Account`, `Verification` seguindo o core schema do BetterAuth
  1.7.2 (ver [ADR 003](../decisions/003-auth-betterauth.md)); migration
  `20260904193202_add_betterauth_tables` aplicada.
- `backend/src/auth.ts`, `backend/src/prisma.ts` (client + adapter libsql), `backend/src/graphql/{type-defs,resolvers,context}.ts`.
- `backend/src/graphql/resolvers.test.ts` — 6 testes: signup ok, e-mail duplicado, login ok,
  login errado, `me` sem token (nega), `me` com token (autoriza).
- `bun run lint` / `typecheck` / `test` (8 testes, incluindo Fase 1) / `build` — todos aprovados.
- Smoke test manual do servidor real: signup → token → `me` autoriza; sem token → nega
  (`UNAUTHENTICATED`).
- Dois bugs de ambiente encontrados e documentados nos ADRs 001 e 002 (driver adapter do Prisma
  sob Bun; incompatibilidade `graphql@17` × `mercurius@16`).
- Banco de teste: `bun test --isolate` roda os testes por arquivo em módulos isolados, o que
  quebrou a abordagem inicial de migrar o banco de teste importando o Prisma Client dentro do
  próprio preload (as tabelas ficavam invisíveis pros arquivos de teste mesmo com o path do
  SQLite correto). Resolvido rodando `prisma migrate deploy` como processo filho real no preload
  (`test/setup.ts`), banco fixo em `backend/prisma/test.db`, em vez de importar o client Prisma
  ali.

## Fora de escopo

- OAuth/social login — não é requisito do desafio.
- Recuperação de senha, verificação de e-mail — fora do escopo obrigatório.
