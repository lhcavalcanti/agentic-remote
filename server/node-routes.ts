import { timingSafeEqual } from 'node:crypto'
import { SKILL_SETTINGS_CAPABILITY } from '../shared/skill-settings.js'
import type { SkillSettingsService } from './skill-settings.js'
import { registerSkillSettingsRoutes } from './skill-settings-routes.js'
import { Readable } from 'node:stream'
import type { FastifyInstance } from 'fastify'
import type WebSocket from 'ws'
import { z } from 'zod'
import { launchIdentitySchema, cancellationAckSchema } from '../shared/launch-identity.js'
import { HOST_TELEMETRY_CAPABILITY_VERSION } from '../shared/host-telemetry.js'
import type { HostTelemetryService } from './host-telemetry/service.js'
import { registerHostTelemetryRoutes } from './host-telemetry/routes.js'
import { updateComputerForLaunchIdentity } from './launch-identity.js'
import {
  SCHEDULE_WORKTREE_VERSION, scheduleWorktreeInputSchema, scheduleWorktreeCleanupSchema,
  updateComputerForScheduleWorktrees,
} from '../shared/schedule-worktrees.js'
import type { ScheduleWorktreeService } from './schedule-worktrees.js'
import {
  ORACLE_VOICE_PROTOCOL,
  decodeVoiceAudioFrame,
  encodeVoiceAudioFrame,
  isVoiceClientControl,
  voiceAudioFrameByteLength,
  type VoiceCapabilities,
} from '../shared/oracle-voice.js'
import {
  SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH,
  SIDE_QUESTION_EARLIER_LIMIT,
  SIDE_QUESTION_MAX_LENGTH,
} from './side-question.js'
import type { ServerEvent } from '../shared/contracts.js'
import { activityDetailsUnavailable, toolCallIdSchema } from './activity-details.js'
import {
  FileUploadError,
  MAX_SESSION_FILE_BYTES,
  supportsSessionFile,
} from './file-upload-routes.js'
import { NodeIdentityStore } from './node-identity.js'
import type { SessionService } from './session-service.js'
import { sessionRetentionPatchSchema } from './session-retention.js'
import { isSessionResourceRoute, readSessionSkills, readSessionMcpServers, resourceRequestHandler } from './session-resources.js'
import {
  MAX_AUDIO_BYTES,
  TranscriptionError,
  type TranscriptionService,
} from './transcription-service.js'
import {
  VoiceSessionError,
  type VoiceBackend,
  type VoiceBackendOutput,
  type VoiceBackendSession,
  type VoiceBackendSessionLimits,
} from './oracle-voice-session.js'

export const AUDIO_FILENAME_HEADER = 'x-agentic-audio-filename'
export const AUDIO_TYPE_HEADER = 'x-agentic-audio-type'

const sessionListingQuerySchema = z.object({
  includeArchived: z.enum(['0', '1']).optional(),
}).strict()

const sideQuestionSchema = z.object({
  question: z.string().trim().min(1).max(SIDE_QUESTION_MAX_LENGTH),
  earlier: z.array(z.object({
    question: z.string().trim().min(1).max(SIDE_QUESTION_MAX_LENGTH),
    answer: z.string().trim().min(1).max(SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH),
  })).max(SIDE_QUESTION_EARLIER_LIMIT).optional(),
})

const createSessionSchema = z.object({
  cwd: z.string().trim().min(1).max(4096),
  launchId: launchIdentitySchema.optional(),
  provider: z.enum(['copilot', 'claude']).default('copilot'),
  terminalBacked: z.boolean().default(true),
  allowAllPermissions: z.boolean().default(true),
  model: z.string().trim().min(1).max(200).optional(),
  reasoningEffort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
  contextTier: z.enum(['default', 'long_context']).optional(),
  mode: z.enum(['interactive', 'plan', 'autopilot']).optional(),
})

const renameSessionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine(
      (title) =>
        [...title].every((character) => {
          const code = character.charCodeAt(0)
          return code >= 32 && code !== 127 && character !== '"'
        }),
      'Session names cannot contain control characters or double quotes',
    ),
})

