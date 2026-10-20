/**
 * Browser before/after harness for session event payloads.
 *
 * Serves the built app with synthetic sessions and publishes transcript
 * updates through the hub's own `SessionPublications`. A client that asks for
 * patches (`/api/events?patches=1`) is sent them; an older client is sent the
 * whole session, so running this against a build from before patches measures
 * the old path with the same publisher.
 *
 * In patch mode it also proves recovery in the browser: a forged, replayed, or
 * dropped patch is never applied, costs exactly one resync, and the transcript
 * still converges on the latest publication. Nothing leaves loopback.
 *
 *   pnpm build && node --import tsx e2e/session-patch-browser.ts --output out.json
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { Server as HttpServer } from 'node:http'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { chromium, type Browser, type Page } from '@playwright/test'
import { preview } from 'vite'
import { WebSocket, WebSocketServer } from 'ws'
import type { ChatMessage, ManagedSession } from '../shared/contracts.js'
import { SessionPublications, type PatchSocket } from '../server/session-patches.js'
import {
  createWorkspaceFixtureState, SELECTED_SESSION_ID, setupWorkspaceFixture,
} from './workspace-fixtures.js'

interface FrameMeasurement {
  type: string
  characters: number
  parseMs: number
  publishToHandlerMs: number
  primary: boolean
  domMs?: number
  frameMs?: number
}

declare global {
  interface Window {
    __perf: {
      frames: FrameMeasurement[]
      pending: Array<{ received: number; measurement: FrameMeasurement }>
      longTasks: number[]
    }
  }
}

const { values } = parseArgs({ options: {
  output: { type: 'string' },
  samples: { type: 'string', default: '30' },
  port: { type: 'string', default: '4396' },
} })
const samples = Number(values.samples)
const port = Number(values.port)
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
assert(values.output && Number.isInteger(samples) && samples >= 3 && samples <= 500)
const records: Array<Record<string, string | number>> = []
const server = await preview({ preview: { host: '127.0.0.1', port, strictPort: true, proxy: {} } })
const baseUrl = `http://127.0.0.1:${port}`
const timestamp = '2026-09-04T16:20:00.000Z'

interface Connection {
  socket: WebSocket
  target: PatchSocket & { dropNextPatch?: boolean }
  patches: boolean
}
const publications = new SessionPublications()
const connections = new Set<Connection>()
let socketOpens = 0
let resyncRequests = 0
let sentBytes = 0
let browser: Browser | undefined
let eventServer: WebSocketServer | undefined
const transports = new Set<string>()

/** Stamps each frame as it leaves, so the page can time publish→handler. */
function stamp(payload: string): string {
  return `${payload.slice(0, -1)},"perfSentAtEpochMs":${performance.timeOrigin + performance.now()}}`
}

function publish(session: ManagedSession) {
  const before = sentBytes
  publications.broadcast({ type: 'session.upserted', session })
  return sentBytes - before
}

function content(index: number, bytes = 512) {
  return `### Synthetic ${index}\n\n${'fixture words '.repeat(Math.ceil(bytes / 14))}`.slice(0, bytes)
}

function message(index: number, bytes = 512): ChatMessage {
  return {
    id: `synthetic-${index}`, role: index % 2 ? 'assistant' : 'user',
    content: content(index, bytes), createdAt: timestamp,
  }
}

