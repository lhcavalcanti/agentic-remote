import { buildApp } from './app.js'
import { createStartupPhases, startManagedServer } from './startup-phases.js'

const host = process.env.HOST?.trim() || '127.0.0.1'
const port = Number.parseInt(process.env.PORT || '4318', 10)
const role = process.env.AGENTIC_REMOTE_ROLE?.trim() || 'hub'

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`)
}
if (role !== 'hub' && role !== 'node') {
  throw new Error(`Invalid AGENTIC_REMOTE_ROLE: ${role}`)
}

const phases = createStartupPhases()
const { app, service } = await phases.run('app.build', () => buildApp({
  logger: true,
  role,
  serveStatic: role === 'hub' && process.env.NODE_ENV === 'production',
  cliCanary: true,
}))

await startManagedServer(app, service, { host, port }, phases)

let shuttingDown = false
async function shutdown(signal: string) {
  if (shuttingDown) {
    return
  }
  shuttingDown = true
  app.log.info({ signal }, 'shutting down')
  await app.close()
}

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})
process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})
