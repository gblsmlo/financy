# Task 005 — Fundação do front-end

## Objetivo

SPA React + Vite + TypeScript executável, com camada de dados GraphQL e roteamento das 6 páginas
+ 2 modais previstos no desafio, ainda sem fidelidade visual completa ao Figma.

## Critérios de aceite

- [ ] Vite + React + TypeScript, sem framework SSR.
- [ ] TailwindCSS + Shadcn configurados (ver ADR 004).
- [ ] `graphql-request` + `@tanstack/react-query` configurados, cliente apontando pra
      `VITE_BACKEND_URL`.
- [ ] `graphql-codegen` gerando tipos das operações a partir do schema do back-end.
- [ ] Roteamento cobrindo as páginas do desafio: raiz (`/`) com tela de login quando deslogado e
      dashboard quando logado, mais as demais páginas identificadas no Figma.
- [ ] Estrutura de rota protegida — páginas de domínio inacessíveis sem sessão válida.
- [ ] `frontend/.env.example` com `VITE_BACKEND_URL`.
- [ ] Style Guide do Figma (cores, tipografia, espaçamento) traduzido pra tokens Tailwind/tema
      Shadcn.
- [ ] `bun run dev`, `bun run build`, `bun run typecheck` passando no front-end.

## Evidências

(preencher ao concluir)

## Fora de escopo

- Conteúdo/fidelidade visual completa de cada página — [Task 006](006-frontend-features.md).
- Formulários de transação/categoria — Task 006.
