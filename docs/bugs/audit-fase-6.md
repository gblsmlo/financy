# Auditoria — requisitos × implementação (2026-09-05)

Passada de auditoria antes da Fase 6, conferindo o que as Fases 0–5 declaram concluído contra o
código que existe de verdade. Método: leitura do código, execução da suíte, smoke test dos 10
requisitos funcionais contra a API real (`curl`, servidor de verdade) e passada no browser com
back-end e front-end rodando. Severidade: 🔴 bloqueia requisito ou entrega, 🟡 defeito real que
não bloqueia, ⚪ nit.

**Resultado:** Fases 0–5 funcionalmente conformes. Fase 6 (entrega) não passava — 4 bloqueadores,
todos de infraestrutura de entrega, nenhum de domínio. Mais 8 defeitos reais e 8 nits.

Os 4 bloqueadores foram resolvidos no mesmo dia — ver "Correção" em cada um. Os defeitos 5–12 e
os nits seguem abertos.

Fidelidade visual (FR-12) fora do escopo desta passada — revisão manual contra o Figma fica com
o autor.

## O que foi verificado como verdadeiro

| Requisito | Como foi verificado |
| --- | --- |
| FR-01 a FR-10 | Smoke test contra a API real: signup, login, CRUD completo de categoria e transação |
| FR-02 (isolamento) | 4 vetores: sem token → `UNAUTHENTICATED`; listagem de outro usuário → vazia; update/delete de recurso alheio → `NOT_FOUND`; linkar categoria alheia numa transação → `NOT_FOUND` |
| Logout | `auth.api.signOut` revoga a sessão no servidor — `me` e `transactions` com o mesmo token depois do logout devolvem `UNAUTHENTICATED` |
| FR-11, NFR-01 a NFR-11 | TypeScript, Mercurius, Prisma, SQLite, CORS (preflight `204` no log de rede do browser), React, Vite sem framework, os dois `.env.example` |
| Portões | `lint`, `typecheck`, 30 testes e `build` aprovados nos dois workspaces |

## Bloqueadores de entrega (Task 007)

### 1. 🔴 `git remote` ainda aponta pro repositório do Brev.ly

```
origin  git@github.com:gblsmlo/brev.ly.git
```

