import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import type WebSocket from 'ws'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  decodeVoiceAudioFrame,
  encodeVoiceAudioFrame,
  isVoiceClientControl,
  voiceAudioFrameByteLength,
  type VoiceCapabilities,
} from '../shared/oracle-voice.js'
import type {
  ComputerSummary,
  NodeInfo,
  VoiceBackendCapability,
} from '../shared/contracts.js'
import type {
  ManagerEventSource,
} from './manager-routes.js'
import {
  OracleVoiceCoordinator,
  type OracleVoiceBackendConnection,
  type OracleVoiceBackendConnector,
  type OracleVoiceBackendDisconnect,
  type OracleVoiceBackendOutput,
  type OracleVoiceManager,
} from './oracle-voice-coordinator.js'
import {
  DEFAULT_VOICE_BACKEND_LIMITS,
  VoiceSessionError,
  type VoiceBackend,
  type VoiceBackendSessionLimits,
  voiceOutputDeliveryByteLimit,
} from './oracle-voice-session.js'
import {
  VoiceTicketStore,
  type VoiceTicketClient,
} from './oracle-voice-tickets.js'
import type {
  RemoteVoiceClient,
  RemoteVoiceDisconnectError,
} from './remote-voice-client.js'

const VOICE_OUTPUT_DRAIN_TIMEOUT_MS = 1_000
const VOICE_BROWSER_SEND_TIMEOUT_MS = 5_000

export interface OracleVoiceComputerManager {
  listComputers(): ComputerSummary[]
  connectVoice(
    computerId: string,
    streamId: string,
    signal?: AbortSignal,
  ): Promise<RemoteVoiceClient>
}

export interface OracleVoiceRouteOptions {
  identity: { info: NodeInfo }
  computers: OracleVoiceComputerManager
  manager?: OracleVoiceManager
  managerEvents?: ManagerEventSource
  localBackend?: VoiceBackend
  selectedComputerName?: string
  unavailableReason: string
  tickets?: VoiceTicketStore
}

interface SelectedVoiceBackend {
  capability: VoiceCapabilities
  busy: boolean
  connector?: OracleVoiceBackendConnector
  limits: VoiceBackendSessionLimits
  releasesPendingStart: boolean
}

interface ActiveConversation {
  requestId: string
  selection: SelectedVoiceBackend
  coordinator?: OracleVoiceCoordinator
  closing?: Promise<void>
  claimAdmission?: () => void
}