async function waitFor(condition: () => boolean, what: string, ms = 10_000) {
  const deadline = performance.now() + ms
  while (!condition()) {
    if (performance.now() > deadline) throw new Error(`Timed out waiting for ${what}`)
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

async function instrument(page: Page) {
  const initialize = (selectedId: string) => {
    window.__perf = { frames: [], pending: [], longTasks: [] }
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__perf.longTasks.push(entry.duration)
    }).observe({ type: 'longtask', buffered: true })
    const originalParse = JSON.parse
    JSON.parse = function (text, reviver) {
      const start = performance.now()
      const value = originalParse(text, reviver)
      if (typeof text === 'string' && text.startsWith('{"type":') &&
        typeof value.perfSentAtEpochMs === 'number') {
        const measurement: FrameMeasurement = {
          type: value.type,
          characters: text.length, parseMs: performance.now() - start,
          publishToHandlerMs: performance.timeOrigin + start - value.perfSentAtEpochMs,
          primary: (value.type === 'session.upserted' || value.type === 'session.patched') &&
            value.session.id === selectedId,
        }
        window.__perf.frames.push(measurement)
        if (measurement.primary) window.__perf.pending.push({ received: start, measurement })
      }
      return value
    }
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => {
        const element = mutation.target.nodeType === Node.ELEMENT_NODE
          ? mutation.target as Element : mutation.target.parentElement
        return element?.closest('.message-stack')
      })) {
        for (const entry of window.__perf.pending.splice(0)) {
          entry.measurement.domMs = performance.now() - entry.received
          requestAnimationFrame(() => requestAnimationFrame(() => {
            entry.measurement.frameMs = performance.now() - entry.received
          }))
        }
      }
    })
    observer.observe(document, { subtree: true, childList: true, characterData: true })
  }
  await page.addInitScript({ content: `window.__name = (f) => f; (${initialize.toString()})(${JSON.stringify(SELECTED_SESSION_ID)});` })
}

async function lastHeading(page: Page, expected: string) {
  await page.waitForFunction((text) =>
    [...document.querySelectorAll('.message-stack h3')].at(-1)?.textContent === text, expected)
}

async function open(history: number, neighbours: number) {
  assert(browser)
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })
  const page = await context.newPage()
  page.setDefaultTimeout(15_000)
  await instrument(page)
  const state = createWorkspaceFixtureState()
  const selected = state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
  selected.messages = Array.from({ length: history }, (_, i) => message(i))
  selected.status = 'idle'
  const others = Array.from({ length: neighbours }, (_, index) => ({
    ...structuredClone(selected), id: `synthetic-neighbour-${index}`,
    messages: Array.from({ length: 2500 }, (_, i) => message(i)),
  }))
  state.sessions.push(...others)
  for (const other of others) {
    state.sessionOrder.order[other.computerId].push(`${other.computerId}:${other.id}`)
  }
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl, state, knowledgeMode: 'hidden', preserveStorageOnReload: true,
    nativeLocalEvents: true, realClock: true,
  })
  await page.goto(fixture.url)
  await page.getByRole('textbox', { name: 'Message', exact: true }).waitFor()
  fixture.assertHealthy()
  await waitFor(() => connections.size > 0, 'the event socket')
  return { context, page, fixture, selected, others }
}

/** Alternates a new message with a change to the last, as a turn streams in. */
function advance(selected: ManagedSession, index: number) {
  selected.revision = (selected.revision ?? 0) + 1
  const next = message(index + 10000)
  if (index % 2) {
    selected.messages = [...selected.messages.slice(0, -1), { ...selected.messages.at(-1)!, content: next.content }]
  } else {
    selected.messages = [...selected.messages, next]
  }
  return `Synthetic ${index + 10000}`
}

