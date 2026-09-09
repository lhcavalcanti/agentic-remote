import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { appendFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { monitorEventLoopDelay, performance } from 'node:perf_hooks'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

// Run from an installed checkout with node --import tsx --expose-gc.
// --smoke checks summary projection with three small synthetic sessions, without timed samples.
// Only this process's newly created fixture directory is read or removed.
const root = fileURLToPath(new URL('../../../', import.meta.url))
const smoke = process.argv.includes('--smoke')
const source = (name) => import(pathToFileURL(path.join(root, name)).href)
const { SessionStore } = await source('server/session-store.ts')
const { AgentService } = await source('server/agent-service.ts')
const { buildApp } = await source('server/app.ts')
const { readSessionEvents, sessionEventLogVersion, forgetSessionEvents } =
  await source('server/event-log.ts')
const { listWorkspace, readWorkspaceFile } = await source('server/workspace-browser.ts')
const fixture = path.join(root, `functional-review-performance-fixture-${randomUUID()}`)
await mkdir(fixture, { mode: 0o700 })
const previousEnvironment = {
  COPILOT_HOME: process.env.COPILOT_HOME,
  AGENTIC_REMOTE_ALLOWED_ORIGINS: process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS,
  AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER: process.env.AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER,
}
process.env.COPILOT_HOME = path.join(fixture, 'copilot')
process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS = 'http://localhost'
delete process.env.AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER

const content = 'synthetic text; no provider, user history, or credentials. '.repeat(5).slice(0, 256)
const timestamp = '2026-09-09T00:00:00.000Z'
const originalClone = globalThis.structuredClone
let clones = 0
let clonedMessageEntries = 0
globalThis.structuredClone = (...args) => {
  clones += 1
  if (Array.isArray(args[0]?.messages)) clonedMessageEntries += args[0].messages.length
  return originalClone(...args)
}

function rounded(value) {
  return Number(value.toFixed(3))
}

async function measure(name, operation, samples = 15, warmups = 3) {
  for (let index = 0; index < warmups; index += 1) await operation(index)
  globalThis.gc?.()
  const histogram = monitorEventLoopDelay({ resolution: 1 })
  histogram.enable()
  await delay(5)
  histogram.reset()
  const timings = []
  const cloneCounts = []
  const messageCloneCounts = []
  const cpuStart = process.cpuUsage()
  let peakRssBytes = process.memoryUsage().rss
  try {
    for (let index = 0; index < samples; index += 1) {
      const cloneStart = clones
      const messageCloneStart = clonedMessageEntries
      const start = performance.now()
      await operation(index)
      timings.push(performance.now() - start)
      cloneCounts.push(clones - cloneStart)
      messageCloneCounts.push(clonedMessageEntries - messageCloneStart)
      peakRssBytes = Math.max(peakRssBytes, process.memoryUsage().rss)
      if (peakRssBytes > 1024 ** 3) throw new Error('Fixture exceeded its 1 GiB RSS budget')
      await delay(2)
    }
  } finally {
    histogram.disable()
  }
  const cpu = process.cpuUsage(cpuStart)
  const samplesMs = timings.map(rounded)
  timings.sort((left, right) => left - right)
  const middle = Math.floor(timings.length / 2)
  const median = timings.length % 2
    ? timings[middle]
    : (timings[middle - 1] + timings[middle]) / 2
  return {
    name,
    samples,
    samplesMs,
    medianMs: rounded(median),
    p95Ms: rounded(timings[Math.ceil(timings.length * 0.95) - 1]),
    maxMs: rounded(timings.at(-1)),
    clonesPerSample: [...new Set(cloneCounts)],
    clonedMessageEntriesPerSample: [...new Set(messageCloneCounts)],
    eventLoopP95Ms: histogram.count ? rounded(histogram.percentile(95) / 1e6) : null,
    cpuMs: rounded((cpu.user + cpu.system) / 1000),
    peakRssMiB: rounded(peakRssBytes / 1024 ** 2),
  }
}

function fixtureService(store) {
  const forbidden = () => {
    throw new Error('Provider, authentication, discovery and terminal operations must not run in this fixture')
  }
  const client = {
    start: forbidden,
    stop: async () => [],
    createSession: forbidden,
    resumeSession: forbidden,
    listSessions: forbidden,
    deleteSession: forbidden,
  }
  return new AgentService(
    store, client, forbidden, forbidden, forbidden, forbidden,
    { has: forbidden, send: forbidden, cancel: forbidden },
    forbidden, forbidden,
  )
}

async function seedStore(directory, sessions, messages, openSessions) {
  await mkdir(directory, { recursive: true, mode: 0o700 })
  const state = { version: 1, sessions: {} }
  for (let index = 0; index < sessions; index += 1) {
    const id = `fixture-${index}`
    state.sessions[id] = {
      id,
      provider: 'copilot',
      title: `Synthetic session ${index}`,
      cwd: fixture,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'idle',
      isOpen: index < openSessions,
      managedOpen: index < openSessions,
      backend: 'sdk',
      revision: 1,
      queuedCount: 0,
      queuedPrompts: [],
      messages: Array.from({ length: messages }, (_, messageIndex) => ({
        id: `${id}-message-${messageIndex}`,
        role: messageIndex % 2 ? 'assistant' : 'user',
        content,
        createdAt: timestamp,
        streaming: false,
      })),
    }
  }
  const serialized = JSON.stringify(state)
  await writeFile(path.join(directory, 'state.json'), serialized, { mode: 0o600 })
  return Buffer.byteLength(serialized)
}

async function storeCase(sessions, messages, openSessions = sessions) {
  const directory = path.join(fixture, `${sessions}-${messages}-${openSessions}`)
  const initialStateBytes = await seedStore(directory, sessions, messages, openSessions)
  const store = new SessionStore(directory)
  await store.initialize()
  const service = fixtureService(store)
  const { app } = await buildApp({
    service,
    dataDirectory: path.join(directory, 'hub'),
    logger: false,
    serveStatic: false,
    transcriptionService: {
      async initialize() {},
      async stop() {},
      async transcribe() { throw new Error('Transcription is outside this fixture') },
    },
  })
  try {
    await app.ready()
    await delay(5)
    const sessionId = 'fixture-0'
    const messageId = `${sessionId}-message-${messages - 1}`
    const assertSummaries = (summaries, expectedCount) => {
      assert.equal(summaries.length, expectedCount)
      assert.deepEqual(
        summaries.map((session) => session.id).sort(),
        Array.from({ length: expectedCount }, (_, index) => `fixture-${index}`).sort(),
      )
      for (const session of summaries) assert.deepEqual(session.messages, [])
    }
    const verifyApiProjection = async () => {
      const response = await app.inject({ url: '/api/sessions', headers: { host: 'localhost' } })
      assert.equal(response.statusCode, 200)
      assertSummaries(response.json().sessions, openSessions)
      return Buffer.byteLength(response.body)
    }
    for (const session of store.list()) assert.equal(session.messages.length, messages)
    assertSummaries(service.listSessions(), openSessions)
    assertSummaries(service.listHistory(), sessions)
    const verifiedResponseBytes = await verifyApiProjection()
    if (smoke) {
      return {
        sessions,
        openSessions,
        messagesPerSession: messages,
        initialStateBytes,
        sessionListBytes: verifiedResponseBytes,
        correctness: {
          rawStoreHistoriesRetained: true,
          realAgentServiceListAndHistoryMessagesEmpty: true,
          apiMessageArraysEmpty: true,
          apiSessionCount: openSessions,
        },
        metrics: [],
      }
    }
    const metrics = []
    metrics.push(await measure('store.list', () => store.list().length))
    metrics.push(await measure('store.get', () => store.get(sessionId).messages.length))
    metrics.push(await measure('store.backend x1000', () => {
      for (let index = 0; index < 1000; index += 1) store.backend(sessionId)
    }))
    metrics.push(await measure('store.readAfterWrites', () => store.readAfterWrites(sessionId)))
    let responseBytes = 0
    metrics.push(await measure('GET /api/sessions (Fastify inject)', async () => {
      const response = await app.inject({ url: '/api/sessions', headers: { host: 'localhost' } })
      assert.equal(response.statusCode, 200)
      responseBytes = Buffer.byteLength(response.body)
    }, 10, 2))
    await verifyApiProjection()
    metrics.push(await measure('store.renameSession (durable)', (index) =>
      store.renameSession(sessionId, `Synthetic rename ${index}`), 8, 1))
    metrics.push(await measure('store.streamMessage (warm public snapshot)', () =>
      store.streamMessage(sessionId, messageId, 'x'.repeat(32)), 30, 1))
    const event = {
      type: 'session.upserted',
      session: { ...store.get(sessionId), computerId: 'fixture-hub', computerName: 'Fixture hub' },
    }
    const eventBytes = Buffer.byteLength(JSON.stringify(event))
    metrics.push(await measure('encode one full session.upserted', () => JSON.stringify(event)))
    return {
      sessions,
      openSessions,
      messagesPerSession: messages,
      contentBytesPerMessage: Buffer.byteLength(content),
      initialStateBytes,
      sessionListBytes: responseBytes,
      upsertBytes: eventBytes,
      metrics,
    }
  } finally {
    await app.close()
  }
}

async function eventLogCase(count) {
  const id = `events-${count}`
  const directory = path.join(process.env.COPILOT_HOME, 'session-state', id)
  await mkdir(directory, { recursive: true, mode: 0o700 })
  const file = path.join(directory, 'events.jsonl')
  const makeEvent = (index) => JSON.stringify({
    id: `event-${index}`, type: 'assistant.message', timestamp,
    data: { messageId: `message-${index}`, content },
  }) + '\n'
  await writeFile(file, Array.from({ length: count }, (_, index) => makeEvent(index)).join(''))
  const bytes = (await stat(file)).size
  const cold = await measure('cold parse', async () => {
    forgetSessionEvents(id)
    assert.equal((await readSessionEvents(id)).length, count)
  }, 5, 0)
  const version = await measure('unchanged version stat', () => sessionEventLogVersion(id))
  const warm = await measure('warm reader including returned array copy', () => readSessionEvents(id))
  let appended = 0
  const appendTimes = []
  for (let index = 0; index < 5; index += 1) {
    await appendFile(file, makeEvent(count + index))
    const start = performance.now()
    const events = await readSessionEvents(id)
    appendTimes.push(performance.now() - start)
    appended += 1
    assert.equal(events.length, count + appended)
  }
  forgetSessionEvents(id)
  appendTimes.sort((left, right) => left - right)
  return { count, bytes, cold, version, warm, appendMedianMs: rounded(appendTimes[2]) }
}

async function workspaceCase() {
  const directory = path.join(fixture, 'workspace')
  await mkdir(directory)
  for (let index = 0; index < 2001; index += 32) {
    await Promise.all(Array.from({ length: Math.min(32, 2001 - index) }, (_, offset) =>
      writeFile(path.join(directory, `file-${index + offset}.txt`), 'synthetic')))
  }
  const listing = await listWorkspace(directory)
  const listingMetric = await measure('list 2001 files (2000 returned)', () => listWorkspace(directory), 5, 1)
  const binaryDirectory = path.join(fixture, 'binary')
  await mkdir(binaryDirectory)
  await writeFile(path.join(binaryDirectory, 'synthetic.pdf'), Buffer.alloc(10 * 1024 ** 2, 0x41))
  const file = await readWorkspaceFile(binaryDirectory, 'synthetic.pdf')
  return {
    diskEntries: 2001,
    returnedEntries: listing.entries.length,
    hasTruncationIndicator: Object.hasOwn(listing, 'truncated'),
    listingMetric,
    binaryPreview: {
      purpose: 'Packaging bytes only; synthetic bytes are not a valid PDF or a browser decode test',
      rawBytes: file.size,
      base64Bytes: Buffer.byteLength(file.base64),
      metric: await measure('read and base64-encode 10 MiB binary', () =>
        readWorkspaceFile(binaryDirectory, 'synthetic.pdf'), 5, 1),
    },
  }
}

async function bundleSizes() {
  const directory = path.join(root, 'dist')
  let html
  try {
    html = await readFile(path.join(directory, 'index.html'), 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return { available: false, reason: 'Run pnpm build first' }
    throw error
  }
  const urls = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)]
    .map((match) => match[1])
  const assets = []
  for (const url of [...new Set(urls)]) {
    const data = await readFile(path.join(directory, url))
    assets.push({ asset: url, bytes: data.length, gzipBytes: gzipSync(data).length })
  }
  return {
    available: true,
    scope: 'Assets referenced by built HTML, not lazy chunks, compression on the server, or field load time',
    assets,
  }
}

