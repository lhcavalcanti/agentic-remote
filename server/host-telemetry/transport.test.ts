import { once } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import type { AddressInfo } from 'node:net'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'
import { HostHistorySchema, HostSnapshotSchema, type HostSnapshot } from '../../shared/host-telemetry.js'
import { buildApp, type BuildAppOptions } from '../app.js'
import { RemoteNodeClient } from '../remote-node-client.js'
import { createStartupPhases } from '../startup-phases.js'
import { readingFixture } from './test-fixtures.js'
import { HostTelemetrySampler } from './sampler.js'
import { HostTelemetryService } from './service.js'
import type { ProcessScanContext } from './processes.js'
import { HostTelemetrySocket, HOST_TELEMETRY_MAX_QUEUE_BYTES } from './socket.js'
import { oracleHostStatus } from './oracle-status.js'

const empty: HostSnapshot = { info: null, latest: null, live: [], disk: null }
const inventory = { rows: [], truncated: false, othersCount: 0, scannedAt: '2026-11-14T06:00:00.000Z' }

describe('host viewer lifetimes and scan admission', () => {
  const services: HostTelemetryService[] = []
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime('2026-11-14T06:00:00Z')
  })
  afterEach(() => {
    for (const service of services.splice(0)) service.stop()
    vi.useRealTimers()
  })
  function make(scan = vi.fn(async (_context: ProcessScanContext) => inventory)) {
    const reader = vi.fn(async () => readingFixture())
    const sampler = new HostTelemetrySampler({
      dataDirectory: '/fictional-data', reader, clock: { monotonicNow: Date.now },
    })
    const service = new HostTelemetryService(sampler, {}, scan, Date.now)
    services.push(service)
    return { service, sampler, reader, scan }
  }

  it('counts viewers, streams accepted samples, and restores 15s cadence after the last viewer', async () => {
    const { service, sampler, reader } = make()
    service.start()
    await vi.advanceTimersByTimeAsync(0)
    const first = vi.fn()
    const closeFirst = service.subscribe(first, vi.fn())
    const closeSecond = service.subscribe(vi.fn(), vi.fn())
    expect(sampler.status()).toMatchObject({ viewers: 2, intervalMs: 1000 })
    await vi.advanceTimersByTimeAsync(1000)
    expect(first).toHaveBeenCalledTimes(2)
    expect(first.mock.calls[1][0].latest.at).toBe('2026-11-14T06:00:01.000Z')
    closeFirst()
    closeFirst()
    expect(sampler.status().viewers).toBe(1)
    closeSecond()
    expect(sampler.status()).toMatchObject({ viewers: 0, intervalMs: 15_000 })
    await vi.advanceTimersByTimeAsync(14_999)
    expect(reader).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(1)
    expect(reader).toHaveBeenCalledTimes(3)
    expect(first).toHaveBeenCalledTimes(2)
  })

  it('caps the owning computer at 32 viewers and releases every lease on stop', () => {
    const { service, sampler } = make()
    const ended = vi.fn()
    const closes = Array.from({ length: 32 }, () => service.subscribe(vi.fn(), ended))
    expect(() => service.subscribe(vi.fn(), vi.fn())).toThrow('Too many')
    expect(sampler.status().viewers).toBe(32)
    closes[0]()
    service.subscribe(vi.fn(), ended)
    service.stop()
    expect(sampler.status()).toMatchObject({ viewers: 0, running: false })
    expect(ended).toHaveBeenCalledTimes(33)
    expect(() => service.subscribe(vi.fn(), vi.fn())).toThrow('stopped')
  })

  it('admits scans only on demand and at most once per 5s, including with viewers', async () => {
    const { service, scan } = make()
    service.start()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(scan).not.toHaveBeenCalled()
    await expect(service.processes()).resolves.toEqual(inventory)
    await expect(service.processes()).rejects.toMatchObject({ statusCode: 429 })
    service.subscribe(vi.fn(), vi.fn())
    await vi.advanceTimersByTimeAsync(4999)
    await expect(service.processes()).rejects.toMatchObject({ statusCode: 429 })
    await vi.advanceTimersByTimeAsync(1)
    await expect(service.processes()).resolves.toEqual(inventory)
    expect(scan).toHaveBeenCalledTimes(2)
    expect(scan.mock.calls[0][0]).toBe(scan.mock.calls[1][0])
    service.stop()
    await expect(service.processes()).rejects.toMatchObject({ statusCode: 503 })
  })

  it('never overlaps scans, even when an outstanding scan exceeds the rate limit', async () => {
    let finish!: (value: typeof inventory) => void
    const scan = vi.fn((_context: ProcessScanContext) => new Promise<typeof inventory>((resolve) => { finish = resolve }))
    const { service } = make(scan)
    const first = service.processes()
    await vi.advanceTimersByTimeAsync(10_000)
    await expect(service.processes()).rejects.toMatchObject({ statusCode: 429 })
    expect(scan).toHaveBeenCalledTimes(1)
    finish(inventory)
    await first
  })
})

