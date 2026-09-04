# Task 005 — Fundação do front-end

## Objetivo

SPA React + Vite + TypeScript executável, com camada de dados GraphQL e roteamento das 6 páginas
+ 2 modais previstos no desafio, ainda sem fidelidade visual completa ao Figma.

## Critérios de aceite

- [ ] Vite + React + TypeScript, sem framework SSR.
- [ ] `@tanstack/react-router` configurado (ver ADR 005).
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

(preencher ao concluir)

## Fora de escopo

- Conteúdo/fidelidade visual completa de cada página — [Task 006](006-frontend-features.md).
- Formulários de transação/categoria — Task 006.