try {
  const report = {
    mode: smoke ? 'correctness-smoke' : 'performance',
    methodology: 'real-AgentService-summary-projection-v3',
    capturedAt: new Date().toISOString(),
    sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    packageVersion: JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cpu: os.cpus()[0].model,
      logicalCpus: os.cpus().length,
      availableParallelism: os.availableParallelism(),
      totalMemoryMiB: rounded(os.totalmem() / 1024 ** 2),
      loadAverageAtStart: os.loadavg(),
      gcAvailable: typeof globalThis.gc === 'function',
    },
    limits: { maxSessions: 100, maxTotalMessages: 100_000, maxObservedRssMiB: 1024 },
    caveats: [
      'Shared development machine, not an exclusive benchmark host.',
      'Real SessionStore and AgentService.listSessions/listHistory projection; real buildApp, ComputerManager and Fastify handlers.',
      'AgentService is never started. Its Copilot client and discovery/terminal adapters are fail-fast fakes; client.stop is a no-op. No authentication, provider query or native terminal runs.',
      'GET /api/sessions uses shipped summary projection with empty message arrays; raw store.list is benchmarked separately. Projection/count assertions run outside timed samples; each timed response must also be HTTP 200.',
      'Only one local Copilot service is injected; this excludes ProviderSessionService dual-provider aggregation and remote-node/provider discovery.',
      'Full session.upserted encoding uses a constructed detail envelope, not a live provider event or WebSocket fan-out.',
      'Fastify injection excludes sockets, TLS, paired-node transport, and browser rendering.',
      'Nearest-rank p95 with 5-30 samples is descriptive, not a production SLO.',
      'Median averages the two middle samples for even counts; samplesMs retains observed-order timings rounded to 0.001 ms.',
      'Cloned-message counts cover direct session objects with a messages array, not every allocation or nested state object.',
      'Event-loop histogram includes 2 ms inter-sample yields; resolution is 1 ms.',
    ],
    stores: [],
    eventLogs: [],
  }
  for (const [sessions, messages, openSessions] of smoke
    ? [[3, 4], [3, 4, 1]]
    : [[10, 100], [10, 1000], [100, 1000], [100, 1000, 10]]) {
    report.stores.push(await storeCase(sessions, messages, openSessions))
    globalThis.gc?.()
  }
  if (!smoke) {
    for (const count of [100, 1000, 10_000]) report.eventLogs.push(await eventLogCase(count))
    report.workspace = await workspaceCase()
    report.bundle = await bundleSizes()
  }
  report.environment.loadAverageAtEnd = os.loadavg()
  console.log(JSON.stringify(report, null, 2))
} finally {
  globalThis.structuredClone = originalClone
  for (const [key, value] of Object.entries(previousEnvironment)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  await rm(fixture, { recursive: true, force: true })
}
