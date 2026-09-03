# Convenções do repositório

Financy — TCC (Rocketseat, Expansão de Habilidades). Ver [docs/requirements.md](docs/requirements.md)
pros requisitos do desafio e [docs/PROGRESS.md](docs/PROGRESS.md) pro plano de fases.

## Stack obrigatória

- Back-end (`backend/`): TypeScript, GraphQL (Fastify + Mercurius), Prisma, SQLite.
- Front-end (`frontend/`): TypeScript, React, Vite (sem framework SSR), GraphQL.

Decisões de arquitetura registradas em [docs/decisions](docs/decisions).

## Estado

Fundação em reconstrução (ver [docs/tasks](docs/tasks)). As convenções de camadas do back-end
(rotas/resolvers, casos de uso, repositórios) e do front-end (estrutura de páginas, componentes)
serão documentadas aqui à medida que cada fase for implementada — não herdar padrões de código
já removido.
