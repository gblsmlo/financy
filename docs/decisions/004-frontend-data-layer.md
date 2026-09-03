# ADR 004 — graphql-request + React Query no front-end

## Contexto

O enunciado exige GraphQL no front-end para consultar a API; lista TailwindCSS, Shadcn, React
Query, React Hook Form e Zod como flexíveis (não obrigatórias, mas permitidas).

## Decisão

- Cliente GraphQL: `graphql-request` (envio de queries/mutations) + `@tanstack/react-query`
  (cache, estado de loading/erro, invalidação).
- Tipagem: `graphql-codegen` gerando tipos das operações a partir do schema do back-end.
- UI: TailwindCSS + Shadcn.
- Formulários: React Hook Form + Zod (transação, categoria, login, cadastro).

## Alternativas consideradas

- **Apollo Client:** cache normalizado embutido, mas duplica o que o React Query já resolve;
  configuração própria mais pesada para um projeto do porte do desafio.
- **urql:** meio-termo, mas menos comum no mercado que Apollo, sem vantagem clara aqui.
- **Sem as libs flexíveis (vanilla):** descartado — todas foram aceitas explicitamente para
  reduzir código boilerplate de formulário e cache.

## Consequências

- `VITE_BACKEND_URL` do `.env.example` aponta pro endpoint `/graphql` do back-end.
- Cada tela usa hooks de React Query (`useQuery`/`useMutation`) chamando `graphql-request`.
- Codegen roda contra o schema GraphQL do back-end — precisa do back-end rodando (ou de um
  arquivo de schema exportado) antes de gerar os tipos do front-end.
