# Financy

Aplicação full-stack para organização de finanças pessoais: gestão de transações e categorias.
TCC da Pós-Graduação Rocketseat (Expansão de Habilidades — Desafio Prático Financy).

## Estado do projeto

**Fase atual:** 4 — Fundação do front-end.

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
bun run db:migrate   # cria backend/dev.db e gera o Prisma Client
bun run codegen      # gera os tipos GraphQL do front a partir do schema do back-end
```

Troque o `JWT_SECRET` do `backend/.env` por um valor gerado localmente antes de subir o
back-end — ele assina as sessões:

```bash
openssl rand -base64 32
```

As chaves de cada workspace estão documentadas nos dois arquivos `.env.example`, e o
`.env.example` da raiz lista todas num lugar só. Segredos e arquivos `.env` reais não devem ser
versionados.

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
| `bun run build` | Gera os artefatos de produção |
| `bun run codegen` | Regenera o schema exportado do back-end e os tipos GraphQL do front-end |

## Escopo de correção

A branch principal preserva somente os requisitos obrigatórios do desafio. Funcionalidades extras
(ex.: upload de avatar) devem ser implementadas em uma branch separada, depois da entrega.
