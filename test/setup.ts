import { afterEach, mock } from 'bun:test'

import { createTestEnv, testDatabasePath } from './env-schema'

// bun test's --preload has no per-workspace scoping when invoked from the repo
// root (every root `test*` script runs this way), so the shared bootstrap also
// migrates backend's SQLite test database — the only place that needs it today.
// This runs as a real child process (the Prisma CLI) rather than importing
// backend's Prisma client here: bun test's `--isolate` module-registry reset
// left the client's own migration attempt invisible to the test files that
// import it afterwards, even though the exact same code worked outside of
// `bun test`.
const migration = Bun.spawnSync(['bunx', 'prisma', 'migrate', 'deploy'], {
  cwd: `${import.meta.dir}/../backend`,
  env: { ...process.env, DATABASE_URL: `file:${testDatabasePath}` },
  stdio: ['ignore', 'pipe', 'pipe'],
})

if (!migration.success) {
  console.error(migration.stdout.toString(), migration.stderr.toString())
  throw new Error('Failed to migrate the test database')
}

const env = createTestEnv()

for (const [key, value] of Object.entries(env)) {
  process.env[key] = String(value)
}

afterEach(() => {
  mock.restore()
})
