# ADR 003 — BetterAuth para autenticação

## Contexto

O enunciado exige apenas que o usuário possa criar conta e fazer login, e que `.env.example`
declare `JWT_SECRET`. Não há requisito de biblioteca específica — a escolha é livre, desde que
GraphQL, Prisma e SQLite (requisitos obrigatórios) continuem sendo respeitados.

## Decisão

Usar BetterAuth com o adapter Prisma, plugin JWT (mapeado para `JWT_SECRET`) e provider
email/senha (hash de senha embutido na lib, sem provider OAuth externo).

## Alternativas consideradas

- **JWT manual (bcrypt/argon2 + `jsonwebtoken`):** mais simples de auditar, mas o usuário pediu
  BetterAuth explicitamente.

## Risco técnico

BetterAuth não tem integração first-class para Fastify (o suporte oficial mira Next.js, Express,
Hono, SvelteKit etc.), mas expõe um handler compatível com `Request`/`Response` padrão da Web,
que dá pra montar numa rota catch-all do Fastify. Validar isso é o primeiro passo prático da
[Fase 2](../tasks/003-auth-betterauth.md) — se o handler genérico não funcionar bem com o
runtime do Fastify/Bun, revisitar esta decisão antes de seguir.

## Consequências

- `JWT_SECRET` do `.env.example` alimenta o plugin JWT do BetterAuth.
- Resolvers GraphQL protegidos leem a sessão/token do contexto, populado a partir do header
  `Authorization` em cada requisição.
- Schema de usuário no Prisma segue o formato esperado pelo adapter Prisma do BetterAuth.
