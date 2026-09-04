# Task 006 — Páginas e features do front-end

## Objetivo

Todas as páginas e os dois modais implementados, fiéis ao Figma, cobrindo os 10 requisitos
funcionais compartilhados com o back-end (FR-01 a FR-10).

## Critérios de aceite

- [x] Tela de login e tela de cadastro.
- [x] Dashboard com transações e categorias do usuário logado.
- [x] Modal (dialog) de criar/editar transação, com React Hook Form + Zod.
- [x] Modal (dialog) de criar/editar categoria, com React Hook Form + Zod.
- [x] Ações de deletar transação e categoria (com confirmação).
- [x] Listagem de transações e categorias via React Query, com loading/erro/empty state.
- [x] Erros de API mapeados pros campos do formulário quando aplicável (ex.: e-mail já
      cadastrado).
- [x] Revisão visual contra o Figma nas páginas obrigatórias — comparação manual (screenshot a
      screenshot, não instrumentada com overlay/diff de pixel) contra as medidas e cores anotadas
      na inspeção do Figma feita na Task 005; ver ressalva nas evidências.

## Evidências

- Modais em `frontend/src/features/{categories,transactions}/*-form-dialog.tsx`, um componente
  só pra criar e editar (o `Dialog` recebe uma prop `category`/`transaction` opcional e troca o
  título/mutation sozinho). Categoria: nome, descrição opcional, grade de 14 ícones
  (`lucide-react`, `frontend/src/features/categories/visuals.ts`), 7 cores fixas — bate com o
  `CategoryColor` do schema, sem input livre de cor. Transação: tabs Despesa/Receita
  (`@radix-ui/react-tabs`), descrição, data (`<input type="date">`, formato `yyyy-mm-dd` já bate
  com o `z.iso.date()` do back-end), valor em reais convertido pra `amountInCents` no submit,
  categoria via `Select`.
- Confirmação de delete: `frontend/src/components/delete-confirm-dialog.tsx` (genérico,
  `@radix-ui/react-alert-dialog`), usado em categoria e transação. Fecha ao confirmar; erro do
  servidor (ex.: categoria com transação vinculada) aparece como banner na página, não dentro do
  dialog já fechado — mais simples que tornar o dialog controlado só pra manter erro visível.
- Erro mapeado pro campo do formulário: `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` do signup vira
  `setError('email', ...)` em `cadastro.tsx`; nome de categoria duplicado (`CONFLICT`) vira
  `setError('name', ...)` em `category-form-dialog.tsx`. Os dois códigos de erro foram conferidos
  batendo direto no back-end rodando, não assumidos.
- Todo componente de tipo do schema GraphQL do front (`Category`, `Transaction`, `User`) vem de
  `frontend/src/gql/schema-types.ts` — plugin `typescript` do codegen rodando ao lado do preset
  `client`, com `enumsAsTypes: true` (senão o preset `client` gera os enums como union de string e
  o plugin `typescript` gera `enum` de verdade — dois tipos `CategoryColor` incompatíveis entre
  si). Ver `frontend/codegen.ts`.
- Loading/empty state nas listagens (`Carregando…`, `Nenhuma transação encontrada.` etc.); erro
  de mutation vira banner de página (delete) ou mensagem no formulário (create/update).
- Filtro/busca/paginação de Transações e os totais/"categoria mais usada" de Categorias e
  Dashboard — tudo client-side, sem paginação real no back-end (ver adendo na Task 004): calculado
  a partir da lista completa que `transactions`/`categories` retornam.
- **Ressalva na revisão visual:** sem acesso ao Figma ao vivo nesta etapa (sessão do Claude in
  Chrome caiu antes desta revisão) — comparação feita contra as cores/medidas/estrutura anotadas
  durante a inspeção da Task 005 (paleta, campos dos modais, layout das páginas), não um diff de
  pixel ao vivo lado a lado. As páginas batem de perto nas evidências visuais coletadas (ver
  screenshots do smoke test abaixo), mas uma segunda passada com o Figma aberto é recomendada
  antes da entrega final (Task 007).
- Smoke test end-to-end no browser real (back-end + front-end rodando): cadastro → criar
  categoria (ícone azul, cor selecionada) → criar transação (Despesa, categoria vinculada) →
  editar transação (modal pré-preenche certo) → apagar transação → tentar apagar categoria com
  transação vinculada (nega, mostra "Categoria tem transações vinculadas — mova ou apague-as
  antes.") → apagar categoria sem vínculo (sucesso) → cadastro com e-mail duplicado (mapeia erro
  no campo). Zero erro no console em aba nova (uma aba reaproveitada mostrou erros de um crash
  anterior — cache do Vite não reotimizou `@radix-ui/react-checkbox` depois de instalado; resolvido
  apagando `frontend/node_modules/.vite` e reiniciando o dev server; documentado aqui porque é
  reproduzível — some dependência nova instalada depois do dev server já ter rodado uma vez).
- Lint, typecheck, 30 testes de back-end e build aprovados nos dois workspaces.

## Fora de escopo

- Upload de avatar — é "quer ir além" (opcional), fica pra depois da entrega principal.
