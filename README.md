# Financy

Aplicação full-stack para organização de finanças pessoais: gestão de transações e categorias.
TCC da Pós-Graduação Rocketseat (Expansão de Habilidades — Desafio Prático Financy).

## Estado do projeto

**Fase atual:** 0 — Limpeza e fundação.

O acompanhamento detalhado está em [docs/PROGRESS.md](docs/PROGRESS.md). A rastreabilidade entre
o enunciado do desafio e a implementação está em [docs/requirements.md](docs/requirements.md).
Decisões de arquitetura estão em [docs/decisions](docs/decisions).

## Estrutura

```text
.
├── frontend/                # React + TypeScript + Vite SPA (GraphQL)
├── backend/                 # Fastify + Mercurius (GraphQL) + Prisma + SQLite
│   └── Dockerfile
├── docs/
│   ├── decisions/           # Decisões arquiteturais (ADRs)
│   ├── tasks/                # Fases executáveis
│   ├── requirements.md
│   └── PROGRESS.md
└── README.md
```

## Requisitos locais

- Bun 1.3.14

## Configuração

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
bun install
```

As chaves obrigatórias estão documentadas nos dois arquivos `.env.example`. Segredos e arquivos
`.env` reais não devem ser versionados.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `bun run dev` | Executa back-end e front-end em modo de desenvolvimento |
| `bun run dev:backend` | Executa somente a API |
| `bun run dev:frontend` | Executa somente a SPA |
| `bun run lint` | Verifica lint e formatação |
| `bun run typecheck` | Verifica os tipos de todos os workspaces |
| `bun run test` | Executa os testes |
| `bun run test:backend` | Executa somente os testes do back-end |
| `bun run test:frontend` | Executa somente os testes do front-end |
| `bun run test:e2e` | Executa os testes end-to-end (Playwright) |
| `bun run build` | Gera os artefatos de produção |

## Escopo de correção

A branch principal preserva somente os requisitos obrigatórios do desafio. Funcionalidades extras
(ex.: upload de avatar) devem ser implementadas em uma branch separada, depois da entrega.
