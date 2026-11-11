import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { MANAGER_MESSAGE_MAX_LENGTH } from '../shared/manager.js'
import { MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES } from '../shared/manager-structured-memory.js'
import type {
  ManagerClientDefaults,
  ManagerEvent,
  ManagerMessage,
  ManagerSubmissionOptions,
  ManagerSettingsSnapshot,
  ManagerSnapshot,
  UpdateManagerSettingsInput,
} from '../shared/manager.js'
import type { ManagerStructuredMemoryRuntime } from './manager-structured-memory-runtime.js'
import type { ManagerStore } from './manager-store.js'
import { MAX_MANAGER_FILE_BYTES, managerFileType } from '../shared/manager-files.js'

/** What the routes need from the manager agent. */
export interface ManagerRouteAgent {
  snapshot(): ManagerSnapshot
  send(content: string, defaults?: ManagerClientDefaults, options?: ManagerSubmissionOptions): Promise<ManagerMessage>
  retry(messageId: string): Promise<ManagerMessage>
  removeQueued(messageId: string): Promise<ManagerMessage>
  editQueued(messageId: string, content: string): Promise<ManagerMessage>
  updateSettings(input: UpdateManagerSettingsInput): Promise<ManagerSettingsSnapshot>
  resolveConfirmation(messageId: string, accept: boolean): Promise<ManagerMessage>
  cancel(): Promise<void>
  reset(): Promise<void>
}

export interface ManagerEventSource {
  on(event: 'event', listener: (event: ManagerEvent) => void): unknown
  off(event: 'event', listener: (event: ManagerEvent) => void): unknown
}

const effort = z.enum(['low', 'medium', 'high', 'xhigh', 'max'])

const defaultsSchema = z.object({
  computerId: z.string().trim().min(1).max(200).optional(),
  mode: z.enum(['interactive', 'plan', 'autopilot']).optional(),
  provider: z.enum(['copilot', 'claude']).optional(),
  model: z.string().trim().min(1).max(200).optional(),
  reasoningEffort: effort.optional(),
  folders: z.record(z.string().trim().min(1).max(200), z.string().trim().min(1).max(4096)).optional(),
}).strip()

const sendSchema = z.object({
  // The agent gives the precise limits; this only bounds the request.
  content: z.string().max(200_000),
  defaults: defaultsSchema.optional(),
  answerOnly: z.boolean().optional(),
  attachmentIds: z.array(z.string().uuid()).max(20).optional(),
})

const settingsSchema = z.object({
  model: z.string().trim().max(200).nullable().optional(),
  reasoningEffort: effort.nullable().optional(),
  // Null clears a folder; a blank one is a mistake, not a way to clear it.
  sessionFolders: z.record(z.string().trim().min(1).max(200), z.string().trim().min(1).max(4096).nullable()).optional(),
  sessionBackend: z.enum(['sdk', 'terminal']).optional(),
  sessionClosePolicy: z.enum(['ask', 'oracle-started']).optional(),
})

const messageParams = z.object({ messageId: z.string().trim().min(1).max(100) })

const confirmationSchema = z.object({ accept: z.boolean() })

const editSchema = z.object({ content: z.string().max(200_000) })
const structuredRecordParams = z.object({
  recordId: z.string().uuid(),
})
const structuredBody = z.record(z.string(), z.unknown())
const structuredImportSchema = z.object({
  requestId: z.string(),
  data: z.string(),
}).strict()

function managerInputError(error: z.ZodError): Error {
  if (
    error.issues.some(
      (issue) =>
        issue.code === 'too_big' &&
        issue.path.length === 1 &&
        issue.path[0] === 'content',
    )
  ) {
    return Object.assign(
      new Error(
        `Messages are limited to ${MANAGER_MESSAGE_MAX_LENGTH.toLocaleString('en-US')} characters.`,
      ),
      { statusCode: 413 },
    )
  }
  return error
}

export function unavailableSnapshot(reason: string): ManagerSnapshot {
  return {
    available: false,
    unavailableReason: reason,
    status: 'offline',
    messages: [],
    queued: 0,
    managedSessions: [],
  }
}