describe('bounded host socket output', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers() })
  function make(bufferedAmount = 0) {
    const socket = { readyState: 1, bufferedAmount, send: vi.fn(), close: vi.fn(), terminate: vi.fn() }
    const release = vi.fn()
    const output = new HostTelemetrySocket(socket as unknown as WebSocket, release)
    return { socket, output, release }
  }

  it('disconnects after two queued frames instead of accumulating samples', () => {
    const { output, socket, release } = make()
    output.send(empty)
    output.send(empty)
    output.send(empty)
    output.send(empty)
    expect(socket.send).toHaveBeenCalledTimes(2)
    expect(socket.close).toHaveBeenCalledWith(1013, expect.stringContaining('slow'))
    expect(release).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1000)
    expect(socket.terminate).toHaveBeenCalledTimes(1)
  })

  it('bounds transport bytes and disconnects a single stalled write after 5s', () => {
    const full = make(HOST_TELEMETRY_MAX_QUEUE_BYTES)
    full.output.send(empty)
    expect(full.socket.send).not.toHaveBeenCalled()
    expect(full.release).toHaveBeenCalledTimes(1)
    const stalled = make()
    stalled.output.send(empty)
    vi.advanceTimersByTime(5000)
    expect(stalled.socket.close).toHaveBeenCalledWith(1013, expect.stringContaining('slow'))
    expect(stalled.release).toHaveBeenCalledTimes(1)
  })

  it('releases queue space on completion and cancels timeout work on disconnect', () => {
    const { output, socket, release } = make()
    const callbacks: ((error?: Error) => void)[] = []
    socket.send.mockImplementation((_payload, callback) => { callbacks.push(callback) })
    output.send(empty)
    callbacks.shift()!()
    output.send(empty)
    callbacks.shift()!()
    vi.advanceTimersByTime(6000)
    expect(socket.close).not.toHaveBeenCalled()
    output.dispose()
    output.dispose()
    expect(release).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('gated hub and authenticated node host transport', () => {
  const apps: Awaited<ReturnType<typeof buildApp>>[] = []
  const directories: string[] = []
  const sockets: WebSocket[] = []
  beforeEach(() => {
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_HOST_MONITOR', 'on')
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER', 'off')
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_SCHEDULER', 'off')
    vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
    vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'off')
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  })
  afterEach(async () => {
    for (const socket of sockets.splice(0)) socket.terminate()
    for (const runtime of apps.splice(0).reverse()) await runtime.app.close()
    for (const directory of directories.splice(0)) await rm(directory, { recursive: true, force: true })
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  async function make(name: string, options: BuildAppOptions = {}) {
    const directory = await mkdtemp(path.join(process.cwd(), '.host-transport-test-'))
    directories.push(directory)
    const scan = vi.fn(async () => inventory)
    const factory = vi.fn((dataDirectory, context) => new HostTelemetryService(
      new HostTelemetrySampler({
        dataDirectory,
        reader: async () => {
          const reading = readingFixture()
          reading.info.hostname = name
          return reading
        },
      }), context, scan,
    ))
    const runtime = await buildApp({
      logger: false, dataDirectory: directory, managerAgent: false,
      transcriptionService: { initialize: async () => {}, stop: async () => {}, transcribe: vi.fn() },
      hostTelemetryFactory: factory,
      ...options,
    })
    apps.push(runtime)
    return { ...runtime, scan, factory }
  }

  async function listen(runtime: Awaited<ReturnType<typeof buildApp>>) {
    await runtime.app.listen({ host: '127.0.0.1', port: 0 })
    return `http://127.0.0.1:${(runtime.app.server.address() as AddressInfo).port}`
  }

  async function pair(hub: Awaited<ReturnType<typeof buildApp>>, node: Awaited<ReturnType<typeof buildApp>>) {
    const baseUrl = await listen(node)
    const response = await hub.app.inject({
      method: 'POST', url: '/api/computers',
      payload: { baseUrl, token: node.identity.token, name: 'Fictional node' },
    })
    expect(response.statusCode).toBe(201)
    return `/api/computers/${node.identity.info.id}/host`
  }

  function connect(baseUrl: string, route: string) {
    const socket = new WebSocket(baseUrl.replace('http:', 'ws:') + route)
    sockets.push(socket)
    const sample = once(socket, 'message').then(([data]) => JSON.parse(data.toString()))
    return { socket, sample }
  }

  it.each(['hub', 'node'] as const)('constructs nothing and exposes no host routes with the flag off on a %s', async (role) => {
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_HOST_MONITOR', 'off')
    const runtime = await make('unused', { role })
    await runtime.app.ready()
    expect(runtime.hostTelemetry).toBeUndefined()
    expect(runtime.factory).not.toHaveBeenCalled()
    const prefix = role === 'hub' ? `/api/computers/${runtime.identity.info.id}/host` : '/node-api/host'
    for (const suffix of ['', '/history?range=24h', '/processes', '/live']) {
      expect((await runtime.app.inject({
        url: prefix + suffix, headers: { authorization: `Bearer ${runtime.identity.token}` },
      })).statusCode).toBe(404)
    }
    expect(runtime.scan).not.toHaveBeenCalled()
    const info = await runtime.app.inject({ url: '/node-api/info', headers: { authorization: `Bearer ${runtime.identity.token}` } })
    expect(info.json().hostTelemetry).toEqual({ version: 1, enabled: false })
  })

  it.each(['hub', 'node'] as const)('starts only onReady, logs the startup phase and stops onClose on a %s', async (role) => {
    const lines: string[] = []
    const runtime = await make('fictional-computer', {
      role, startupPhases: createStartupPhases({ write: (line) => lines.push(line) }),
    })
    expect(runtime.hostTelemetry!.sampler.status().running).toBe(false)
    expect(lines).toEqual([])
    await runtime.app.ready()
    expect(runtime.hostTelemetry!.sampler.status().running).toBe(true)
    expect(lines.map((line) => JSON.parse(line))).toEqual([
      expect.objectContaining({ startupPhase: 'hostTelemetry.start', event: 'begin' }),
      expect.objectContaining({ startupPhase: 'hostTelemetry.start', event: 'complete' }),
    ])
    expect(runtime.scan).not.toHaveBeenCalled()
    await runtime.app.close()
    expect(runtime.hostTelemetry!.sampler.status().running).toBe(false)
  })

  it('serves local snapshots, 24h minute aggregates, on-demand scans and unknown computers', async () => {
    const hub = await make('hub-fictional')
    const prefix = `/api/computers/${hub.identity.info.id}/host`
    const snapshot = await hub.app.inject({ url: prefix })
    expect(snapshot.statusCode).toBe(200)
    expect(snapshot.headers['cache-control']).toBe('no-store')
    expect(HostSnapshotSchema.parse(snapshot.json()).info?.hostname).toBe('hub-fictional')
    const history = await hub.app.inject({ url: `${prefix}/history?range=24h` })
    expect(HostHistorySchema.parse(history.json())).toHaveLength(1)
    for (const range of ['1h', '48h', '24h&range=24h']) {
      expect((await hub.app.inject({ url: `${prefix}/history?range=${range}` })).statusCode).toBe(400)
    }
    expect((await hub.app.inject({ url: `${prefix}/processes` })).json()).toEqual(inventory)
    expect((await hub.app.inject({ url: `${prefix}/processes` })).statusCode).toBe(429)
    expect(hub.scan).toHaveBeenCalledTimes(1)
    const context = hub.factory.mock.calls[0][1]
    const roots = vi.fn(async () => [])
    hub.service.listSessionPaneRoots = roots
    expect(await context.listSessionPaneRoots()).toEqual([])
    expect(roots).toHaveBeenCalledTimes(1)
    expect((await hub.app.inject({ url: '/api/computers/unknown/host' })).statusCode).toBe(404)
  })

  it('streams local samples only to the selected computer and releases viewers on disconnect', async () => {
    const hub = await make('hub-fictional')
    const base = await listen(hub)
    const first = connect(base, `/api/computers/${hub.identity.info.id}/host/live`)
    expect(await first.sample).toMatchObject({ type: 'host.snapshot', snapshot: { info: { hostname: 'hub-fictional' } } })
    const second = connect(base, `/api/computers/${hub.identity.info.id}/host/live`)
    await second.sample
    expect(hub.hostTelemetry!.sampler.status()).toMatchObject({ viewers: 2, intervalMs: 1000 })
    const next = once(first.socket, 'message')
    expect(JSON.parse((await next)[0].toString()).type).toBe('host.snapshot')
    first.socket.terminate()
    await vi.waitFor(() => expect(hub.hostTelemetry!.sampler.status().viewers).toBe(1))
    second.socket.terminate()
    await vi.waitFor(() => expect(hub.hostTelemetry!.sampler.status()).toMatchObject({ viewers: 0, intervalMs: 15_000 }))
  })

  it('caps hub subscriptions before they can open more owning-computer viewers', async () => {
    const hub = await make('hub-fictional')
    await hub.app.ready()
    const prefix = `/api/computers/${hub.identity.info.id}/host/live`
    const live = await Promise.all(Array.from({ length: 32 }, () => hub.app.injectWS(prefix, { headers: { host: 'localhost' } })))
    sockets.push(...live)
    expect(hub.hostTelemetry!.sampler.status().viewers).toBe(32)
    const extra = await hub.app.injectWS(prefix, { headers: { host: 'localhost' } })
    const closed = once(extra, 'close')
    sockets.push(extra)
    expect((await closed)[0]).toBe(1013)
    expect(hub.hostTelemetry!.sampler.status().viewers).toBe(32)
  })

  it('proxies snapshots, history, processes and live viewers to the owning node', async () => {
    const node = await make('node-fictional', { role: 'node' })
    const hub = await make('hub-fictional')
    const prefix = await pair(hub, node)
    expect((await hub.app.inject({ url: prefix })).json().info.hostname).toBe('node-fictional')
    expect((await hub.app.inject({ url: `${prefix}/history?range=24h` })).json()).toEqual(node.hostTelemetry!.history())
    expect((await hub.app.inject({ url: `${prefix}/processes` })).json()).toEqual(inventory)
    expect((await hub.app.inject({ url: `${prefix}/processes` })).statusCode).toBe(429)
    expect(node.scan).toHaveBeenCalledTimes(1)
    expect(hub.scan).not.toHaveBeenCalled()
    const base = await listen(hub)
    const live = connect(base, `${prefix}/live`)
    expect(await live.sample).toMatchObject({ type: 'host.snapshot', snapshot: { info: { hostname: 'node-fictional' } } })
    expect(node.hostTelemetry!.sampler.status()).toMatchObject({ viewers: 1, intervalMs: 1000 })
    expect(hub.hostTelemetry!.sampler.status().viewers).toBe(0)
    live.socket.terminate()
    await vi.waitFor(() => expect(node.hostTelemetry!.sampler.status()).toMatchObject({ viewers: 0, intervalMs: 15_000 }))
    for (const route of ['/host', '/host/history?range=24h', '/host/processes']) {
      expect((await node.app.inject({ url: `/node-api${route}` })).statusCode).toBe(401)
    }
    await expect(node.app.injectWS('/node-api/host/live')).rejects.toThrow('401')
  })

  it('lets Oracle read local and remote hosts through ComputerManager without live subscriptions', async () => {
    const node = await make('node-fictional', { role: 'node' })
    const hub = await make('hub-fictional')
    await pair(hub, node)
    await hub.app.ready()
    const result = await oracleHostStatus(
      hub.manager!.listComputers(),
      (id) => hub.manager!.hostTelemetryTarget(id, hub.hostTelemetry!),
      Date.now,
    )
    expect(result).toContain('hub-fictional · hub')
    expect(result).toContain('node-fictional · node')
    expect(node.scan).toHaveBeenCalledTimes(1)
    expect(hub.scan).toHaveBeenCalledTimes(1)
    expect(hub.hostTelemetry!.sampler.status().viewers).toBe(0)
    expect(node.hostTelemetry!.sampler.status().viewers).toBe(0)
  })

  it.each([
    ['malformed JSON', '{not-json', 502, /invalid host telemetry/],
    ['schema-invalid JSON', '{"unexpected":"fictional"}', 502, /invalid host telemetry/],
    ['connection failure', undefined, 503, /unavailable/],
  ] as const)('maps %s through hub HTTP reads without changing computer connectivity', async (_label, body, statusCode, message) => {
    const node = await make('node-fictional', { role: 'node' })
    node.app.addHook('onSend', async (request, reply, payload) => {
      if (!request.url.startsWith('/node-api/host')) return payload
      if (body === undefined) {
        reply.raw.destroy()
        return payload
      }
      return body
    })
    const hub = await make('hub-fictional')
    const prefix = await pair(hub, node)
    for (const suffix of ['', '/history?range=24h', '/processes']) {
      const response = await hub.app.inject({ url: prefix + suffix })
      expect(response.statusCode).toBe(statusCode)
      expect(response.json().error).toMatch(message)
      expect(hub.manager!.listComputers().find((computer) => computer.id === node.identity.info.id)?.online).toBe(true)
    }
  })

  it('returns an actionable 409 for old nodes before HTTP reads or a live upgrade', async () => {
    const node = await make('old-fictional', { role: 'node' })
    const hub = await make('hub-fictional')
    const prefix = await pair(hub, node)
    vi.spyOn(RemoteNodeClient.prototype, 'getInfo').mockResolvedValue({ ...node.identity.info })
    for (const route of ['', '/history?range=24h', '/processes']) {
      const response = await hub.app.inject({ url: prefix + route })
      expect(response.statusCode).toBe(409)
      expect(response.json().error).toMatch(/Update this computer/)
    }
    await expect(hub.app.injectWS(`${prefix}/live`, { headers: { host: 'localhost' } })).rejects.toThrow('409')
    expect(node.scan).not.toHaveBeenCalled()
  })

  it('distinguishes a node with monitoring turned off without constructing or scanning there', async () => {
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_HOST_MONITOR', 'off')
    const node = await make('off-fictional', { role: 'node' })
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_HOST_MONITOR', 'on')
    const hub = await make('hub-fictional')
    const prefix = await pair(hub, node)
    for (const route of ['', '/history?range=24h', '/processes']) {
      const response = await hub.app.inject({ url: prefix + route })
      expect(response.statusCode).toBe(409)
      expect(response.json().error).toMatch(/turned off on this computer/)
    }
    await expect(hub.app.injectWS(`${prefix}/live`, { headers: { host: 'localhost' } })).rejects.toThrow('409')
    expect(node.hostTelemetry).toBeUndefined()
    expect(node.factory).not.toHaveBeenCalled()
    expect(node.scan).not.toHaveBeenCalled()
  })

  it('releases a remote viewer when its computer is removed and closes active viewers during shutdown', async () => {
    const node = await make('node-fictional', { role: 'node' })
    const hub = await make('hub-fictional')
    const prefix = await pair(hub, node)
    const base = await listen(hub)
    const live = connect(base, `${prefix}/live`)
    await live.sample
    const closed = once(live.socket, 'close')
    await hub.manager!.removeComputer(node.identity.info.id)
    await closed
    await vi.waitFor(() => expect(node.hostTelemetry!.sampler.status().viewers).toBe(0))
    const local = connect(base, `/api/computers/${hub.identity.info.id}/host/live`)
    await local.sample
    await hub.app.close()
    expect(hub.hostTelemetry!.sampler.status()).toMatchObject({ viewers: 0, running: false })
  })

  it('terminates unread host consumers before generic WebSocket shutdown can wait on their close handshake', async () => {
    const hub = await make('hub-fictional')
    const base = await listen(hub)
    const live = connect(base, `/api/computers/${hub.identity.info.id}/host/live`)
    await live.sample
    const transport = Reflect.get(live.socket, '_socket') as { pause(): void; resume(): void }
    transport.pause()
    let deadline: ReturnType<typeof setTimeout> | undefined
    try {
      await Promise.race([
        hub.app.close(),
        new Promise<never>((_resolve, reject) => {
          deadline = setTimeout(() => reject(new Error('Host consumer blocked shutdown')), 1500)
        }),
      ])
      expect(hub.hostTelemetry!.sampler.status()).toMatchObject({ viewers: 0, running: false })
    } finally {
      if (deadline) clearTimeout(deadline)
      transport.resume()
      live.socket.terminate()
    }
  })
})
