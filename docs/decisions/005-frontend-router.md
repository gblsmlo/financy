# ADR 005 — TanStack Router

## Contexto

O enunciado pede um SPA com várias páginas (login, cadastro, dashboard, transações, categorias,
perfil) e rota protegida (páginas de domínio inacessíveis sem sessão). Nenhuma lib de roteamento
está na lista de obrigatórias nem na de flexíveis do enunciado — ADR 004 cobriu dados
(graphql-request + React Query) mas não roteamento.

## Decisão

Usar `@tanstack/react-router`.

## Alternativas consideradas

- **React Router:** mais comum no mercado, mas tipagem de rota/params é opcional e via generics
  manuais; TanStack Router tipa rota, params e search params de ponta a ponta sem gerar nada além
  do route tree.
- **Sem lib, `useState` de "página atual":** descartado — sem URL real não dá pra recarregar numa
  página específica nem compartilhar link, e o enunciado trata as páginas do Figma como rotas de
  verdade.

## Consequências

- Mesma família do React Query (TanStack) já escolhido no ADR 004 — convenções de cache/loader
  consistentes.
- Rota protegida via `beforeLoad` checando sessão (token salvo) e redirecionando pra `/login`
  quando ausente, em vez de checar dentro de cada componente de página.
- Vite plugin `@tanstack/router-plugin` gera `routeTree.gen.ts` a partir de `frontend/src/routes/`
  (arquivo já ignorado no biome.json, ver `!**/routeTree.gen.ts`).
