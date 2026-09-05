import { typeDefs } from './graphql/schema'

/**
 * Os type-defs são template literals indentados dentro do módulo que os declara. Sem tirar essa
 * indentação, o arquivo versionado nunca bate com o que o script gera e todo `bun run codegen`
 * suja a árvore de trabalho.
 */
function dedent(sdl: string): string {
  const lines = sdl.split('\n')
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^ */)?.[0].length ?? 0)
  const shortest = Math.min(...indents)

  return lines.map((line) => line.slice(shortest)).join('\n')
}

const sdl = `${dedent(typeDefs)
  .replace(/\n{3,}/g, '\n\n')
  .trim()}\n`

await Bun.write(new URL('../schema.graphql', import.meta.url), sdl)
