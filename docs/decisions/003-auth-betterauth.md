# ADR 003 — BetterAuth para autenticação

## Contexto

O enunciado exige apenas que o usuário possa criar conta e fazer login, e que `.env.example`
declare `JWT_SECRET`. Não há requisito de biblioteca específica — a escolha é livre, desde que
GraphQL, Prisma e SQLite (requisitos obrigatórios) continuem sendo respeitados.

## Decisão

Usar BetterAuth com o adapter Prisma, provider email/senha (hash de senha embutido na lib, sem
provider OAuth externo) e plugin `bearer` — sessão via header `Authorization: Bearer <token>`,
sem depender de cookie (adequado pra SPA + GraphQL, sem same-origin garantido).

`JWT_SECRET` alimenta o campo `secret` nativo do BetterAuth (assina sessão e cookies), não um
plugin JWT — ver correção abaixo.

Nenhuma rota HTTP do BetterAuth é montada no Fastify. `signup`/`login` são mutations GraphQL que
chamam `auth.api.signUpEmail`/`auth.api.signInEmail` (API programática server-side do BetterAuth)
diretamente; o contexto do Mercurius chama `auth.api.getSession` com os headers da requisição
pra resolver o usuário autenticado.

## Alternativas consideradas

- **JWT manual (bcrypt/argon2 + `jsonwebtoken`):** mais simples de auditar, mas o usuário pediu
  BetterAuth explicitamente.
- **Plugin `jwt` do BetterAuth** (decisão original deste ADR): descartado depois de ler o código
  fonte — o plugin `jwt` do BetterAuth 1.7.2 gera e persiste seu próprio par de chaves JWKS no
  banco (tabela `jwks`, assinatura EdDSA), sem usar nenhuma string de secret compartilhada. Não
  há como mapear `JWT_SECRET` pra ele. O campo `secret` nativo do BetterAuth (usado por padrão
  pra assinar sessão/cookie) é o análogo real de um "JWT secret" nesse projeto.
- **Montar o handler HTTP do BetterAuth numa rota catch-all do Fastify:** era o risco técnico
  original deste ADR. Descartado como desnecessário — a API programática (`auth.api.*`) resolve
  signup/login/sessão sem precisar expor nenhuma rota HTTP do BetterAuth.

## Consequências

- `JWT_SECRET` do `.env.example` vira `secret` na config do BetterAuth.
- Resolvers GraphQL protegidos leem `context.user`, populado por `auth.api.getSession` a partir
  do header `Authorization` em cada requisição.
- Schema Prisma tem `User`, `Session`, `Account`, `Verification` seguindo exatamente os nomes e
  tipos de campo do core schema do BetterAuth (`@better-auth/core/db/schema`, v1.7.2) — não são
  livres pra reformatar sem checar a versão instalada.
- Erros do BetterAuth (`APIError`) são traduzidos pra `GraphQLError` nos resolvers, com o código
  do erro em `extensions.code`.
