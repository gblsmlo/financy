# Task 001 — Limpeza do projeto anterior (Brev.ly)

## Objetivo

Remover código, config e nomenclatura do Brev.ly, deixando um esqueleto neutro pronto pra
receber a stack e o domínio do Financy.

## Critérios de aceite

- [x] `server/` renomeado para `backend/`, `web/` renomeado para `frontend/` (workspaces do
      `package.json` raiz atualizados).
- [x] Removido código de domínio do encurtador de links: componentes, hooks, actions HTTP,
      contracts, repositories, use-cases, rotas e testes referentes a `links`.
- [x] Removida infra específica do Brev.ly: `infra/dev/compose.yml`, `compose.test.yml`,
      adapter/serviço Cloudflare R2, dependência `@aws-sdk/client-s3`.
- [x] `README.md` raiz reescrito: nome Financy, descrição do domínio (transações/categorias),
      sem menções a link/URL curta/CSV/CDN.
- [x] `package.json` raiz e dos workspaces sem `brev-ly`/`brevly` em nome, descrição ou scripts
      específicos do domínio antigo (`test:db:*`, `infra:*`).
- [x] Nenhuma ocorrência de `brev` (case-insensitive) sobrando fora do histórico do git.
- [x] `AGENTS.md` revisado — decisões específicas do domínio antigo (Result Pattern, handler
      layer) removidas; arquitetura nova documentada por fase, à medida que for implementada.
- [x] Lockfile regenerado, `bun install` limpo.

## Evidências

- `bun install` — lockfile salvo, "Removed: 2" (drizzle-kit e @aws-sdk/client-s3 saíram do grafo).
- `bun run lint` — 17 arquivos verificados, sem erros.
- `bun run typecheck` — `tsc -b` sem erros (referências raiz corrigidas para `backend`/`frontend`).
- `bun run test` — 1 teste aprovado (`test/setup.test.ts`).
- `bun run build` — `backend` (bundle bun) e `frontend` (build Vite) aprovados.
- `grep -rniE "brev" .` (fora de `node_modules`, `.git`, `bun.lock`) só retorna menções
  históricas nas próprias docs desta fase (`PROGRESS.md`, ADR 001, este arquivo).

## Fora de escopo

- Implementação de qualquer funcionalidade do Financy — isso começa na [Task 002](002-foundation-tooling.md).
- Decisão de manter ou não o padrão `route -> handler -> use-case` — revisitada na Fase 1 junto
  com a escolha de Mercurius (ADR 002).
