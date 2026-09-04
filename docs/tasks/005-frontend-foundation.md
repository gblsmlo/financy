# Task 005 — Fundação do front-end

## Objetivo

SPA React + Vite + TypeScript executável, com camada de dados GraphQL e roteamento das 6 páginas
+ 2 modais previstos no desafio, ainda sem fidelidade visual completa ao Figma.

## Critérios de aceite

- [x] Vite + React + TypeScript, sem framework SSR.
- [x] `@tanstack/react-router` configurado (ver ADR 005).
- [x] TailwindCSS + Shadcn configurados (ver ADR 004).
- [x] `graphql-request` + `@tanstack/react-query` configurados, cliente apontando pra
      `VITE_BACKEND_URL`.
- [x] `graphql-codegen` gerando tipos das operações a partir do schema do back-end.
- [x] Roteamento cobrindo as páginas do desafio: raiz (`/`) com tela de login quando deslogado e
      dashboard quando logado, mais as demais páginas identificadas no Figma.
- [x] Estrutura de rota protegida — páginas de domínio inacessíveis sem sessão válida.
- [x] `frontend/.env.example` com `VITE_BACKEND_URL`.
- [x] Style Guide do Figma (cores, tipografia, espaçamento) traduzido pra tokens Tailwind/tema
      Shadcn.
- [x] `bun run dev`, `bun run build`, `bun run typecheck` passando no front-end.

## Referência — inventário do Figma

Duplicata do arquivo original (community file exige login pra abrir de verdade) inspecionada com
Claude in Chrome em 2026-09-04. Páginas em "Projeto" (grupo "Páginas" + "Acesso" no Figma):

| Rota | Frame no Figma | Autenticado? |
| --- | --- | --- |
| `/login` | Acesso → Login | Não (redireciona pra `/` se já logado) |
| `/cadastro` | Acesso → Cadastro | Não |
| `/` | Páginas → Dashboard | Sim |
| `/transacoes` | Páginas → Transações | Sim |
| `/categorias` | Páginas → Categorias | Sim |
| `/perfil` | Páginas → Perfil | Sim |

2 modais (frame "Overlay > Modal" dentro do grupo "Gestão" no Figma):
- **Nova transação** — toggle Despesa/Receita, Descrição, Data + Valor (2 col), Categoria
  (select), Salvar. Ver `CreateTransactionInput` no schema GraphQL.
- **Nova/Editar categoria** — Título, Descrição (opcional), Ícone (grade de 14), Cor (7 swatches
  fixos), Salvar. Ver `CategoryInput`/`CategoryColor` no schema GraphQL.

Style Guide (página "🎨 Style Guide" no Figma):
- Fonte: Inter (Google Fonts), sem type scale customizado além disso.
- Paleta: escala padrão do Tailwind pra blue/purple/pink/red/orange/yellow/green (dark=700,
  base=600, light=100) + gray (100–800, valores batem com o gray do Tailwind) + preto/branco.
  Marca (verde) é custom: `brand-dark #124B2B`, `brand-base #1F6F43`. Feedback:
  `danger #EF4444`, `success #19AD70`.
- Componentes documentados: Input (estados empty/active/filled/error/disabled/select), botões,
  chips/tags — servem de referência visual pra Task 006, não exigem token novo além da paleta
  acima.

Dashboard, Transações e Categorias mostram totais/filtros (saldo total, receitas/despesas do mês,
busca, tipo, categoria, período, paginação) — tudo computado no front (Task 006) em cima das
listas completas que `transactions`/`categories` já retornam; não precisou mudar o schema GraphQL
pra isso (ver adendo em [Task 004](004-domain-api.md)).

## Evidências

- `frontend/vite.config.ts`: plugin do TanStack Router (`autoCodeSplitting`, gera
  `routeTree.gen.ts` — gitignored, regenerado a cada `dev`/`build`) + `@tailwindcss/vite`.
- `frontend/src/styles.css`: `@theme` do Tailwind v4 (CSS-first, sem `tailwind.config.js`) só com
  os tokens que não são o default do Tailwind — `brand-dark`/`brand-base`/`success`/`danger` —
  ver inventário do Figma acima. Fonte Inter carregada via Google Fonts no `index.html`.
- Componentes em `frontend/src/components/ui/` seguem a convenção do shadcn (Radix + `cva` +
  `cn`) escritos à mão — sem `components.json`/CLI, que pede prompt interativo; mais componentes
  entram conforme a Task 006 precisar (select, dialog, tabs, checkbox já instalados como
  dependência, ainda sem wrapper).
- `frontend/src/lib/graphql-client.ts`: `GraphQLClient` (graphql-request) singleton apontando pra
  `${VITE_BACKEND_URL}/graphql`; token Bearer fica em `localStorage`
  (`frontend/src/lib/auth-token.ts`) e é aplicado via `client.setHeader`/`setHeaders({})` — não
  precisou de middleware dinâmico.
- `backend/src/print-schema.ts` (script `schema:print`) exporta `typeDefs` pro arquivo
  `backend/schema.graphql`, versionado — evita o codegen do front depender do back-end rodando.
  `frontend/codegen.ts` usa o preset `client` do graphql-codegen contra esse arquivo; saída em
  `frontend/src/gql/` (gitignored, `bun run codegen` na raiz regenera os dois passos).
- Sessão: `frontend/src/features/auth/session.ts` (`useQuery` na query `me`, tratando o erro
  `UNAUTHENTICATED` como "sem sessão" em vez de erro) + rotas `_authenticated`/`_guest`
  (layouts sem path do TanStack Router) fazendo `beforeLoad` com
  `queryClient.ensureQueryData` — protegido redireciona pra `/login` sem sessão, guest
  redireciona pra `/` com sessão.
- `/` não é literalmente a mesma URL pro logado e pro deslogado — desloga redireciona pra
  `/login` (padrão de SPA), não mostra o formulário embutido na raiz. Atende a intenção funcional
  do critério; ver [ADR 005](../decisions/005-frontend-router.md).
- Smoke test end-to-end no browser real (back-end + front-end rodando via
  `mcp__Claude_Browser__preview_start`): cadastro → dashboard com dado real → navegação entre as
  4 páginas autenticadas sem reload → editar nome no Perfil → logout → redireciona pro login →
  login de novo funciona → acessar `/login` autenticado bate de volta pra `/`. Zero erros no
  console do browser.
- Lint, typecheck e build (`tsc -b && vite build`) aprovados nos dois workspaces.

## Fora de escopo

- Conteúdo/fidelidade visual completa de cada página — [Task 006](006-frontend-features.md).
- Formulários de transação/categoria — Task 006.