const updateQueuedPromptSchema = z.object({
  // The same shape a message has to take. Without it a whitespace-only edit
  // became a generic server error, and an edit could hold more than any
  // message was ever allowed to.
  content: z.string().max(200_000)
    .refine((content) => content.trim().length > 0, 'Message cannot be blank'),
})

const discardQueuedDispatchSchema = z.object({
  acknowledgesDispatch: z.string().uuid().optional(),
})

const reorderQueueSchema = z.object({
  order: z.array(z.string().min(1)),
})

const sendMessageSchema = z.object({
  deliveryId: launchIdentitySchema.optional(),
  acknowledgesFailure: z.string().max(64).optional(),
  content: z
    .string()
    .max(200_000)
    .refine((content) => content.trim().length > 0, 'Message cannot be blank'),
  enqueue: z.boolean().optional(),
  replaceTerminalDraft: z.boolean().optional(),
})

const permissionReplySchema = z.object({
  optionId: z.string().trim().min(1).max(500),
})

const userInputValueSchema = z.union([
  z.string().max(20_000),
  z.number().finite(),
  z.boolean(),
  z.array(z.string().max(20_000)).max(32),
])

const userInputReplySchema = z.object({
  answer: z.string().trim().max(20_000).default(''),
  wasFreeform: z.boolean().default(false),
  answers: z.array(z.string().trim().min(1).max(20_000)).min(1).max(32).optional(),
  values: z.record(z.string(), userInputValueSchema).optional(),
  action: z.enum(['accept', 'decline', 'cancel']).optional(),
})

const executeCommandSchema = z.object({
  acknowledgesFailure: z.string().max(64).optional(),
  command: z.string().trim().startsWith('/').max(10_000),
  enqueue: z.boolean().optional(),
  replaceTerminalDraft: z.boolean().optional(),
})

const configureRuntimeSchema = z.object({
  model: z.string().trim().min(1).max(200),
  reasoningEffort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
  contextTier: z.enum(['default', 'long_context']),
  mode: z.enum(['interactive', 'plan', 'autopilot']).optional(),
})

const recoverConversationSchema = z.object({
  reason: z.enum(['provider-error', 'stale-sdk-interaction', 'manual']),
})

const directoryQuerySchema = z.object({
  scope: z.enum(['home', 'all']).optional(),
  path: z.string().trim().max(4096).optional(),
})
const directoryValidationSchema = z.object({
  path: z.string().trim().min(1).max(4096),
})
const sessionKnowledgeBaseSchema = z.object({
  path: z.string().trim().min(1).max(4096),
  create: z.boolean().optional().default(false),
}).strict()
const knowledgeValidationSchema = z.object({
  path: z.string().trim().min(1).max(4096),
  confinement: z.string().trim().min(1).max(4096).optional(),
}).strict()
const knowledgeQuerySchema = z.object({
  root: z.string().trim().min(1).max(4096),
  path: z.string().trim().max(4096).optional(),
  confinement: z.string().trim().min(1).max(4096).optional(),
})

const knowledgeFileQuerySchema = z.object({
  root: z.string().trim().min(1).max(4096),
  path: z.string().trim().min(1).max(4096),
  confinement: z.string().trim().min(1).max(4096).optional(),
})

const workspaceFileQuerySchema = z.object({
  path: z.string().trim().min(1).max(4096),
})

const workspaceSearchQuerySchema = z.object({
  query: z.string().trim().min(2).max(200),
  path: z.string().trim().max(4096).optional(),
})

function tokenMatches(actual: string | undefined, expected: string): boolean {
  const prefix = 'Bearer '
  if (!actual?.startsWith(prefix)) {
    return false
  }
  const received = Buffer.from(actual.slice(prefix.length))
  const stored = Buffer.from(expected)
  return received.length === stored.length && timingSafeEqual(received, stored)
}

