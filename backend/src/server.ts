import { env } from './env'
import { buildApp } from './http/app'

const app = buildApp()

app
  .listen({ host: '0.0.0.0', port: env.PORT })
  .then(() => app.log.info(`Financy backend listening on port ${env.PORT}`))