async function runEvents(history: number, neighbours = 0) {
  const scenario = `history-${history}-neighbours-${neighbours}`
  const { context, page, fixture, selected, others } = await open(history, neighbours)
  try {
    await page.evaluate(() => document.fonts.ready)
    const cdp = await context.newCDPSession(page)
    await cdp.send('Performance.enable')
    await page.waitForTimeout(150)
    await page.evaluate(() => { window.__perf.frames = []; window.__perf.longTasks = [] })
    for (let i = 0; i < samples + 3; i += 1) {
      const before = await cdp.send('Performance.getMetrics')
      const index = await page.evaluate(() => window.__perf.frames.length)
      const heading = advance(selected, i)
      const bytes = publish(selected)
      let neighbourBytes = 0
      for (const other of others) {
        other.revision = (other.revision ?? 0) + 1
        other.messages = [...other.messages.slice(0, -1), { ...other.messages.at(-1)!, content: content(i + 10000) }]
        neighbourBytes += publish(other)
      }
      await page.waitForFunction(({ previous, count }) => window.__perf.frames.length >= previous + count,
        { previous: index, count: neighbours + 1 })
      await page.waitForFunction((previous) => window.__perf.frames.slice(previous)
        .some((entry) => entry.primary && entry.frameMs !== undefined), index)
      await lastHeading(page, heading)
      const measurements = await page.evaluate((previous) => window.__perf.frames.slice(previous), index)
      const after = await cdp.send('Performance.getMetrics')
      const metric = (name: string) =>
        (after.metrics.find((entry) => entry.name === name)?.value ?? 0) -
        (before.metrics.find((entry) => entry.name === name)?.value ?? 0)
      if (i >= 3) {
        const primary = measurements.find((entry) => entry.primary)
        assert(primary && primary.domMs !== undefined, `Missing DOM measurement for ${scenario}`)
        records.push({
          scenario, stage: 'event-to-render', frameType: primary.type, bytes, neighbourBytes,
          parseMs: primary.parseMs, publishToHandlerMs: primary.publishToHandlerMs,
          parseTotalMs: measurements.reduce((sum, entry) => sum + entry.parseMs, 0),
          domMs: primary.domMs, frameMs: primary.frameMs!,
          taskMs: metric('TaskDuration') * 1000, scriptMs: metric('ScriptDuration') * 1000,
          layoutMs: metric('LayoutDuration') * 1000, styleMs: metric('RecalcStyleDuration') * 1000,
          heapBytes: after.metrics.find((entry) => entry.name === 'JSHeapUsedSize')?.value ?? 0,
        })
      }
    }
    await cdp.send('HeapProfiler.collectGarbage')
    const collected = await cdp.send('Performance.getMetrics')
    records.push({
      scenario, stage: 'window-summary',
      ...await page.evaluate(() => ({
        longTasks: window.__perf.longTasks.length,
        longTaskTotalMs: window.__perf.longTasks.reduce((sum, ms) => sum + ms, 0),
        renderedRows: document.querySelectorAll('.message-stack .message').length,
      })),
      retainedHeapBytes: collected.metrics.find((entry) => entry.name === 'JSHeapUsedSize')!.value,
    })
    assert.equal(resyncRequests, 0, 'An in-order stream must never need a resync')
    fixture.assertHealthy()
    await cdp.detach()
  } finally {
    await context.close()
  }
}

/** Forged, replayed, and dropped patches: never applied, each costs one resync. */
async function recovery() {
  const { context, page, fixture, selected } = await open(200, 0)
  try {
    const connection = [...connections].find((entry) => entry.patches)
    if (!connection) {
      records.push({ scenario: 'recovery', stage: 'skipped', reason: 'client does not ask for patches' })
      return
    }
    let index = 50_000
    let heading = advance(selected, index++)
    publish(selected)
    await lastHeading(page, heading)
    let lastPatch = ''
    const send = connection.target.send
    connection.target.send = (payload) => {
      if (payload.startsWith('{"type":"session.patched"')) lastPatch = payload
      send(payload)
    }
    for (let round = 0; round < Math.max(3, Math.min(samples, 20)); round += 1) {
      for (const fault of ['forged', 'replayed', 'dropped'] as const) {
        heading = advance(selected, index++)
        publish(selected)
        await lastHeading(page, heading)
        const requests = resyncRequests
        const start = performance.now()
        if (fault === 'forged') {
          const { messages: _messages, ...summary } = selected
          connection.socket.send(JSON.stringify({
            type: 'session.patched', session: { ...summary, title: 'Forged' },
            patch: { from: 999_999, to: 1_000_000, keep: 0, count: 1, messages: [message(1)] },
          }))
        } else if (fault === 'replayed') {
          assert(lastPatch)
          connection.socket.send(lastPatch)
        } else {
          connection.target.dropNextPatch = true
          advance(selected, index++)
          publish(selected)
        }
        // The next real update is noticed as a gap if one was dropped, and in
        // every case ends on the latest publication: nothing is lost.
        heading = advance(selected, index++)
        publish(selected)
        await waitFor(() => resyncRequests === requests + 1, `one resync after a ${fault} patch`)
        await lastHeading(page, heading)
        await page.waitForTimeout(50)
        assert.equal(resyncRequests, requests + 1, `A ${fault} patch cost more than one resync`)
        assert.equal(await page.getByText('Forged').count(), 0)
        records.push({ scenario: 'recovery', stage: fault, recoveredMs: performance.now() - start })
      }
    }
    connection.target.send = send
    fixture.assertHealthy()
  } finally {
    await context.close()
  }
}