export async function registerOracleVoiceRoutes(
  app: FastifyInstance,
  options: OracleVoiceRouteOptions,
): Promise<void> {
  const tickets = options.tickets ?? new VoiceTicketStore()
  let active: ActiveConversation | undefined

  app.get('/api/oracle-voice/capabilities', async (_request, reply) => {
    reply.header('cache-control', 'no-store')
    return selectBackend(options).capability
  })

  app.post('/api/oracle-voice/tickets', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    const selection = selectBackend(options)
    if (!selection.capability.available) {
      return reply.code(503).send({ error: selection.capability.reason })
    }
    const client = ticketClient(request.headers.origin, request.ip)
    const issued = tickets.issueWithExpiration(client)
    return reply.code(201).send({
      ticket: issued.ticket,
      expiresAt: new Date(issued.expiresAt).toISOString(),
    })
  })

  app.get<{ Querystring: { ticket?: string } }>(
    '/api/oracle-voice',
    {
      websocket: true,
      // The single-use bearer is in the query string, so automatic access
      // logging must not serialize this route's URL.
      logLevel: 'silent',
      preValidation: async (request, reply) => {
        if (!isWebSocketUpgrade(request.headers)) {
          return reply.code(404).send({ error: 'Oracle voice requires a WebSocket upgrade' })
        }
        const ticket = request.query.ticket
        if (typeof ticket !== 'string' || ticket.length === 0 || ticket.length > 512) {
          return reply.code(401).send({ error: 'A valid Oracle voice ticket is required' })
        }
        let consumed
        try {
          consumed = tickets.consume(
            ticket,
            ticketClient(request.headers.origin, request.ip),
          )
        } catch {
          consumed = undefined
        }
        if (!consumed) {
          return reply.code(401).send({ error: 'Oracle voice ticket is invalid or expired' })
        }
        const selection = selectBackend(options)
        if (!selection.capability.available) {
          return reply.code(503).send({ error: selection.capability.reason })
        }
        if (active || selection.busy) {
          return reply.code(409).send({ error: 'Oracle voice is already in use' })
        }
        const reservation: ActiveConversation = {
          requestId: request.id,
          selection,
        }
        const releaseUnclaimed = () => {
          if (active === reservation) active = undefined
        }
        reservation.claimAdmission = () => {
          request.raw.socket.off('close', releaseUnclaimed)
          reservation.claimAdmission = undefined
        }
        active = reservation
        request.raw.socket.once('close', releaseUnclaimed)
      },
    },
    (socket, request) => {
      const reservation = active
      if (!reservation || reservation.requestId !== request.id) {
        socket.close(1013, 'Oracle voice is already in use')
        return
      }
      reservation.claimAdmission?.()
      const streamId = randomUUID()
      const coordinator = new OracleVoiceCoordinator({
        streamId,
        manager: options.manager!,
        managerEvents: options.managerEvents,
        backend: reservation.selection.connector!,
        send: (output) => sendBrowserOutput(
          socket,
          output,
          reservation.selection.limits,
        ),
        terminate: (code, reason) =>
          socket.close(browserCloseCode(code), closeReason(reason)),
      })
      reservation.coordinator = coordinator

      const release = () => {
        if (active === reservation) active = undefined
      }
      const closeCoordinator = (reason: string) => {
        if (!reservation.closing) {
          const closing = coordinator.close(reason)
          reservation.closing = reservation.selection.releasesPendingStart
            ? closing
            : closing.finally(release)
          if (reservation.selection.releasesPendingStart) release()
        }
        return reservation.closing
      }
      let pendingInputBytes = 0
      let inputClosed = false
      socket.on('message', (data, isBinary) => {
        if (inputClosed) return
        const bytes = rawDataBuffer(data).byteLength
        if (isBinary && bytes > reservation.selection.limits.maxFrameBytes) {
          inputClosed = true
          socket.close(1009, 'Browser voice frame is too large')
          return
        }
        if (
          bytes > reservation.selection.limits.maxQueueBytes - pendingInputBytes
        ) {
          inputClosed = true
          socket.close(1013, 'Browser voice input queue is full')
          return
        }
        pendingInputBytes += bytes
        void receiveBrowserMessage(coordinator, streamId, data, isBinary)
          .catch((error: unknown) => {
            const failure = sessionError(error)
            socket.close(failure.closeCode, closeReason(failure.message))
          })
          .finally(() => {
            pendingInputBytes -= bytes
          })
      })
      socket.once('close', () => {
        void closeCoordinator('Browser voice socket closed')
      })
      socket.once('error', () => {
        void closeCoordinator('Browser voice socket failed')
      })
      void coordinator.start().catch(async (error: unknown) => {
        const closeCode = startupCloseCode(error)
        try {
          socket.close(
            closeCode,
            closeReason(errorMessage(error, 'Oracle voice failed to start')),
          )
        } finally {
          await closeCoordinator('Oracle voice failed to start')
        }
      })
    },
  )

  app.addHook('onClose', async () => {
    const conversation = active
    if (conversation) {
      await (
        conversation.closing
        ?? conversation.coordinator?.close('Agentic Remote is shutting down')
        ?? Promise.resolve()
      )
      if (active === conversation) active = undefined
    }
  })
}

export function isWebSocketUpgrade(
  headers: Record<string, string | string[] | undefined>,
): boolean {
  if (headers.upgrade?.toString().toLowerCase() !== 'websocket') return false
  const connection = headers.connection?.toString().toLowerCase().split(',')
    .map((token) => token.trim())
  if (!connection?.includes('upgrade')) return false
  if (headers['sec-websocket-version']?.toString() !== '13') return false
  const key = headers['sec-websocket-key']
  if (typeof key !== 'string') return false
  const normalizedKey = key.trim()
  if (!/^[A-Za-z0-9+/]{22}==$/.test(normalizedKey)) return false
  const decoded = Buffer.from(normalizedKey, 'base64')
  return decoded.byteLength === 16
    && decoded.toString('base64') === normalizedKey
}

