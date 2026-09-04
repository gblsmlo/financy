# Requisitos — Financy

Rastreabilidade entre o enunciado do desafio (Rocketseat, Expansão de Habilidades — TD-360) e a
implementação. Fonte: plataforma da Rocketseat, lida em 2026-09-03.

Link do desafio: https://ftr.rocketseat.com.br/projects/td-360-desafio-pratico-da-fase-3-financy
Figma: https://www.figma.com/community/file/1580994817007013257

## Funcionais (back-end e front-end)

| # | Requisito | Fase | Status |
| --- | --- | --- | --- |
| FR-01 | Usuário pode criar conta e fazer login | 003 | Planejado |
| FR-02 | Usuário só vê/gerencia suas próprias transações e categorias | 004 | Planejado |
| FR-03 | Criar transação | 004 | Planejado |
| FR-04 | Deletar transação | 004 | Planejado |
| FR-05 | Editar transação | 004 | Planejado |
| FR-06 | Listar todas as transações | 004 | Planejado |
| FR-07 | Criar categoria | 004 | Planejado |
| FR-08 | Deletar categoria | 004 | Planejado |
| FR-09 | Editar categoria | 004 | Planejado |
| FR-10 | Listar todas as categorias | 004 | Planejado |
| FR-11 | Front-end usa GraphQL para consultar a API, Vite como bundler | 005 | Planejado |
| FR-12 | Front-end segue o mais fielmente possível o layout do Figma | 006 | Planejado |

## Não funcionais — back-end

| # | Requisito | Fase | Status |
| --- | --- | --- | --- |
| NFR-01 | TypeScript | 002 | Concluído |
| NFR-02 | GraphQL | 002 | Concluído |
| NFR-03 | Prisma | 002 | Concluído |
| NFR-04 | SQLite (Postgres é opção, não obrigatório) | 002 | Concluído |
| NFR-05 | CORS habilitado | 002 | Concluído |
| NFR-06 | `.env.example` com `JWT_SECRET` e `DATABASE_URL` | 002 | Concluído |

## Não funcionais — front-end

| # | Requisito | Fase | Status |
| --- | --- | --- | --- |
| NFR-07 | TypeScript | 005 | Planejado |
| NFR-08 | React | 005 | Planejado |
| NFR-09 | Vite sem framework | 005 | Planejado |
| NFR-10 | GraphQL | 005 | Planejado |
| NFR-11 | `.env.example` com `VITE_BACKEND_URL` | 005 | Planejado |

## Flexíveis (adotados — ver [ADR 004](decisions/004-frontend-data-layer.md))

TailwindCSS, Shadcn, React Query, React Hook Form, Zod.

## Entrega

| # | Requisito | Fase | Status |
| --- | --- | --- | --- |
| DL-01 | Repositório público no GitHub | 007 | Planejado |
| DL-02 | Subpastas `backend/` e `frontend/` com a resolução completa | 001 | Pastas criadas — conteúdo pendente |
| DL-03 | Funcionalidades extras (ex.: upload de avatar) fora da branch principal | — | Não-goal |

## Fora de escopo (herdado do projeto anterior, não se aplica ao Financy)

CSV export, Cloudflare R2, deploy ao vivo, domínio de encurtamento de links.
