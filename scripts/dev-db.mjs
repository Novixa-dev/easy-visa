// Local development Postgres without Docker (Windows-friendly).
// Usage: npm run db:local   (keeps running until Ctrl+C)
import EmbeddedPostgres from 'embedded-postgres'
import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve('.pgdata')
const firstRun = !fs.existsSync(path.join(dataDir, 'PG_VERSION'))

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'easyvisa',
  password: 'easyvisa',
  port: 5433,
  persistent: true,
  // UTF-8 is required for Arabic; Windows would otherwise default to WIN1252.
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
})

if (firstRun) await pg.initialise()
await pg.start()
if (firstRun) await pg.createDatabase('easyvisa')
if (process.argv.includes('--test')) {
  try { await pg.createDatabase('easyvisa_test') } catch {}
}
console.log('Postgres ready on 127.0.0.1:5433 (db: easyvisa)')

const stop = async () => { await pg.stop(); process.exit(0) }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
setInterval(() => {}, 1 << 30)