function selectBackend(options: OracleVoiceRouteOptions): SelectedVoiceBackend {
  if (!options.manager) {
    return unavailableSelection(
      options,
      'Oracle is unavailable, so Conversation mode cannot start.',
    )
  }
  if (options.selectedComputerName) {
    const selected = options.computers.listComputers().find(
      (computer) =>
        !computer.isLocal && computer.name === options.selectedComputerName,
    )
    if (!selected) {
      return unavailableSelection(
        options,
        `Configured voice computer "${options.selectedComputerName}" is not paired.`,
        options.selectedComputerName,
      )
    }
    if (!selected.online) {
      return unavailableSelection(
        options,
        `Configured voice computer "${selected.name}" is offline.`,
        selected.name,
        selected.id,
      )
    }
    if (!selected.voice) {
      return unavailableSelection(
        options,
        `Configured voice computer "${selected.name}" does not report voice support.`,
        selected.name,
        selected.id,
      )
    }
    if (!selected.voice.available) {
      return unavailableSelection(
        options,
        selected.voice.reason,
        selected.name,
        selected.id,
      )
    }
    const limits = {
      ...DEFAULT_VOICE_BACKEND_LIMITS,
      maxOutputQueueBytes: voiceOutputDeliveryByteLimit(
        selected.voice.playbackSampleRate,
        DEFAULT_VOICE_BACKEND_LIMITS.maxFrameBytes,
      ),
    }
    return {
      capability: availableCapabilities(selected, selected.voice, limits),
      busy: false,
      connector: remoteConnector(options.computers, selected.id),
      limits,
      releasesPendingStart: false,
    }
  }

  const local = options.localBackend
  if (!local) return unavailableSelection(options, options.unavailableReason)
  const capability = local.capability()
  const limits = local.limits()
  if (!capability.available) {
    return unavailableSelection(options, capability.reason)
  }
  return {
    capability: availableCapabilities(
      {
        id: options.identity.info.id,
        name: options.identity.info.name,
      },
      capability,
      limits,
    ),
    busy: local.busy(),
    connector: localConnector(local, options.identity.info),
    limits,
    releasesPendingStart: true,
  }
}

export function localConnector(
  backend: VoiceBackend,
  info: NodeInfo,
): OracleVoiceBackendConnector {
  return {
    async connect(options): Promise<OracleVoiceBackendConnection> {
      const capability = backend.capability()
      if (!capability.available) throw new VoiceSessionError(capability.reason, 1011)
      const relay = backendOutputRelay(
        options.output,
        options.disconnect,
        backend.limits(),
      )
      const session = await backend.open({
        streamId: options.streamId,
        signal: options.signal,
        send: (output) => {
          const delivery = relay.accept(output)
          void delivery.catch(() => undefined)
          return Promise.resolve()
        },
        terminate: (failure) => {
          void options.disconnect(failure).catch(() => undefined)
        },
      })
      return {
        capabilities: availableCapabilities(
          { id: info.id, name: info.name },
          capability,
          backend.limits(),
        ),
        control: (message) => session.control(message),
        audio: (frame) => session.audio(frame),
        close: async (reason) => {
          await session.close(reason)
          await shutdownBackendOutput(
            relay,
            () => session.close('Voice backend output shutdown timed out'),
          )
        },
      }
    },
  }
}