/** A dropped socket recovers from a fresh snapshot and resumes on the new one. */
async function reconnect() {
  const { context, page, fixture, selected } = await open(2500, 0)
  try {
    let index = 70_000
    for (let i = 0; i < Math.min(samples, 10); i += 1) {
      const heading = advance(selected, index++)
      const opens = socketOpens
      const start = performance.now()
      for (const connection of connections) connection.socket.close(1012, 'Synthetic reconnect fixture')
      await waitFor(() => socketOpens > opens && connections.size > 0, 'the socket to reopen')
      const socketReopenMs = performance.now() - start
      await lastHeading(page, heading)
      const snapshotMs = performance.now() - start
      const next = advance(selected, index++)
      publish(selected)
      await lastHeading(page, next)
      records.push({
        scenario: 'reconnect', stage: 'fresh-snapshot-then-update', socketReopenMs, snapshotMs,
        durationMs: performance.now() - start,
      })
      await page.waitForTimeout(150)
    }
    assert.equal(resyncRequests, 0, 'A fresh socket must start from whole sessions')
    fixture.assertHealthy()
  } finally {
    await context.close()
  }
}

function percentile(sorted: number[], p: number) {
  return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)]
}

function summarize() {
  const groups = new Map<string, number[]>()
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      if (typeof value !== 'number') continue
      const name = `${record.scenario}/${record.stage}/${key}`
      groups.set(name, [...(groups.get(name) ?? []), value])
    }
  }
  return Object.fromEntries([...groups].map(([name, list]) => {
    const sorted = [...list].sort((a, b) => a - b)
    return [name, {
      n: sorted.length, p50: percentile(sorted, 50), p95: percentile(sorted, 95),
      p99: percentile(sorted, 99), max: sorted.at(-1),
    }]
  }))
}

try {
  assert(server.httpServer instanceof HttpServer, 'The fixture requires a local HTTP/1 server')
  eventServer = new WebSocketServer({ server: server.httpServer, path: '/api/events' })
  eventServer.on('connection', (socket, request) => {
    socketOpens += 1
    const patches = new URL(request.url ?? '/', baseUrl).searchParams.get('patches') === '1'
    transports.add(patches ? 'patches' : 'full')
    const target: Connection['target'] = {
      get readyState() { return socket.readyState },
      send(payload) {
        if (target.dropNextPatch && payload.startsWith('{"type":"session.patched"')) {
          target.dropNextPatch = false
          return
        }
        const frame = stamp(payload)
        sentBytes += Buffer.byteLength(frame)
        socket.send(frame)
      },
    }
    if (patches) {
      target.patchVersions = new Map()
      socket.on('message', (data: Buffer) => {
        const request = JSON.parse(data.toString('utf8')) as { type?: string; computerId: string; sessionId: string }
        assert.equal(request.type, 'session.resync')
        resyncRequests += 1
        publications.resync(target, request.computerId, request.sessionId)
      })
    }
    const connection = { socket, target, patches }
    connections.add(connection)
    publications.add(target)
    socket.on('close', () => {
      connections.delete(connection)
      publications.delete(target)
    })
  })
  browser = await chromium.launch()
  assert.equal((await fetch(baseUrl)).status, 200)
  await runEvents(20)
  await runEvents(2500)
  await runEvents(10000)
  await runEvents(2500, 5)
  await reconnect()
  await recovery()
  await mkdir(path.dirname(path.resolve(values.output!)), { recursive: true })
  const summary = summarize()
  await writeFile(values.output!, JSON.stringify({
    schema: 1, synthetic: true, samples, browser: browser.version(), sourceCommit,
    transports: [...transports], resyncRequests, summary, records,
  }, null, 2) + '\n')
  console.log(JSON.stringify({ sourceCommit, transports: [...transports], resyncRequests, stages: records.length }))
} finally {
  await Promise.all([
    browser?.close(),
    new Promise<void>((resolve, reject) => {
      if (!eventServer) { resolve(); return }
      eventServer.close((error) => error ? reject(error) : resolve())
    }),
    new Promise<void>((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve())),
  ])
}
