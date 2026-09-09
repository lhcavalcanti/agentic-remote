import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { WebSocketServer } from 'ws'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const { buildApp } = await import(pathToFileURL(path.join(root, 'server/app.ts')).href)
const fixture = await mkdtemp(path.join(os.tmpdir(), 'agentic-remote-delay-review-'))
const previousOrigins = process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS
process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS = 'http://localhost'
const providers = [{ id: 'copilot', name: 'Synthetic provider', available: false, terminalBacked: false }]
const session = {
  id: 'synthetic-session', provider: 'copilot', title: 'Synthetic session',
  cwd: fixture, updatedAt: '2026-09-09T00:00:00.000Z',
  status: 'idle', isOpen: true, messages: [], queuedCount: 0,
}
const token = 'synthetic-loopback-fixture-not-a-real-credential'
let responseDelay = 0
let sessionReads = 0
const node = createServer(async (request, response) => {
  if (request.url === '/health') {
    response.end('{"ok":true}')
    return
  }
  if (request.headers.authorization !== `Bearer ${token}`) {
    response.writeHead(401).end()
    return
  }
  response.setHeader('content-type', 'application/json')
  if (request.url === '/node-api/info') {
    response.end(JSON.stringify({ id: 'synthetic-node', name: 'Synthetic node', version: '1.1.0', providers }))
  } else if (request.url === '/node-api/sessions') {
    sessionReads += 1
    await delay(responseDelay)
    response.end(JSON.stringify({ sessions: [session] }))
  } else {
    response.writeHead(404).end('{"error":"Unknown fixture route"}')
  }
})
const sockets = new WebSocketServer({ noServer: true })
node.on('upgrade', (request, socket, head) => {
  if (request.url !== '/node-api/events' || request.headers.authorization !== `Bearer ${token}`) {
    socket.destroy()
    return
  }
  sockets.handleUpgrade(request, socket, head, (connection) => sockets.emit('connection', connection, request))
})

class FixtureService extends EventEmitter {
  providers() { return providers }
  listSessions() { return [session] }
  listHistory() { return [] }
  async stop() {}
}

let hub
try {
  await new Promise((resolve, reject) => {
    node.once('error', reject)
    node.listen(0, '127.0.0.1', resolve)
  })
  const address = node.address()
  assert.equal(typeof address, 'object')
  const baseUrl = `http://127.0.0.1:${address.port}`
  assert.equal((await fetch(`${baseUrl}/health`)).status, 200)
  hub = await buildApp({
    service: new FixtureService(), dataDirectory: fixture, logger: false,
    transcriptionService: {
      async initialize() {},
      async stop() {},
      async transcribe() { throw new Error('Transcription is outside this fixture') },
    },
  })
  await hub.app.ready()
  await hub.manager.registerComputer({ baseUrl, token })
  await delay(30)
  await hub.manager.listSessions()

  const requestSessions = async () => {
    const start = performance.now()
    const response = await hub.app.inject({ url: '/api/sessions', headers: { host: 'localhost' } })
    assert.equal(response.statusCode, 200)
    assert.equal(response.json().sessions.length, 2)
    return performance.now() - start
  }
  const measured = []
  for (const milliseconds of [0, 600]) {
    responseDelay = milliseconds
    const times = []
    for (let index = 0; index < 5; index += 1) times.push(await requestSessions())
    times.sort((left, right) => left - right)
    measured.push({ injectedNodeDelayMs: milliseconds, samples: times.length,
      medianHubListMs: Number(times[2].toFixed(3)), maxHubListMs: Number(times.at(-1).toFixed(3)) })
  }
  const readsBefore = sessionReads
  await Promise.all([requestSessions(), requestSessions()])
  assert.equal(sessionReads - readsBefore, 1)
  console.log(JSON.stringify({
    scope: 'Real hub handlers, ComputerManager and RemoteNodeClient; fake authenticated node on an ephemeral loopback port.',
    measured,
    overlappingHubListsNodeReads: sessionReads - readsBefore,
    notes: 'No provider or live pairing; not a real WAN, offline timeout, or browser startup measurement.',
  }, null, 2))
} finally {
  await hub?.app.close()
  for (const socket of sockets.clients) socket.terminate()
  await new Promise((resolve) => sockets.close(resolve))
  node.closeAllConnections()
  await new Promise((resolve) => node.close(resolve))
  if (previousOrigins === undefined) delete process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS
  else process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS = previousOrigins
  await rm(fixture, { recursive: true, force: true })
}