function remoteConnector(
  computers: OracleVoiceComputerManager,
  computerId: string,
): OracleVoiceBackendConnector {
  return {
    async connect(options): Promise<OracleVoiceBackendConnection> {
      const client = await computers.connectVoice(
        computerId,
        options.streamId,
        options.signal,
      )
      const relay = backendOutputRelay(
        options.output,
        options.disconnect,
        {
          ...client.capabilities.limits,
          maxOutputQueueBytes: voiceOutputDeliveryByteLimit(
            client.capabilities.playbackSampleRate,
            client.capabilities.limits.maxFrameBytes,
          ),
          idleTimeoutMs: DEFAULT_VOICE_BACKEND_LIMITS.idleTimeoutMs,
        },
      )
      const output = (message: OracleVoiceBackendOutput) => {
        void relay.accept(message).catch(() => undefined)
      }
      const disconnect = (error: RemoteVoiceDisconnectError) => {
        void options.disconnect({
          code: error.code,
          reason: error.message || error.reason || 'Selected voice computer disconnected',
          retryable: error.retryable,
          cause: error.cause,
        }).catch(() => undefined)
      }
      client.on('event', output)
      client.on('disconnect', disconnect)
      let closed = false
      return {
        capabilities: client.capabilities,
        control: (message) => client.control(message),
        audio: (frame) => client.audio(frame),
        close: async (reason) => {
          if (closed) return
          closed = true
          client.off('event', output)
          client.off('disconnect', disconnect)
          await client.close(reason)
          await shutdownBackendOutput(
            relay,
            () => client.close('Voice backend output shutdown timed out'),
          )
        },
      }
    },
  }
}

async function receiveBrowserMessage(
  coordinator: OracleVoiceCoordinator,
  streamId: string,
  data: WebSocket.RawData,
  isBinary: boolean,
): Promise<void> {
  if (isBinary) {
    const frame = decodeVoiceAudioFrame(exactArrayBuffer(data))
    if (frame.direction !== 'microphone') {
      throw new VoiceSessionError('Browser voice accepts microphone audio only', 1008)
    }
    await coordinator.receive(frame)
    return
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(rawDataBuffer(data).toString('utf8')) as unknown
  } catch {
    throw new VoiceSessionError('Invalid Oracle voice control JSON', 1007)
  }
  if (!isVoiceClientControl(parsed) || parsed.streamId !== streamId) {
    throw new VoiceSessionError('Invalid Oracle voice control message', 1008)
  }
  await coordinator.receive(parsed)
}

