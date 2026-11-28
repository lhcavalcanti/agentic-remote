import type { FastifyInstance } from 'fastify'
import type WebSocket from 'ws'
import type { ComputerSummary } from '../shared/contracts.js'
import {
  DICTATION_LIMITS,
  DICTATION_PROTOCOL,
  parseDictationClientMessage,
  parseDictationServerMessage,
  type DictationCapabilities,
  type DictationClientMessage,
  type DictationErrorCode,
  type DictationServerMessage,
} from '../shared/dictation.js'
import {
  DICTATION_CLOSE_CODES,
  closeReason,
  rawBuffer,
  type LiveDictationHost,
  type LiveDictationLog,
} from './live-dictation-host.js'
import { isWebSocketUpgrade, ticketClient } from './oracle-voice-routes.js'
import { VoiceTicketStore } from './oracle-voice-tickets.js'

const CAPABILITIES_TIMEOUT_MS = 5_000
const OPEN = 1

export interface DictationComputers {
  findComputer(nameOrId: string): ComputerSummary | undefined
  connectDictation(computerId: string, signal?: AbortSignal): Promise<WebSocket>
  dictationCapabilities(computerId: string, signal?: AbortSignal): Promise<DictationCapabilities>
}

export interface DictationRouteOptions {
  /** Live dictation on this hub. */
  host: LiveDictationHost
  computers: DictationComputers
  /** The computer that transcribes audio (AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER); this hub when unset. */
  computerName?: string
  log: LiveDictationLog
  /** A store of its own, so dictation and Oracle voice tickets never redeem each other. */
  tickets?: VoiceTicketStore
}

type DictationTarget =
  | { kind: 'local' }
  | { kind: 'remote'; computer: ComputerSummary }
  | { kind: 'unavailable'; computerName: string; reason: string }

/**
 * The browser's live dictation routes. The stream goes to the computer that
 * transcribes audio for this hub: this hub's own host, or a paired node
 * through a relay that only checks and forwards what passes through it.
 */
export async function registerDictationRoutes(
  app: FastifyInstance,
  options: DictationRouteOptions,
): Promise<void> {
  const tickets = options.tickets ?? new VoiceTicketStore()
  let relaying: DictationRelay | undefined
  const relays = new Set<DictationRelay>()

  app.get('/api/dictation/capabilities', async (_request, reply) => {
    reply.header('cache-control', 'no-store')
    const target = dictationTarget(options)
    if (target.kind === 'local') return options.host.capabilities()
    if (target.kind === 'unavailable') {
      return { live: false, reason: target.reason, computerName: target.computerName }
    }
    const computerName = target.computer.name
    try {
      const reported = await options.computers.dictationCapabilities(
        target.computer.id,
        AbortSignal.timeout(CAPABILITIES_TIMEOUT_MS),
      )
      if (typeof reported?.live !== 'boolean') {
        return { live: false, reason: `${computerName} sent invalid dictation capabilities`, computerName }
      }
      return reported.live
        ? { live: true, computerName }
        : { live: false, reason: typeof reported.reason === 'string' ? reported.reason : `Live dictation is unavailable on ${computerName}`, computerName }
    } catch (error) {
      return {
        live: false,
        reason: statusCodeOf(error) === 404 ? outdatedReason(computerName) : `${computerName} is offline`,
        computerName,
      }
    }
  })

  app.post('/api/dictation/tickets', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    const issued = tickets.issueWithExpiration(
      ticketClient(request.headers.origin, request.ip, 'Live dictation'),
    )
    return reply.code(201).send({
      ticket: issued.ticket,
      expiresAt: new Date(issued.expiresAt).toISOString(),
    })
  })

  app.get<{ Querystring: { ticket?: string } }>(
    '/api/dictation',
    {
      websocket: true,
      // The single-use ticket is in the query string, so automatic access
      // logging must not serialize this route's URL.
      logLevel: 'silent',
      preValidation: async (request, reply) => {
        if (!isWebSocketUpgrade(request.headers)) {
          return reply.code(404).send({ error: 'Live dictation requires a WebSocket upgrade' })
        }
        const ticket = request.query.ticket
        if (typeof ticket !== 'string' || ticket.length === 0 || ticket.length > 512) {
          return reply.code(401).send({ error: 'A valid dictation ticket is required' })
        }
        let consumed
        try {
          consumed = tickets.consume(ticket, ticketClient(request.headers.origin, request.ip, 'Live dictation'))
        } catch {
          consumed = undefined
        }
        if (!consumed) {
          return reply.code(401).send({ error: 'Dictation ticket is invalid or expired' })
        }
      },
    },
    (socket) => {
      const target = dictationTarget(options)
      if (target.kind === 'local') {
        options.host.attach(socket)
        return
      }
      const relay = new DictationRelay(socket, target, {
        computers: options.computers,
        log: options.log,
        claim: (claimant) => {
          if (relaying && relaying !== claimant) return false
          relaying = claimant
          return true
        },
        release: (claimant) => {
          if (relaying === claimant) relaying = undefined
          relays.delete(claimant)
        },
      })
      relays.add(relay)
    },
  )

  app.addHook('onClose', async () => {
    for (const relay of [...relays]) relay.shutdown()
  })
}

