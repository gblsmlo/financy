import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../backend/schema.graphql',
  documents: ['src/**/*.{ts,tsx}'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
    },
    // O preset `client` só gera tipo de resultado por operação — isso aqui é só pros tipos
    // de objeto do schema em si (Category, Transaction, User...), usados como prop type.
    './src/gql/schema-types.ts': {
      plugins: ['typescript'],
      config: { enumsAsTypes: true },
    },
  },
}

export default config
