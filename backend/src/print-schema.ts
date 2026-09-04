import { typeDefs } from './graphql/schema'

await Bun.write(new URL('../schema.graphql', import.meta.url), typeDefs)
