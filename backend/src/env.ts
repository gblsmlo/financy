import { z } from 'zod'

import { createServerEnv } from './env-schema'

function formatIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n')
}

function loadEnv() {
  try {
    return createServerEnv()
  } catch (error) {
    if (!(error instanceof z.ZodError)) throw error

    // O dump cru do Zod no boot não diz o que fazer, e o caso mais comum é o JWT_SECRET
    // vazio herdado do .env.example.
    console.error(
      `Variáveis de ambiente inválidas em backend/.env:\n${formatIssues(error)}\n\n` +
        'Confira backend/.env.example — o JWT_SECRET precisa de um valor real ' +
        '(gere com `openssl rand -base64 32`).',
    )
    process.exit(1)
  }
}

export const env = loadEnv()
