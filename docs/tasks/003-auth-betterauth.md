# Task 003 — Autenticação com BetterAuth

## Objetivo

Cadastro e login funcionais via BetterAuth, com sessão/token utilizável pelos resolvers GraphQL
para restringir dados ao usuário autenticado.

## Critérios de aceite

- [ ] Validado que o handler genérico do BetterAuth roda sob Fastify/Bun (ver risco técnico do
      [ADR 003](../decisions/003-auth-betterauth.md)); se não rodar bem, revisar a decisão antes
      de prosseguir.
- [ ] BetterAuth configurado com adapter Prisma e plugin JWT, lendo `JWT_SECRET` do ambiente.
- [ ] Mutations GraphQL de signup e login expostas (diretamente ou via rota BetterAuth
      encapsulada).
- [ ] Contexto GraphQL (`context` do Mercurius) resolve o usuário autenticado a partir do header
      `Authorization` em cada requisição.
- [ ] Resolvers de domínio (Task 004) recusam acesso sem usuário autenticado.
- [ ] Testes cobrindo: cadastro com sucesso, e-mail duplicado, login com credenciais corretas e
      incorretas, acesso negado a resolver protegido sem token.

## Evidências

(preencher ao concluir)

## Fora de escopo

- OAuth/social login — não é requisito do desafio.
- Recuperação de senha, verificação de e-mail — fora do escopo obrigatório.