function dictationTarget(options: DictationRouteOptions): DictationTarget {
  const name = options.computerName
  if (!name) return { kind: 'local' }
  const computer = options.computers.findComputer(name)
  if (!computer) return { kind: 'unavailable', computerName: name, reason: `${name} is not paired` }
  if (computer.isLocal) return { kind: 'local' }
  if (!computer.online) {
    return { kind: 'unavailable', computerName: computer.name, reason: `${computer.name} is offline` }
  }
  return { kind: 'remote', computer }
}

function outdatedReason(computerName: string): string {
  return `Update ${computerName} to use live dictation`
}

interface RelayContext {
  computers: DictationComputers
  log: LiveDictationLog
  claim: (relay: DictationRelay) => boolean
  release: (relay: DictationRelay) => void
}

type RelayPhase = 'waiting' | 'connecting' | 'relaying' | 'ended'

/**
 * Pipes one browser stream to the paired transcription computer. It checks
 * every message and bounds every frame, and either side closing closes the
 * other. The node owns the stream; the hub keeps nothing it relays.
 */
class DictationRelay {
  readonly #browser: WebSocket
  readonly #target: Exclude<DictationTarget, { kind: 'local' }>
  readonly #context: RelayContext
  readonly #connecting = new AbortController()
  #phase: RelayPhase = 'waiting'
  #node: WebSocket | undefined
  #streamId: string | undefined
  #ended = false
  #cancelled = false
  #heartbeat: ReturnType<typeof setTimeout> | undefined
  #browserStall: ReturnType<typeof setTimeout> | undefined
  #nodeStall: ReturnType<typeof setTimeout> | undefined

