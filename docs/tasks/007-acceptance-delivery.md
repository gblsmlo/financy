# Task 007 — Aceitação e entrega

## Objetivo

Checklist do desafio 100% batido, repositório pronto pro envio na plataforma.

## Critérios de aceite

- [ ] Todos os 24 itens do checklist da plataforma (`requirements.md`) marcados como concluídos.
- [x] `backend/` e `frontend/` contêm cada um a resolução completa e independente.
- [x] Repositório GitHub público — https://github.com/gblsmlo/financy.
- [x] `README.md` raiz com passo a passo de instalação/execução local, sem menção ao projeto
      anterior — o passo a passo foi conferido a partir de uma cópia limpa dos `.env.example`
      (ver bloqueador 4 da [auditoria](../bugs/audit-fase-6.md)).
- [x] Lint, typecheck e testes passando em ambos os workspaces — 57 testes (30 back-end,
      26 front-end, 1 de `test/`).
- [ ] Link do repositório pronto pra envio na plataforma (dentro do período 28/08/26–11/09/26).
- [x] Funcionalidades extras (se implementadas) isoladas em branch separada, fora da `main` —
      nenhuma implementada até aqui.

## Evidências

- Auditoria dos requisitos das Fases 0–5 em [audit-fase-6](../bugs/audit-fase-6.md): os 10
  requisitos funcionais verificados contra a API real, os 4 bloqueadores de entrega resolvidos.
- `bun run lint`, `bun run typecheck`, `bun run test` (57), `bun run build` aprovados na raiz.
- Repositório público criado e `origin` reapontado — apontava pro repositório do Brev.ly.
  `main` estava parada no último commit do projeto anterior; fast-forward pro Financy.

## Pendente

- [ ] Revisão visual contra o Figma ao vivo (FR-12) — a ressalva da
      [Task 006](006-frontend-features.md) continua valendo.
- [ ] Envio do link na plataforma (janela 28/08/26–11/09/26).

## Fora de escopo

- Deploy ao vivo (ver decisão registrada na sessão de planejamento em `PROGRESS.md`).
