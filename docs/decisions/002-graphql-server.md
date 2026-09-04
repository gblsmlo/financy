# ADR 002 — Fastify + Mercurius

## Contexto

O enunciado exige GraphQL no back-end. O projeto anterior já usa Fastify como servidor HTTP
(CORS configurado, composition root, testes com `app.inject`).

## Decisão

Adotar `mercurius` como plugin GraphQL sobre o Fastify existente, em vez de trocar para Apollo
Server standalone.

## Alternativas consideradas

- **Apollo Server standalone:** mais comum em tutoriais, mas descarta o bootstrap Fastify já
  presente (CORS, composition root, `app.inject` nos testes) e exige montá-lo via middleware
  Express-like ou reescrever o servidor do zero.

## Consequências

- CORS continua configurado via `@fastify/cors`, sem duplicar no Apollo.
- O contrato GraphQL (schema + resolvers) fica isolado do transporte Fastify, mesmo plugin nele
  registrado.
- Testes de resolver continuam podendo usar `app.inject` contra o endpoint `/graphql`.

## Pegadinha — versão do pacote `graphql`

`mercurius@16.10.0` declara `peerDependencies.graphql: "^16.0.0"`. Instalar `graphql@17` (latest
na época) quebra silenciosamente sob Bun: o `require('graphql')` interno do mercurius
(`lib/errors.js`, só executado ao formatar um erro GraphQL) lança
`TypeError: require() async module ... is unsupported` porque o pacote `graphql@17` é ESM-only.
Isso não aparece em queries que nunca erram (ex.: `health`), só quando um resolver lança
`GraphQLError` — passou despercebido até os testes de auth da [Task 003](../tasks/003-auth-betterauth.md),
que testam erro de propósito. Fixar `graphql` em `16.x` (pin exato, não `^`) resolve.