function nodeVoiceCapabilities(
  identity: NodeIdentityStore,
  voice: VoiceBackend,
): VoiceCapabilities {
  const capability = voice.capability()
  if (!capability.available) {
    throw new VoiceSessionError(capability.reason, 1011)
  }
  const limits = voice.limits()
  return {
    protocol: ORACLE_VOICE_PROTOCOL,
    available: true,
    computerId: identity.info.id,
    computerName: identity.info.name,
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

async function receiveNodeVoiceMessage(
  session: VoiceBackendSession,
  streamId: string,
  data: WebSocket.RawData,
  isBinary: boolean,
  limits: VoiceBackendSessionLimits,
): Promise<void> {
  const messageLimit = isBinary ? limits.maxFrameBytes : limits.maxQueueBytes
  if (rawDataByteLength(data) > messageLimit) {
    throw new VoiceSessionError('Node voice frame is too large', 1009)
  }
  if (isBinary) {
    const buffer = rawDataBuffer(data)
    const frame = decodeVoiceAudioFrame(exactArrayBuffer(buffer))
    if (frame.direction !== 'microphone') {
      throw new VoiceSessionError('Node voice clients may send microphone audio only', 1008)
    }
    await session.audio(frame)
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
  await session.control(parsed)
}

export function sendNodeVoiceOutput(
  socket: WebSocket,
  output: VoiceBackendOutput,
  limits: VoiceBackendSessionLimits,
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
    return Promise.reject(new VoiceSessionError('Node voice socket disconnected', 1001))
  }
  if (socket.bufferedAmount > limits.maxQueueBytes - bytes) {
    return Promise.reject(new VoiceSessionError('Node voice output queue is full', 1013))
  }
  return new Promise((resolve, reject) => {
    socket.send(payload, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function closeVoiceSocket(socket: WebSocket, error: unknown): void {
  const failure = error instanceof VoiceSessionError
    ? error
    : new VoiceSessionError(
        error instanceof Error && error.message ? error.message : 'Oracle voice backend failed',
        1011,
      )
  socket.close(failure.closeCode, closeReason(failure.message))
}

function rawDataByteLength(data: WebSocket.RawData): number {
  if (!Array.isArray(data)) return data.byteLength
  return data.reduce((total, chunk) => total + chunk.byteLength, 0)
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

function closeReason(reason: string): string {
  return reason.replace(/[^\x20-\x7e]/g, '').slice(0, 120) || 'Oracle voice closed'
}

export async function registerNodeRoutes(
  app: FastifyInstance,
  service: SessionService,
  identity: NodeIdentityStore,
  transcription: TranscriptionService,
  voice?: VoiceBackend,
  hostTelemetry?: HostTelemetryService,
  hostTelemetrySignal?: AbortSignal,
  scheduleWorktrees?: ScheduleWorktreeService,
  skillSettings?: SkillSettingsService,
): Promise<void> {
  await app.register(
    async (node) => {
      const readResource = resourceRequestHandler(node)
      node.addContentTypeParser(
        'application/octet-stream',
        {
          parseAs: 'buffer',
          bodyLimit: Math.max(MAX_SESSION_FILE_BYTES, MAX_AUDIO_BYTES),
        },
        (_request, body, done) => done(null, body),
      )
      node.addHook('onRequest', async (request, reply) => {
        if (isSessionResourceRoute(request.routeOptions.url)) reply.header('cache-control', 'no-store')
        if (!tokenMatches(request.headers.authorization, identity.token)) {
          return reply.code(401).send({ error: 'Invalid node token' })
        }
      })

      node.get('/info', async () => ({
        ...identity.info,
        providers: service.providers(),
        ...(voice ? { voice: voice.capability() } : {}),
        hostTelemetry: { version: HOST_TELEMETRY_CAPABILITY_VERSION, enabled: hostTelemetry !== undefined },
        scheduleWorktrees: { version: SCHEDULE_WORKTREE_VERSION, enabled: scheduleWorktrees?.enabled === true },
        ...(skillSettings ? { skillSettings: { version: SKILL_SETTINGS_CAPABILITY } } : {}),
      }))

      node.post('/schedule-worktrees', async (request, reply) => {
        reply.header('cache-control', 'no-store')
        if (!scheduleWorktrees) throw updateComputerForScheduleWorktrees()
        return { worktree: await scheduleWorktrees.allocate(scheduleWorktreeInputSchema.parse(request.body)) }
      })
      node.get<{ Params: { launchId: string } }>('/schedule-worktrees/:launchId', async (request, reply) => {
        reply.header('cache-control', 'no-store')
        if (!scheduleWorktrees) throw updateComputerForScheduleWorktrees()
        return { worktree: await scheduleWorktrees.read(launchIdentitySchema.parse(request.params.launchId)) ?? null }
      })
      node.post<{ Params: { launchId: string } }>('/schedule-worktrees/:launchId/cleanup', async (request, reply) => {
        reply.header('cache-control', 'no-store')
        if (!scheduleWorktrees) throw updateComputerForScheduleWorktrees()
        const { launchId } = scheduleWorktreeCleanupSchema.parse(request.params)
        return { worktree: await scheduleWorktrees.cleanup(launchId) ?? null }
      })

      if (skillSettings) registerSkillSettingsRoutes(node, '/skills', () => skillSettings, true)
      if (hostTelemetry) registerHostTelemetryRoutes(node, '/host', () => hostTelemetry, hostTelemetrySignal)

      node.get<{
        Querystring: { protocol?: string; streamId?: string }
      }>(
        '/oracle-voice',
        {
          websocket: true,
          // The stream identity is carried in the query string and must not
          // appear in automatic request logs.
          logLevel: 'silent',
          preValidation: async (request, reply) => {
            if (request.query.protocol !== String(ORACLE_VOICE_PROTOCOL)) {
              return reply.code(400).send({ error: 'Unsupported Oracle voice protocol' })
            }
            if (
              typeof request.query.streamId !== 'string'
              || request.query.streamId.length === 0
              || request.query.streamId.length > 200
            ) {
              return reply.code(400).send({ error: 'A valid voice stream ID is required' })
            }
            if (!voice) {
              return reply.code(503).send({ error: 'Oracle voice is unavailable on this node' })
            }
            const capability = voice.capability()
            if (!capability.available) {
              return reply.code(503).send({ error: capability.reason })
            }
            if (voice.busy()) {
              return reply.code(409).send({ error: 'Oracle voice is already in use' })
            }
          },
        },
        (socket, request) => {
          if (!voice) {
            socket.close(1011, 'Oracle voice backend is unavailable')
            return
          }
          const streamId = request.query.streamId!
          const voiceLimits = voice.limits()
          let session: VoiceBackendSession | undefined
          let closing: Promise<void> | undefined
          let pendingCloseReason: string | undefined
          let pendingInputBytes = 0
          let inputClosed = false
          const openAbortController = new AbortController()
          const closeSession = (reason: string) => {
            pendingCloseReason ??= reason
            openAbortController.abort()
            if (!session) return Promise.resolve()
            closing ??= session.close(pendingCloseReason)
            return closing
          }
          socket.on('message', (data, isBinary) => {
            if (inputClosed) return
            if (!session) {
              inputClosed = true
              socket.close(1008, 'Oracle voice backend is not ready')
              return
            }
            const bytes = rawDataByteLength(data)
            const messageLimit = isBinary
              ? voiceLimits.maxFrameBytes
              : voiceLimits.maxQueueBytes
            if (bytes > messageLimit) {
              inputClosed = true
              socket.close(1009, 'Node voice frame is too large')
              return
            }
            if (bytes > voiceLimits.maxQueueBytes - pendingInputBytes) {
              inputClosed = true
              socket.close(1013, 'Node voice input queue is full')
              return
            }
            pendingInputBytes += bytes
            void receiveNodeVoiceMessage(
              session,
              streamId,
              data,
              isBinary,
              voiceLimits,
            ).catch((error: unknown) => {
              inputClosed = true
              closeVoiceSocket(socket, error)
            }).finally(() => {
              pendingInputBytes -= bytes
            })
          })
          socket.on('close', () => {
            void closeSession('Node voice socket closed')
          })
          socket.on('error', () => {
            void closeSession('Node voice socket failed')
          })
          void voice.open({
            streamId,
            send: (output) => sendNodeVoiceOutput(socket, output, voiceLimits),
            terminate: (failure) => socket.close(
              failure.retryable && failure.cause === 'transport' ? 1012 : failure.code,
              closeReason(failure.reason),
            ),
            signal: openAbortController.signal,
          }).then(async (opened) => {
            session = opened
            if (pendingCloseReason || socket.readyState !== socket.OPEN) {
              await closeSession(pendingCloseReason ?? 'Node voice socket closed')
              return
            }
            await sendNodeVoiceOutput(
              socket,
              {
                type: 'hello',
                protocol: ORACLE_VOICE_PROTOCOL,
                streamId,
                generation: 0,
                capabilities: nodeVoiceCapabilities(identity, voice),
              },
              voiceLimits,
            )
          }).catch(async (error: unknown) => {
            try {
              await closeSession('Node voice socket failed')
            } finally {
              closeVoiceSocket(socket, error)
            }
          })
        },
      )

      node.post<{ Body: Buffer }>(
        '/transcriptions',
        { bodyLimit: MAX_AUDIO_BYTES },
        async (request, reply) => {
          const encodedName = request.headers[AUDIO_FILENAME_HEADER]
          if (typeof encodedName !== 'string') {
            throw new TranscriptionError('An audio file name is required', 400)
          }
          const filename = Buffer.from(encodedName, 'base64url').toString('utf8')
          if (!filename) {
            throw new TranscriptionError('The audio file name is invalid', 400)
          }
          const audioType = request.headers[AUDIO_TYPE_HEADER]
          const body = request.body
          if (!Buffer.isBuffer(body) || body.length === 0) {
            throw new TranscriptionError('An audio file is required', 400)
          }
          const controller = new AbortController()
          const cancel = () => controller.abort()
          request.raw.once('aborted', cancel)
          reply.raw.once('close', cancel)
          try {
            return await transcription.transcribe(
              {
                filename,
                mimeType: typeof audioType === 'string' ? audioType : '',
                stream: Readable.from(body),
                truncated: () => false,
              },
              controller.signal,
            )
          } finally {
            request.raw.off('aborted', cancel)
            reply.raw.off('close', cancel)
          }
        },
      )

      node.get<{ Querystring: { includeArchived?: string } }>('/sessions', async (request) => {
        const query = sessionListingQuerySchema.parse(request.query)
        return {
          sessions: query.includeArchived === '1'
            ? service.listHistory().filter((session) => session.isOpen || session.archivedAt)
            : service.listSessions(),
        }
      })

      node.get('/history', async () => ({
        sessions: service.listHistory(),
      }))

      node.get('/closed-sessions', async () => ({
        sessions: service.listClosedSessions?.() ?? [],
      }))

      node.get<{ Querystring: { path?: string; scope?: string } }>(
        '/directories',
        async (request) => {
          const query = directoryQuerySchema.parse(request.query)
          return service.listDirectories(query.path, query.scope)
        },
      )

      node.post('/directories/validate', async (request) => {
        const input = directoryValidationSchema.parse(request.body)
        return { path: await service.validateSessionDirectory(input.path) }
      })

      node.put<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/knowledge-base',
        async (request) => {
          const input = sessionKnowledgeBaseSchema.parse(request.body)
          return service.ensureSessionKnowledgeBase(
            request.params.sessionId,
            input.path,
            input.create,
          )
        },
      )

      node.post('/knowledge/validate', async (request) => {
        const input = knowledgeValidationSchema.parse(request.body)
        return {
          path: await service.validateKnowledgeRoot(
            input.path,
            input.confinement,
          ),
        }
      })

      node.get<{ Querystring: { root?: string; path?: string } }>(
        '/knowledge/entries',
        async (request) => {
          const query = knowledgeQuerySchema.parse(request.query)
          const listing = await service.listKnowledge(
            query.root,
            query.path,
            query.confinement,
          )
          return {
            ...listing,
            ...(query.confinement ? { confinementApplied: true } : {}),
          }
        },
      )

      node.get<{ Querystring: { root?: string; path?: string } }>(
        '/knowledge/file',
        async (request) => {
          const query = knowledgeFileQuerySchema.parse(request.query)
          const file = await service.readKnowledgeFile(
            query.root,
            query.path,
            query.confinement,
          )
          return {
            ...file,
            ...(query.confinement ? { confinementApplied: true } : {}),
          }
        },
      )

      node.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/commands',
        async (request) => ({
          commands: await service.listCommands(request.params.sessionId),
        }),
      )

      node.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/skills',
        async (request, reply) => {
          reply.header('cache-control', 'no-store')
          return readResource(request, reply, (signal) => readSessionSkills(service, request.params.sessionId, signal))
        },
      )

      node.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/mcp',
        async (request, reply) => {
          reply.header('cache-control', 'no-store')
          return readResource(request, reply, (signal) => readSessionMcpServers(service, request.params.sessionId, signal))
        },
      )

      node.get<{
        Params: { sessionId: string }
        Querystring: { path?: string }
      }>('/sessions/:sessionId/workspace', async (request) => {
        const query = directoryQuerySchema.parse(request.query)
        return service.listWorkspace(request.params.sessionId, query.path)
      })

      node.get<{
        Params: { sessionId: string }
        Querystring: { path: string }
      }>('/sessions/:sessionId/workspace/file', async (request) => {
        const query = workspaceFileQuerySchema.parse(request.query)
        return service.readWorkspaceFile(request.params.sessionId, query.path)
      })

      node.get<{
        Params: { sessionId: string }
        Querystring: { query: string }
      }>('/sessions/:sessionId/workspace/search', async (request) => {
        const query = workspaceSearchQuerySchema.parse(request.query)
        return service.searchWorkspace(
          request.params.sessionId,
          query.query,
          query.path,
        )
      })

      node.get<{ Params: { sessionId: string }; Querystring: { passive?: string } }>(
        '/sessions/:sessionId',
        async (request) => {
          if (request.query.passive !== '1') {
            return { session: await service.openSession(request.params.sessionId) }
          }
          // Read as recorded, never opened: the hub's Oracle reads sessions
          // this way so that asking about one cannot change it.
          const session = service.getSession(request.params.sessionId)
          if (!session) {
            throw Object.assign(new Error('Session not found'), { statusCode: 404 })
          }
          return { session }
        },
      )

      node.post('/sessions', async (request, reply) => {
        const input = createSessionSchema.parse(request.body)
        if (input.launchId !== undefined && !service.providers().some((provider) =>
          provider.id === input.provider && provider.supportsLaunchIdentity)) throw updateComputerForLaunchIdentity()
        return reply
          .code(201)
          .send({
            session: await service.createSession(
              input.cwd,
              input.terminalBacked,
              input.allowAllPermissions,
              input.provider,
              input.model,
              input.reasoningEffort,
              input.contextTier,
              input.mode,
              ...(input.launchId !== undefined ? [input.launchId] : []),
            ),
          })
      })

      node.get<{ Params: { launchId: string } }>('/launches/:launchId', async (request, reply) => {
        reply.header('cache-control', 'no-store')
        if (!service.reconcileLaunch || !service.providers().some((provider) => provider.supportsLaunchIdentity)) {
          throw updateComputerForLaunchIdentity()
        }
        return { launch: await service.reconcileLaunch(launchIdentitySchema.parse(request.params.launchId)) ?? null }
      })

      node.post<{ Params: { sessionId: string } }>('/sessions/:sessionId/cancel-with-ack', async (request) => {
        const { timeoutMs } = cancellationAckSchema.parse(request.body ?? {})
        const owner = service.getSession(request.params.sessionId)
        if (!owner) throw Object.assign(new Error('Session not found'), { statusCode: 404 })
        if (!service.cancelWithAck || !service.providers().some((provider) =>
          provider.id === (owner.provider || 'copilot') && provider.supportsLaunchIdentity)) throw updateComputerForLaunchIdentity()
        return service.cancelWithAck(request.params.sessionId, timeoutMs)
      })

      node.get<{ Params: { provider: 'copilot' | 'claude' } }>(
        '/providers/:provider/runtime',
        async (request) =>
          service.providerRuntimeOptions(
            z.enum(['copilot', 'claude']).parse(request.params.provider),
          ),
      )

      node.post<{
        Params: { sessionId: string }
        Body: Buffer
      }>(
        '/sessions/:sessionId/files',
        { bodyLimit: MAX_SESSION_FILE_BYTES },
        async (request, reply) => {
          const encodedName = request.headers['x-agentic-filename']
          if (typeof encodedName !== 'string') {
            throw new FileUploadError('A file name is required', 400)
          }
          let filename: string
          try {
            filename = Buffer.from(encodedName, 'base64url').toString('utf8')
          } catch {
            throw new FileUploadError('The file name is invalid', 400)
          }
          if (!supportsSessionFile(filename)) {
            throw new FileUploadError('This file type is not supported', 415)
          }
          if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
            throw new FileUploadError('A file is required', 400)
          }
          return reply.code(201).send({
            file: await service.uploadFile(
              request.params.sessionId,
              filename,
              request.body,
            ),
          })
        },
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/open',
        async (request) => ({
          session: await service.activateSession(request.params.sessionId),
        }),
      )

      node.patch<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId',
        async (request) => {
          const input = renameSessionSchema.parse(request.body)
          return {
            session: await service.renameSession(
              request.params.sessionId,
              input.title,
            ),
          }
        },
      )

      node.patch<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/retention',
        async (request) => {
          if (!service.configureRetention) {
            throw Object.assign(new Error('Session retention is not supported by this computer'), { statusCode: 409 })
          }
          return { session: await service.configureRetention(
            request.params.sessionId, sessionRetentionPatchSchema.parse(request.body),
          ) }
        },
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/clear',
        async (request) => ({
          session: await service.clearConversation(request.params.sessionId),
        }),
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/recover',
        async (request) => {
          const input = recoverConversationSchema.parse(request.body)
          return {
            session: await service.recoverConversation(
              request.params.sessionId,
              input.reason,
            ),
          }
        },
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/restart',
        async (request) => ({
          session: await service.restartSession(request.params.sessionId),
        }),
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/suspend',
        async (request) => ({
          session: await service.suspendSession(request.params.sessionId),
        }),
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/resume',
        async (request) => ({
          session: await service.resumeSession(request.params.sessionId),
        }),
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/tmux',
        async (request) => ({
          session: await service.moveToTerminal(request.params.sessionId),
        }),
      )

      node.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/runtime',
        async (request) => service.runtimeOptions(request.params.sessionId),
      )

      node.patch<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/runtime',
        async (request) => {
          const input = configureRuntimeSchema.parse(request.body)
          return {
            session: await service.configureRuntime(
              request.params.sessionId,
              input,
            ),
          }
        },
      )

      node.delete<{ Params: { sessionId: string; promptId: string } }>(
        '/sessions/:sessionId/queue/:promptId',
        async (request) => {
          const input = discardQueuedDispatchSchema.parse(request.body ?? {})
          return service.removeQueuedPrompt(
            request.params.sessionId,
            request.params.promptId,
            input.acknowledgesDispatch,
          )
        },
      )

      node.post<{ Params: { sessionId: string; promptId: string } }>(
        '/sessions/:sessionId/queue/:promptId/dispatch',
        async (request) => {
          const input = updateQueuedPromptSchema.parse(request.body)
          const provider = service.getSession(request.params.sessionId)?.provider || 'copilot'
          if (!service.dispatchQueuedPrompt || !service.providers().some((capability) =>
            capability.id === provider && capability.supportsQueuedPromptDispatch === true)) {
            throw Object.assign(new Error('Update this runtime to dispatch queued edits.'), { statusCode: 409 })
          }
          return service.dispatchQueuedPrompt(request.params.sessionId, request.params.promptId, input.content)
        },
      )

      node.patch<{ Params: { sessionId: string; promptId: string } }>(
        '/sessions/:sessionId/queue/:promptId',
        async (request) => {
          const input = updateQueuedPromptSchema.parse(request.body)
          return service.updateQueuedPrompt(
            request.params.sessionId,
            request.params.promptId,
            input.content,
          )
        },
      )

      node.put<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/queue',
        async (request) => {
          const input = reorderQueueSchema.parse(request.body)
          return service.reorderQueuedPrompts(
            request.params.sessionId,
            input.order,
          )
        },
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/messages',
        async (request, reply) => {
          const input = sendMessageSchema.parse(request.body)
          if (input.deliveryId !== undefined) {
            const providerId = service.getSession(request.params.sessionId)?.provider || 'copilot'
            if (!service.providers().some((provider) => provider.id === providerId &&
                provider.supportsLaunchIdentity)) throw updateComputerForLaunchIdentity()
          }
          const session = await service.sendMessage(
            request.params.sessionId,
            input.content,
            input.enqueue,
            input.acknowledgesFailure,
            input.replaceTerminalDraft,
            ...(input.deliveryId !== undefined ? [input.deliveryId] : []),
          )
          return reply.code(202).send({
            session,
            ...(input.deliveryId !== undefined ? {
              receipt: session.promptReceipts?.find((receipt) => receipt.deliveryId === input.deliveryId),
            } : {}),
          })
        },
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/commands',
        async (request) => {
          const input = executeCommandSchema.parse(request.body)
          return {
            session: await service.executeCommand(
              request.params.sessionId,
              input.command,
              input.enqueue,
              input.acknowledgesFailure,
              input.replaceTerminalDraft,
            ),
          }
        },
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/cancel',
        async (request, reply) => {
          await service.cancel(request.params.sessionId)
          return reply.code(202).send({ ok: true })
        },
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/ask',
        async (request) => {
          const input = sideQuestionSchema.parse(request.body)
          if (!service.askSession) {
            throw Object.assign(
              new Error('Side questions are not available on this computer.'),
              { statusCode: 501 },
            )
          }
          return {
            answer: await service.askSession(
              request.params.sessionId,
              input.question,
              input.earlier,
            ),
          }
        },
      )

      node.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/tasks',
        async (request) =>
          service.listBackgroundTasks(request.params.sessionId),
      )

      node.get<{ Params: { sessionId: string; toolCallId: string } }>(
        '/sessions/:sessionId/activities/:toolCallId',
        async (request) => {
          const toolCallId = toolCallIdSchema.parse(request.params.toolCallId)
          if (!service.readActivityDetail) throw activityDetailsUnavailable()
          return service.readActivityDetail(request.params.sessionId, toolCallId)
        },
      )

      node.post<{
        Params: { sessionId: string; taskId: string }
      }>(
        '/sessions/:sessionId/tasks/:taskId/cancel',
        async (request) =>
          service.cancelBackgroundTask(
            request.params.sessionId,
            request.params.taskId,
          ),
      )

      node.delete<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId',
        async (request) => {
          await service.deleteSession(request.params.sessionId)
          return { ok: true }
        },
      )

      // Close keeps the session to reopen; DELETE above stays permanent.
      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/close',
        async (request) => {
          if (!service.closeSession) {
            throw Object.assign(new Error('This computer cannot keep closed sessions to reopen.'), { statusCode: 409 })
          }
          return { session: await service.closeSession(request.params.sessionId) }
        },
      )

      node.post<{ Params: { sessionId: string; requestId: string } }>(
        '/sessions/:sessionId/permissions/:requestId',
        async (request) => {
          const input = permissionReplySchema.parse(request.body)
          return {
            session: await service.replyPermission(
              request.params.sessionId,
              request.params.requestId,
              input.optionId,
            ),
          }
        },
      )

      node.post<{ Params: { sessionId: string; requestId: string } }>(
        '/sessions/:sessionId/user-input/:requestId',
        async (request) => {
          const input = userInputReplySchema.parse(request.body)
          return {
            session: await service.replyUserInput(
              request.params.sessionId,
              request.params.requestId,
              input,
            ),
          }
        },
      )

      const sockets = new Set<{
        send: (payload: string) => void
        readyState: number
      }>()
      node.get('/events', { websocket: true }, (socket) => {
        sockets.add(socket)
        socket.on('close', () => sockets.delete(socket))
      })
      const broadcast = (event: ServerEvent) => {
        const payload = JSON.stringify(event)
        for (const socket of sockets) {
          if (socket.readyState === 1) {
            socket.send(payload)
          }
        }
      }
      service.on('event', broadcast)
      node.addHook('onClose', async () => {
        service.off('event', broadcast)
      })
    },
    { prefix: '/node-api' },
  )
}