`git push` publicaria o Financy dentro do repositório do projeto anterior. DL-01 ("repositório
público no GitHub") não é só "pendente" — o destino configurado está errado.

**Fix:** criar o repositório `financy` e reapontar o `origin`.

**Correção:** repositório https://github.com/gblsmlo/financy criado público pelo autor, `origin`
reapontado pra ele. `main` estava parada no último commit do Brev.ly, 10 commits atrás do
trabalho do Financy e nenhum à frente — fast-forward pra que o branch padrão do repositório
público carregue a resolução, como o DL-02 pede. O histórico foi varrido antes do push: nenhum
`.env`, chave privada ou token em nenhum commit.

### 2. 🔴 `bun run test:frontend` sai com código 1

Não existe nenhum arquivo de teste no front-end:

```
The following filters did not match any test files in --cwd="…/financy":
 frontend
```

O critério do [Task 007](../tasks/007-acceptance-delivery.md) diz "lint, typecheck e testes
passando em ambos os workspaces". O comando está documentado no README e falha.

**Fix:** suíte de teste real no front-end.

**Correção:** `@happy-dom/global-registrator` + `@testing-library/react` no workspace do front, e
12 testes em 4 arquivos:

- `lib/money.test.ts` — formatação de centavos, incluindo zero e saldo negativo.
- `features/auth/api.test.ts` — `fetchSession` devolve o usuário, converte `UNAUTHENTICATED` em
  `null` e **propaga qualquer outro erro** (engolir os outros faria rota protegida abrir vazia com
  o back-end fora do ar); `login` persiste o token; `logout` limpa a sessão local mesmo quando a
  mutation falha.
- `features/categories/use-category-stats.test.tsx` — agregação de contagem e total por categoria,
  e categoria sem transação permanecendo na lista zerada.
- `features/categories/category-card.test.tsx` — render do card e a confirmação de delete: o
  clique no ícone não apaga, só o botão do diálogo apaga.

A suíte de auth foi conferida com mutação deliberada no código-fonte (trocar
`isUnauthenticated(error)` por `error instanceof ClientError`) — o teste falha, como deve.

O registrator do happy-dom fica em `frontend/src/test-dom.ts`, fora do preload compartilhado
`test/setup.ts` de propósito: ele substitui `fetch`/`Headers`/`Response` globais, e o BetterAuth
do back-end consome os nativos. Verificado que não vaza rodando um arquivo de DOM do front antes
de um de auth do back no mesmo comando — 9 testes, 0 falhas.

`bun run test` (42), `test:backend` (29 + 1 de `test/`) e `test:frontend` (12) passam.

### 3. 🔴 `playwright.config.ts` é resíduo do Brev.ly

```ts
testDir: './web/e2e',
command: 'bun run --cwd web dev --host 127.0.0.1',
```

`web/` virou `frontend/` na Fase 0 e o config nunca foi acompanhado. `bunx playwright test --list`
devolve `Total: 0 tests in 0 files`; se algum teste existisse, o `webServer` também falharia.
`@playwright/test` está no `package.json` raiz sem nada que o use. A [Task 001](../tasks/001-cleanup-brevly.md)
declara a limpeza do Brev.ly concluída.

**Fix:** E2E não é requisito do desafio e a `main` só preserva o obrigatório — remover config,
dependência e a linha do README. Reintroduzir numa branch de extras, se for o caso.

**Correção:** removidos `playwright.config.ts`, o script `test:e2e`, a dependência
`@playwright/test`, a linha do README e as entradas mortas de `.gitignore`
(`playwright-report/`, `test-results/`) e de `bunfig.toml`
(`pathIgnorePatterns = ["web/e2e/**", …]`, mais resíduo do `web/`).

### 4. 🔴 O passo a passo do README quebra em clone limpo

`backend/.env.example` traz `JWT_SECRET=` vazio e `env-schema.ts` exige `min(1)`. Quem segue o
README literalmente (`cp backend/.env.example backend/.env`) trava no passo seguinte:

```
BOOT FAIL: [{ "code": "too_small", "minimum": 1, "path": ["JWT_SECRET"], … }]
```

Atinge `bun run codegen` (passo 4 do README, que importa `env` via `print-schema`) e `bun run dev`.
O README não menciona que a chave precisa ser preenchida, e o erro que aparece é o dump cru do Zod.

**Fix:** valor de desenvolvimento no `.env.example` + instrução de gerar um segredo real no README.

**Correção:** três partes.

1. `backend/.env.example` passou a trazer um `JWT_SECRET` não-vazio e óbvio de trocar, mais
   `CORS_ORIGIN`/`PORT` comentados com os defaults — antes não estavam documentados em lugar
   nenhum.
2. README ganhou o passo de gerar o segredo (`openssl rand -base64 32`) logo depois do bloco de
   `cp`.
3. `backend/src/env.ts` passou a formatar a falha de validação em vez de deixar o `ZodError`
   estourar cru, dizendo qual chave está errada e o que fazer:

   ```
   Variáveis de ambiente inválidas em backend/.env:
     - JWT_SECRET: Too small: expected string to have >=1 characters

   Confira backend/.env.example — o JWT_SECRET precisa de um valor real (gere com `openssl rand -base64 32`).
   ```

Verificado com uma cópia limpa do `.env.example`: `env` carrega, `bun run codegen` roda.

**Colateral:** com o caminho de setup consertado, o nit do `schema.graphql` (abaixo) ficava logo
no passo 4 do README, então foi corrigido junto — `print-schema.ts` agora tira a indentação dos
template literals e `bun run codegen` deixa a árvore limpa.

## Defeitos

### 5. 🟡 Os dois modais despejam o JSON inteiro do `ClientError` na tela

Reproduzido ao vivo: descrição com mais de 200 caracteres no modal de transação (o front não
valida esse limite, o back valida) renderiza como mensagem de erro o `response` completo, os
headers, o body, o texto da query GraphQL e as `variables`.

Causa: `ClientError` do `graphql-request` monta `message` como
`` `${response.errors[0].message}: ${JSON.stringify({ response, request })}` ``. `login`,
`cadastro` e a listagem de transações extraem `error.response.errors[0].message` corretamente; os
dois modais caem em `mutation.error.message`.

**Onde:** `frontend/src/features/transactions/transaction-form-dialog.tsx:213`,
`frontend/src/features/categories/category-form-dialog.tsx:178`.

### 6. 🟡 A página de Perfil engole erro de mutation em silêncio

Reproduzido ao vivo: nome com mais de 100 caracteres (o front não valida, o back valida). A API
devolve `{"errors":[{"message":"Too big: expected string to have <=100 characters"}]}` e a
interface não muda nada — nem erro, nem sucesso. O usuário fica achando que salvou.

Não existe nenhum branch `mutation.isError` no formulário.

**Onde:** `frontend/src/routes/_authenticated/perfil.tsx:73`.

### 7. 🟡 Rota raiz sem `errorComponent`

Com o back-end fora do ar, qualquer página autenticada cai na tela padrão do TanStack Router:
fundo preto, sem estilo, "Something went wrong! / Failed to fetch" em inglês.

Mesma classe do bug 3 do [qa-pass-1](qa-pass-1.md), que foi corrigido só pro caso de rota
inexistente — o `notFoundComponent` entrou, o `errorComponent` irmão não.

**Onde:** `frontend/src/routes/__root.tsx:10`.

### 8. 🟡 Mensagens do Zod vazam em inglês

`.max(200)` (descrição de transação), `.max(100)` (nome de categoria e de perfil) e o
`z.iso.datetime().or(z.iso.date())` da data não têm mensagem custom, então produzem
`"Too big: expected string to have <=200 characters"` e `"Invalid input"`. Todo o resto das
mensagens do back-end é português.

### 9. 🟡 A validação do front não espelha os limites do back

Descrição (200) e nome (100) não têm `max` no schema do front, então o usuário só descobre o
limite quando o servidor recusa. É a causa raiz de 5, 6 e 8 serem alcançáveis pela interface.

### 10. 🟡 N+1 na listagem de transações

Medido com log de query do Prisma: 12 transações geram 13 queries SQL. O field resolver
`Transaction.category` faz um `findUniqueOrThrow` por linha; a query de listagem não usa
`include` e não há loader do Mercurius registrado.

**Onde:** `backend/src/graphql/transactions/resolvers.ts:112`.

### 11. 🟡 `isCurrentMonth` compara data UTC-meia-noite com o instante atual em UTC

Transação gravada como `2026-09-30T00:00:00.000Z`; `now.getUTCMonth()` num usuário em BRT às
21:00 do dia 30/09 já é outubro. Nas últimas ~3 horas de cada mês o Dashboard troca "Receitas do
mês" e "Despesas do mês" pro mês seguinte.

**Onde:** `frontend/src/routes/_authenticated/index.tsx:18`.

### 12. 🟡 A página de Categorias não tem loading state nem error state

O critério do [Task 006](../tasks/006-frontend-features.md) pede "loading/erro/empty state" nas
duas listagens. `transacoes` tem loading; `categorias` renderiza "Nenhuma categoria ainda."
enquanto a query ainda está no ar, e nunca mostra erro de leitura.

## Nits

- **Filtro de período ausente em Transações.** O inventário do Figma registrado no
  [Task 005](../tasks/005-frontend-foundation.md) lista "busca, tipo, categoria, período,
  paginação"; os outros quatro existem. É lacuna funcional, não estética.
- **`description: null` é recusado no `updateCategory`.** O schema declara `description: String`
  (anulável), mas o Zod `.optional()` recusa `null` com `BAD_USER_INPUT`. Omitir o campo mantém o
  valor antigo, então pela API não há como limpar uma descrição a não ser mandando `""`.
- ~~**`bun run codegen` suja a árvore de trabalho.**~~ `schema:print` gravava a indentação dos
  template literals e o `backend/schema.graphql` versionado tinha sido dedentado à mão, então todo
  codegen produzia um diff de 112 linhas só de espaço em branco. Corrigido junto do bloqueador 4.
- **`totalInCents` soma INCOME e EXPENSE sem sinal** (`use-category-stats.ts:12`) — categoria com
  uma receita de R$ 100 e uma despesa de R$ 100 exibe R$ 200,00.
- **O Dockerfile nunca roda `prisma generate`.** `src/generated/prisma` é gitignored, então a
  imagem não builda a partir de um checkout limpo.
- **`mutation.isSuccess` é grudento no Perfil** — "Alterações salvas com sucesso." fica na tela
  pra sempre depois do primeiro save.
- **Descrição de categoria é gravada como `""`, não `null`** — o default do React Hook Form pro
  textarea opcional é string vazia.
- **`requirements.md` DL-02 está desatualizado** — diz "Pastas criadas — conteúdo pendente"; o
  conteúdo está lá desde a Fase 5.
