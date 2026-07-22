import { buildApp } from './app.js'

const host = process.env.HOST?.trim() || '127.0.0.1'
const port = Number.parseInt(process.env.PORT || '4318', 10)

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`)
}

const { app, service } = await buildApp({
  logger: true,
  serveStatic: process.env.NODE_ENV === 'production',
})

await service.start()
await app.listen({ host, port })

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