  constructor(
    browser: WebSocket,
    target: Exclude<DictationTarget, { kind: 'local' }>,
    context: RelayContext,
  ) {
    this.#browser = browser
    this.#target = target
    this.#context = context
    browser.on('message', (data, isBinary) => this.#fromBrowser(data, isBinary))
    browser.on('close', () => this.#browserClosed())
    browser.on('error', () => this.#browserClosed())
    this.#armBrowserStall()
    this.#scheduleHeartbeat()
  }

  shutdown(): void {
    this.#end('shutdown', 1001, 'Agentic Remote is shutting down')
  }

  get #computerName(): string {
    return this.#target.kind === 'remote' ? this.#target.computer.name : this.#target.computerName
  }

  #fromBrowser(data: WebSocket.RawData, isBinary: boolean): void {
    if (this.#phase === 'ended') return
    if (this.#phase !== 'relaying') this.#armBrowserStall()
    const buffer = rawBuffer(data)
    if (isBinary) {
      if (buffer.byteLength > DICTATION_LIMITS.maxFrameBytes) {
        this.#fatal('frame_too_large', 'Dictation audio frame is too large')
        return
      }
      if (this.#phase !== 'relaying' || !this.#node) {
        this.#fatal('protocol', 'Dictation audio arrived before the stream was ready')
        return
      }
      if (this.#node.bufferedAmount + buffer.byteLength > DICTATION_LIMITS.maxBacklogBytes) {
        this.#fatal('backpressure', `${this.#computerName} is not keeping up with the audio`)
        return
      }
      this.#node.send(buffer, { binary: true })
      return
    }
    let message: DictationClientMessage
    try {
      message = parseDictationClientMessage(buffer.toString('utf8'))
    } catch (error) {
      this.#fatal('protocol', error instanceof Error ? error.message : 'Invalid dictation message')
      return
    }
    if (this.#phase === 'relaying') {
      if (message.type === 'cancel') this.#cancelled = true
      this.#node?.send(JSON.stringify(message))
      return
    }
    switch (message.type) {
      case 'start':
        if (this.#phase === 'waiting') void this.#start(message)
        else this.#fatal('protocol', 'Dictation already started')
        return
      case 'heartbeat':
        return
      case 'cancel':
        this.#end('cancelled', 1000, 'Dictation cancelled')
        return
      case 'stop':
        if (this.#phase === 'connecting') {
          this.#toBrowser({ protocol: DICTATION_PROTOCOL, type: 'final', text: '', reason: 'stop' }, true)
          this.#end('final', 1000, 'Dictation finished')
        } else {
          this.#fatal('protocol', 'Dictation has not started')
        }
    }
  }

  async #start(message: Extract<DictationClientMessage, { type: 'start' }>): Promise<void> {
    this.#streamId = message.streamId
    if (this.#target.kind === 'unavailable') {
      this.#fatal('node_offline', this.#target.reason)
      return
    }
    if (!this.#context.claim(this)) {
      this.#fatal('busy', `Live dictation is already in use on ${this.#computerName}`)
      return
    }
    this.#phase = 'connecting'
    let node: WebSocket
    try {
      node = await this.#context.computers.connectDictation(
        this.#target.computer.id,
        this.#connecting.signal,
      )
    } catch (error) {
      if (this.#phase !== 'connecting') return
      if (statusCodeOf(error) === 404) this.#fatal('node_outdated', outdatedReason(this.#computerName))
      else this.#fatal('node_offline', `${this.#computerName} could not be reached`)
      return
    }
    if (this.#phase !== 'connecting') {
      node.close(1000, 'Dictation ended')
      return
    }
    this.#node = node
    this.#phase = 'relaying'
    this.#clearBrowserWatch()
    node.on('message', (data, isBinary) => this.#fromNode(data, isBinary))
    node.on('close', (code) => this.#nodeClosed(code))
    // A failed socket always closes as well.
    node.on('error', () => undefined)
    this.#armNodeStall()
    node.send(JSON.stringify(message))
  }

  #fromNode(data: WebSocket.RawData, isBinary: boolean): void {
    if (this.#phase === 'ended') return
    this.#armNodeStall()
    let message: DictationServerMessage
    try {
      if (isBinary) throw new Error('binary')
      message = parseDictationServerMessage(rawBuffer(data).toString('utf8'))
    } catch {
      this.#fatal('protocol', `${this.#computerName} sent an invalid dictation message`)
      return
    }
    if (message.type === 'final' || (message.type === 'error' && message.fatal)) this.#ended = true
    this.#toBrowser(message)
  }

  #nodeClosed(code: number): void {
    if (this.#phase === 'ended') return
    if (!this.#ended && !this.#cancelled) {
      this.#fatal('node_offline', `${this.#computerName} disconnected`)
      return
    }
    this.#end(this.#cancelled ? 'cancelled' : 'relayed', sendableCloseCode(code), 'Dictation finished')
  }

  #browserClosed(): void {
    this.#end('disconnected', 1000, 'Dictation socket closed')
  }

  #toBrowser(message: DictationServerMessage, force = false): void {
    if (this.#phase === 'ended' || this.#browser.readyState !== OPEN) return
    const payload = JSON.stringify(message)
    if (!force && this.#browser.bufferedAmount + Buffer.byteLength(payload) > DICTATION_LIMITS.maxBacklogBytes) {
      this.#fatal('backpressure', 'The dictation connection is not keeping up')
      return
    }
    this.#browser.send(payload)
  }

  #fatal(code: DictationErrorCode, message: string): void {
    if (this.#phase === 'ended') return
    this.#toBrowser({ protocol: DICTATION_PROTOCOL, type: 'error', code, message, fatal: true }, true)
    this.#end(`error:${code}`, DICTATION_CLOSE_CODES[code], message)
  }

  #end(outcome: string, code: number, reason: string): void {
    if (this.#phase === 'ended') return
    this.#phase = 'ended'
    this.#connecting.abort()
    this.#clearBrowserWatch()
    if (this.#nodeStall !== undefined) clearTimeout(this.#nodeStall)
    this.#context.release(this)
    if (this.#streamId !== undefined) {
      this.#context.log.info({ streamId: this.#streamId, relayed: true, outcome }, 'Live dictation relay ended')
    }
    if (this.#node && this.#node.readyState === OPEN) this.#node.close(1000, 'Dictation ended')
    if (this.#browser.readyState === OPEN) this.#browser.close(code, closeReason(reason))
  }

  #armBrowserStall(): void {
    if (this.#browserStall !== undefined) clearTimeout(this.#browserStall)
    this.#browserStall = setTimeout(() => {
      this.#fatal('stalled', 'The dictation connection stopped responding')
    }, DICTATION_LIMITS.stallMs)
  }

  #armNodeStall(): void {
    if (this.#nodeStall !== undefined) clearTimeout(this.#nodeStall)
    this.#nodeStall = setTimeout(() => {
      this.#fatal('node_offline', `${this.#computerName} stopped responding`)
    }, DICTATION_LIMITS.stallMs)
  }

  /** Until the node answers, the hub keeps the browser's connection alive itself. */
  #scheduleHeartbeat(): void {
    this.#heartbeat = setTimeout(() => {
      if (this.#phase !== 'waiting' && this.#phase !== 'connecting') return
      this.#toBrowser({ protocol: DICTATION_PROTOCOL, type: 'heartbeat' })
      this.#scheduleHeartbeat()
    }, DICTATION_LIMITS.heartbeatMs)
  }

  #clearBrowserWatch(): void {
    if (this.#browserStall !== undefined) clearTimeout(this.#browserStall)
    if (this.#heartbeat !== undefined) clearTimeout(this.#heartbeat)
    this.#browserStall = undefined
    this.#heartbeat = undefined
  }
}

/** The node's close code, unless it is one only a peer may report. */
function sendableCloseCode(code: number): number {
  return code === 1000 || code === 1001 || (code >= 1007 && code <= 1014) || (code >= 3000 && code <= 4999)
    ? code
    : 1011
}

function statusCodeOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const statusCode = Reflect.get(error, 'statusCode')
  return typeof statusCode === 'number' ? statusCode : undefined
}
