# QA — Fluxo completo no browser (2026-09-05)

Passada manual pelo app inteiro (mcp Browser embutido) antes da Fase 6, seguindo um usuário real
do zero, com back-end e front-end reais rodando (não mock). Bugs numerados por ordem de
descoberta. Severidade: 🔴 bloqueia requisito, 🟡 UX ruim mas funciona, ⚪ nit.

**Resultado:** 3 achados, nenhum 🔴. Zero erro no console do browser em toda a passada. Os 3
corrigidos no mesmo dia — ver "Correção" em cada um.

## Cobertura

Cadastro (com validação vazia e senha curta) → login → guest-guard (`/login` autenticado bate
pra `/`) → Dashboard (saldo/receitas/despesas do mês conferidos à mão contra os dados
semeados — bateu certo) → criar/editar/apagar categoria (ícone, cor, descrição, nome duplicado
bloqueado) → apagar categoria com transação vinculada (bloqueia, mostra o motivo) → criar 12
transações (via API, pra testar volume) → paginação (10 por página) → busca por descrição →
filtro por tipo → filtro por categoria → editar/apagar transação → valor negativo bloqueado →
Perfil (editar nome, e-mail travado) → logout → token inválido em rota protegida (bate pra
`/login` sozinho) → rota inexistente → voltar/avançar do browser.

Não testado: upload de avatar (fora de escopo), a real fidelidade pixel-a-pixel contra o Figma ao
vivo (ver ressalva na Task 006), e-mail de verificação/recuperação de senha (fora de escopo).

## Nota de metodologia

Duas limitações da ferramenta de automação deste browser (confirmadas lendo `input.value` via
`javascript_exec`, não só pela screenshot — a screenshot às vezes mostra um frame antigo/staleado
em relação ao DOM real, então todo estado "suspeito" foi conferido assim antes de virar bug):

- `ctrl+a`/`cmd+a` **não** seleciona o texto do campo. `type` logo depois *acrescenta* em vez de
  substituir.
- `key: "Delete"` e `key: "Backspace"` sozinhos, mesmo depois de um `triple_click` que selecionou
  o texto direitinho, **não apagam** a seleção — o valor do input continua intacto.

O único jeito confiável de limpar/substituir um campo que encontrei foi `triple_click` (seleciona
tudo) seguido de `type` com o texto novo (a digitação substitui a seleção corretamente). Pra
esvaziar de vez um campo sem digitar nada no lugar, não achei um caminho confiável — o teste que
precisava disso (limpar a busca de transações) ficou sem cobertura nesta passada.

Cheguei a suspeitar que isso fosse um bug real do formulário de Perfil (`values` do React Hook
Form resetando o campo sozinho) e cheguei a documentar isso aqui por um tempo — era falso
positivo, retirado depois de confirmar com um evento `input` sintético disparado direto via JS
(o campo esvazia e fica esvaziado normalmente quando o evento é disparado de verdade).

## 1. ✅ 🟡 Input com erro não fica com borda vermelha

Em `login`/`cadastro`/modais: quando um campo tem erro de validação, o texto de erro abaixo fica
vermelho, mas o `Input` continua com a borda neutra (e ganha o anel verde de foco normal, que
contradiz visualmente o erro logo abaixo). Nenhum estado de erro é passado pro componente
`Input`.

**Onde:** `frontend/src/components/ui/input.tsx` (sem prop `aria-invalid`/variante de erro),
todo formulário que usa `<Input {...register(...)} />` + `errors.campo`.

**Fix sugerido:** `Input` aceitar/ler `aria-invalid` (RHF já passa isso se `register` for usado
com `aria-invalid` amarrado a `!!errors.campo`) e aplicar `border-danger focus:ring-danger`
quando true.

**Correção:** `Input`/`Textarea` ganharam `aria-invalid:border-danger
aria-invalid:focus:border-danger aria-invalid:focus:ring-danger` (variante `aria-*` do Tailwind
v4). Todo `<Input {...register('campo')} />` que tinha erro possível ganhou
`aria-invalid={!!errors.campo}` ao lado do `register` (login, cadastro, perfil, os dois modais).
Verificado com `getComputedStyle` — borda fica `rgb(239, 68, 68)` (`--color-danger`) quando
inválido.

## 2. ✅ ⚪ "Categoria mais utilizada" mostra uma categoria mesmo com 0 transações

Criei 3 categorias sem nenhuma transação ainda. O card "Categoria mais utilizada" mostra
"Alimentação" (a primeira criada) em vez de indicar que não há uso — não é mentira grave, mas é
enganoso: nenhuma categoria foi "mais utilizada", todas empatam em zero.

**Onde:** `frontend/src/routes/_authenticated/categorias.tsx` —
`[...stats].sort((a, b) => b.itemCount - a.itemCount)[0]` sempre retorna o primeiro elemento
mesmo quando todo mundo empata em 0 (sort estável do JS mantém a ordem de criação).

**Fix sugerido:** só mostrar `mostUsed` quando `mostUsed.itemCount > 0`; caso contrário renderizar
"—" como já é feito pra lista vazia.

**Correção:** exatamente isso — `mostUsed` só é definido quando o candidato tem `itemCount > 0`,
senão fica `undefined` e cai no "—" que já existia pro card. Testado com categoria criada sem
nenhuma transação: mostra "—".

## 3. ✅ 🟡 Rota inexistente cai numa página preta sem estilo, só "Not Found"

Acessar uma URL que não bate com nenhuma rota (ex.: `/rota-que-nao-existe`) mostra o
`NotFoundComponent` padrão do TanStack Router: fundo preto, texto "Not Found" sem nenhum estilo
do app, sem link de volta. Não tem `notFoundComponent` configurado em nenhuma rota.

**Onde:** `frontend/src/routes/__root.tsx` (ou um `notFoundComponent` no root route do
`createRootRouteWithContext`).

**Fix sugerido:** adicionar `notFoundComponent` no root route — página simples com a marca do
Financy e um link/botão pra voltar pro Dashboard (`/`).

**Correção:** exatamente isso — `notFoundComponent` no `createRootRouteWithContext`, com a marca
Financy, "Página não encontrada" e um botão "Voltar pro início" (`Link to="/"`). Testado
navegando pra uma URL inexistente e clicando o botão.