export function sendBrowserOutput(
  socket: WebSocket,
  output: OracleVoiceBackendOutput,
  limits: VoiceBackendSessionLimits,
  timeoutMs = VOICE_BROWSER_SEND_TIMEOUT_MS,
): Promise<void> {
  if (
    'direction' in output
    && voiceAudioFrameByteLength(output) > limits.maxFrameBytes
  ) {
    return Promise.reject(new VoiceSessionError('Voice playback frame is too large', 1009))
  }
  const payload = 'direction' in output
    ? Buffer.from(encodeVoiceAudioFrame(output))
    : JSON.stringify(output)
  const bytes = typeof payload === 'string' ? Buffer.byteLength(payload) : payload.byteLength
  if (socket.readyState !== socket.OPEN) {
    return Promise.reject(new VoiceSessionError('Browser voice socket disconnected', 1001))
  }
  if (
    bytes > limits.maxQueueBytes
    || socket.bufferedAmount > limits.maxQueueBytes - bytes
  ) {
    return Promise.reject(new VoiceSessionError('Browser voice output queue is full', 1013))
  }
  const delivery = new Promise<void>((resolve, reject) => {
    socket.send(payload, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<void>((_resolve, reject) => {
    timer = setTimeout(() => {
      try {
        socket.terminate()
      } catch (error) {
        reject(error)
        return
      }
      reject(new VoiceSessionError('Browser voice output timed out', 1001))
    }, timeoutMs)
    timer.unref()
  })
  return Promise.race([delivery, timeout]).finally(() => {
    if (timer) clearTimeout(timer)
  })
}

export function backendOutputRelay(
  deliver: (output: OracleVoiceBackendOutput) => Promise<void>,
  disconnect: (failure: OracleVoiceBackendDisconnect) => Promise<void>,
  limits: VoiceBackendSessionLimits,
): {
  accept(output: OracleVoiceBackendOutput): Promise<void>
  drain(): Promise<void>
  close(reason?: Error): void
  abort(reason?: Error): void
  pendingBytes(): number
} {
  interface PendingOutput {
    output?: OracleVoiceBackendOutput
    bytes: number
    settled: boolean
    resolve(): void
    reject(error: unknown): void
  }

  let pendingBytes = 0
  let closed = false
  let failed = false
  let inFlight: PendingOutput | undefined
  const queue: PendingOutput[] = []
  const drainWaiters = new Set<() => void>()

  const settleDrain = () => {
    if (inFlight || queue.length > 0) return
    for (const resolve of drainWaiters) resolve()
    drainWaiters.clear()
  }
  const rejectEntry = (entry: PendingOutput, error: unknown) => {
    if (entry.settled) return
    entry.settled = true
    entry.output = undefined
    entry.reject(error)
  }
  const abort = (
    reason: Error = new VoiceSessionError('Voice backend output is closed', 1001),
  ) => {
    if (closed) return
    closed = true
    const pending = [
      ...(inFlight ? [inFlight] : []),
      ...queue.splice(0),
    ]
    inFlight = undefined
    pendingBytes = 0
    for (const entry of pending) rejectEntry(entry, reason)
    settleDrain()
  }
  const fail = (error: unknown, closeCode: number) => {
    if (failed) return
    failed = true
    abort(error instanceof Error ? error : new Error(errorMessage(error, 'Voice backend output failed')))
    const deliveryTransportFailure = !(error instanceof VoiceSessionError)
      || error.closeCode === 1001
    void disconnect({
      code: closeCode,
      reason: errorMessage(error, 'Voice backend output failed'),
      retryable: deliveryTransportFailure,
      cause: deliveryTransportFailure
        ? 'transport'
        : error instanceof VoiceSessionError
        ? disconnectCause(error.closeCode)
        : 'internal',
    }).catch(() => undefined)
  }
  const pump = () => {
    if (closed || inFlight) return
    const entry = queue.shift()
    if (!entry?.output) {
      settleDrain()
      return
    }
    inFlight = entry
    const output = entry.output
    let delivery: Promise<void>
    try {
      delivery = deliver(output)
    } catch (error) {
      delivery = Promise.reject(error)
    }
    void delivery.then(
      () => {
        if (entry.settled) return
        entry.settled = true
        entry.output = undefined
        pendingBytes -= entry.bytes
        entry.resolve()
        if (inFlight === entry) inFlight = undefined
        pump()
      },
      (error: unknown) => {
        if (entry.settled) return
        entry.settled = true
        entry.output = undefined
        pendingBytes -= entry.bytes
        entry.reject(error)
        if (inFlight === entry) inFlight = undefined
        fail(error, error instanceof VoiceSessionError ? error.closeCode : 1011)
      },
    )
  }
  return {
    accept(output) {
      const bytes = backendOutputBytes(output)
      if (closed) {
        return Promise.reject(new VoiceSessionError('Voice backend output is closed', 1001))
      }
      if (bytes > limits.maxOutputQueueBytes - pendingBytes) {
        const error = new VoiceSessionError('Voice backend output queue is full', 1013)
        fail(error, error.closeCode)
        return Promise.reject(error)
      }
      pendingBytes += bytes
      const delivery = new Promise<void>((resolve, reject) => {
        queue.push({
          output,
          bytes,
          settled: false,
          resolve,
          reject,
        })
      })
      pump()
      return delivery
    },
    drain() {
      if (!inFlight && queue.length === 0) return Promise.resolve()
      return new Promise<void>((resolve) => {
        drainWaiters.add(resolve)
      })
    },
    close(reason) {
      abort(reason)
    },
    abort(reason) {
      abort(reason)
    },
    pendingBytes() {
      return pendingBytes
    },
  }
}

export async function shutdownBackendOutput(
  relay: Pick<
    ReturnType<typeof backendOutputRelay>,
    'drain' | 'close' | 'abort'
  >,
  abortTransport?: () => Promise<void>,
  timeoutMs = VOICE_OUTPUT_DRAIN_TIMEOUT_MS,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined
  let timedOut = false
  await Promise.race([
    relay.drain(),
    new Promise<void>((resolve) => {
      timer = setTimeout(() => {
        timedOut = true
        resolve()
      }, timeoutMs)
      timer.unref()
    }),
  ])
  if (timer) clearTimeout(timer)
  if (timedOut) {
    relay.abort(new Error('Voice backend output shutdown timed out'))
    await abortTransport?.().catch(() => undefined)
    return
  }
  relay.close()
}

function backendOutputBytes(output: OracleVoiceBackendOutput): number {
  return 'direction' in output
    ? voiceAudioFrameByteLength(output)
    : Buffer.byteLength(JSON.stringify(output))
}

function availableCapabilities(
  computer: Pick<ComputerSummary, 'id' | 'name'>,
  capability: Extract<VoiceBackendCapability, { available: true }>,
  limits: VoiceBackendSessionLimits,
): VoiceCapabilities {
  return {
    protocol: ORACLE_VOICE_PROTOCOL,
    available: true,
    computerId: computer.id,
    computerName: computer.name,
    sampleRate: capability.sampleRate,
    playbackSampleRate: capability.playbackSampleRate,
    languages: [...capability.languages],
    sttProfile: capability.sttProfile,
    ttsVoice: capability.ttsVoice,
    resourceClass: capability.resourceClass,
    limits: {
      maxFrameBytes: limits.maxFrameBytes,
      maxQueueBytes: limits.maxQueueBytes,
      maxUtteranceMs: limits.maxUtteranceMs,
    },
  }
}

function unavailableSelection(
  options: OracleVoiceRouteOptions,
  reason: string,
  computerName = options.identity.info.name,
  computerId = options.identity.info.id,
): SelectedVoiceBackend {
  const limits = options.localBackend?.limits() ?? DEFAULT_VOICE_BACKEND_LIMITS
  return {
    capability: {
      protocol: ORACLE_VOICE_PROTOCOL,
      available: false,
      computerId,
      computerName,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: ORACLE_VOICE_SAMPLE_RATE,
      languages: [],
      sttProfile: '',
      ttsVoice: '',
      resourceClass: 'low',
      limits: {
        maxFrameBytes: limits.maxFrameBytes,
        maxQueueBytes: limits.maxQueueBytes,
        maxUtteranceMs: limits.maxUtteranceMs,
      },
      reason,
    },
    busy: false,
    limits,
    releasesPendingStart: false,
  }
}

/** The browser a ticket is bound to; `feature` names what needs the Origin header. */
export function ticketClient(
  origin: string | undefined,
  address: string,
  feature = 'Oracle voice',
): VoiceTicketClient {
  if (!origin) throw Object.assign(new Error(`${feature} requires an Origin header`), {
    statusCode: 400,
  })
  return { origin, address }
}

function rawDataBuffer(data: WebSocket.RawData): Buffer {
  if (Array.isArray(data)) return Buffer.concat(data)
  if (data instanceof ArrayBuffer) return Buffer.from(data)
  return Buffer.from(data.buffer, data.byteOffset, data.byteLength)
}

function exactArrayBuffer(data: WebSocket.RawData): ArrayBuffer {
  const buffer = rawDataBuffer(data)
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
}

function sessionError(error: unknown): VoiceSessionError {
  if (error instanceof VoiceSessionError) return error
  return new VoiceSessionError(errorMessage(error, 'Oracle voice stream failed'), 1008)
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function closeReason(reason: string): string {
  return reason.replace(/[^\x20-\x7e]/g, '').slice(0, 120) || 'Oracle voice closed'
}

function disconnectCause(code: number): OracleVoiceBackendDisconnect['cause'] {
  if (code === 1013) return 'backpressure'
  if (
    code === 1002
    || code === 1003
    || code === 1007
    || code === 1008
    || code === 1009
  ) {
    return 'protocol'
  }
  if (code === 1011) return 'internal'
  return 'policy'
}

function browserCloseCode(code: number): number {
  if (
    Number.isInteger(code)
    && code >= 1_000
    && code <= 4_999
    && code !== 1_004
    && code !== 1_005
    && code !== 1_006
    && code !== 1_015
  ) {
    return code
  }
  return 1_011
}

function startupCloseCode(error: unknown): number {
  if (error instanceof VoiceSessionError) return browserCloseCode(error.closeCode)
  if (
    typeof error === 'object'
    && error !== null
    && Reflect.get(error, 'statusCode') === 409
  ) {
    return 1_013
  }
  return 1_011
}