/** Hub routes for the manager agent, under the hub's Host and Origin policy. */
export async function registerManagerRoutes(
  app: FastifyInstance,
  agent: ManagerRouteAgent | undefined,
  unavailableReason = 'Oracle is not available on this hub.',
  structuredMemory?: ManagerStructuredMemoryRuntime,
  uploads?: Pick<ManagerStore, 'uploadFile' | 'removeUpload' | 'cleanupUploads'>,
): Promise<void> {
  const requireAgent = () => {
    if (!agent) throw Object.assign(new Error(unavailableReason), { statusCode: 503 })
    return agent
  }
  const requireUploads = () => {
    requireAgent()
    if (!uploads) throw Object.assign(new Error('Oracle uploads are unavailable.'), { statusCode: 503 })
    return uploads
  }
  if (uploads) {
    const timer = setInterval(() => {
      void uploads.cleanupUploads().catch((error: unknown) => app.log.error({ err: error }, 'Oracle upload cleanup failed'))
    }, 60 * 60 * 1000)
    timer.unref()
    app.addHook('onClose', async () => { clearInterval(timer) })
  }
  let activeUploads = 0
  app.post('/api/manager/files', async (request, reply) => {
    const store = requireUploads()
    if (activeUploads >= 2) throw Object.assign(new Error('Too many file uploads are in progress'), { statusCode: 429 })
    activeUploads += 1
    try {
      const upload = await request.file({ limits: { fields: 0, files: 1, parts: 1, fileSize: MAX_MANAGER_FILE_BYTES } })
      if (!upload) throw Object.assign(new Error('A file is required'), { statusCode: 400 })
      const type = managerFileType(upload.filename)
      if (!type) throw Object.assign(new Error('This file type is not supported'), { statusCode: 415 })
      let size = 0
      const chunks: Buffer[] = []
      for await (const chunk of upload.file) {
        size += chunk.length
        if (size > type.limit) throw Object.assign(new Error(`The file exceeds the ${type.kind === 'blob' ? '1' : '25'} MiB limit`), { statusCode: 413 })
        chunks.push(chunk)
      }
      if (upload.file.truncated) throw Object.assign(new Error('The file exceeds the 25 MiB limit'), { statusCode: 413 })
      return reply.code(201).send({ file: await store.uploadFile(upload.filename, Buffer.concat(chunks, size)) })
    } finally {
      activeUploads -= 1
    }
  })
  app.delete('/api/manager/files/:fileId', async (request, reply) => {
    const { fileId } = z.object({ fileId: z.string().uuid() }).parse(request.params)
    await requireUploads().removeUpload(fileId)
    return reply.code(204).send()
  })
  const structuredStatus = () =>
    structuredMemory?.status() ?? {
      mode: 'off' as const,
      availability: 'disabled' as const,
    }
  const requireStructuredStore = () => {
    const status = structuredStatus()
    if (!structuredMemory?.store || status.availability !== 'ready') {
      const reason = status.mode === 'off'
        ? 'Oracle structured memory is turned off on this hub.'
        : status.lastError ?? 'Oracle structured memory is unavailable.'
      throw Object.assign(new Error(reason), { statusCode: 503 })
    }
    return structuredMemory.store
  }

  app.get('/api/manager', async (_request, reply) => {
    reply.header('cache-control', 'no-store')
    return agent ? agent.snapshot() : unavailableSnapshot(unavailableReason)
  })

  app.get('/api/manager/structured-memory/status', async (_request, reply) => {
    reply.header('cache-control', 'no-store')
    return structuredStatus()
  })

  app.post('/api/manager/structured-memory/search', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    return requireStructuredStore().search(request.body ?? {})
  })

  app.post('/api/manager/structured-memory/records', async (request, reply) => {
    const result = await requireStructuredStore().remember(request.body ?? {})
    return reply.code(result.idempotent ? 200 : 201).send(result)
  })

  app.post(
    '/api/manager/structured-memory/records/:recordId/correct',
    async (request) => {
      const { recordId } = structuredRecordParams.parse(request.params)
      const body = structuredBody.parse(request.body ?? {})
      return requireStructuredStore().correct({ ...body, recordId })
    },
  )

  app.post(
    '/api/manager/structured-memory/records/:recordId/forget',
    async (request) => {
      const { recordId } = structuredRecordParams.parse(request.params)
      const body = structuredBody.parse(request.body ?? {})
      return requireStructuredStore().forget({ ...body, recordId })
    },
  )

  app.get('/api/manager/structured-memory/export', async (_request, reply) => {
    reply.header('cache-control', 'no-store')
    reply.header(
      'content-disposition',
      'attachment; filename="oracle-structured-memory-v1.json"',
    )
    return reply.type('application/json').send(
      requireStructuredStore().exportState(),
    )
  })

  app.post('/api/manager/structured-memory/import', {
    // The export travels as a JSON string, so escaping can at most double it.
    bodyLimit: MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES * 2 + 64 * 1024,
  }, async (request, reply) => {
    const { requestId, data } = structuredImportSchema.parse(
      request.body ?? {},
    )
    const result = await requireStructuredStore().importState(requestId, data)
    return reply.code(result.idempotent ? 200 : 201).send(result)
  })

  app.post('/api/manager/messages', async (request, reply) => {
    const parsed = sendSchema.safeParse(request.body ?? {})
    if (!parsed.success) throw managerInputError(parsed.error)
    const input = parsed.data
    const message = await requireAgent().send(
      input.content,
      input.defaults,
      {
        ...(input.answerOnly ? { answerOnly: true } : {}),
        ...(input.attachmentIds?.length ? { attachmentIds: input.attachmentIds } : {}),
      },
    )
    return reply.code(202).send({ message })
  })

  // Takes a message out of the queue before Oracle starts on it.
  app.post('/api/manager/messages/:messageId/remove', async (request) => {
    const { messageId } = messageParams.parse(request.params)
    return { message: await requireAgent().removeQueued(messageId) }
  })

  app.put('/api/manager/settings', async (request) => {
    const input = settingsSchema.parse(request.body ?? {})
    return { settings: await requireAgent().updateSettings(input) }
  })

  // Rewrites a waiting message in place, keeping its place in the queue.
  app.put('/api/manager/messages/:messageId', async (request) => {
    const { messageId } = messageParams.parse(request.params)
    const parsed = editSchema.safeParse(request.body ?? {})
    if (!parsed.success) throw managerInputError(parsed.error)
    const { content } = parsed.data
    return { message: await requireAgent().editQueued(messageId, content) }
  })

  app.post('/api/manager/messages/:messageId/retry', async (request) => {
    const { messageId } = messageParams.parse(request.params)
    return { message: await requireAgent().retry(messageId) }
  })

  // Your answer to something only you can decide, such as closing a session.
  app.post('/api/manager/messages/:messageId/confirmation', async (request) => {
    const { messageId } = messageParams.parse(request.params)
    const { accept } = confirmationSchema.parse(request.body ?? {})
    return { message: await requireAgent().resolveConfirmation(messageId, accept) }
  })

  app.post('/api/manager/cancel', async (_request, reply) => {
    await requireAgent().cancel()
    return reply.code(204).send()
  })

  app.post('/api/manager/reset', async () => {
    const managerAgent = requireAgent()
    await managerAgent.reset()
    return managerAgent.snapshot()
  })
}
