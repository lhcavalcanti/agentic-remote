import { timingSafeEqual } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { ServerEvent } from '../shared/contracts.js'
import {
  FileUploadError,
  MAX_SESSION_FILE_BYTES,
  supportsSessionFile,
} from './file-upload-routes.js'
import { NodeIdentityStore } from './node-identity.js'
import type { SessionService } from './session-service.js'

const createSessionSchema = z.object({
  cwd: z.string().trim().min(1).max(4096),
  provider: z.enum(['copilot', 'claude']).default('copilot'),
  terminalBacked: z.boolean().default(true),
  allowAllPermissions: z.boolean().default(true),
  model: z.string().trim().min(1).max(200).optional(),
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

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(200_000),
  enqueue: z.boolean().optional(),
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
  command: z.string().trim().startsWith('/').max(10_000),
  enqueue: z.boolean().optional(),
})

const configureRuntimeSchema = z.object({
  model: z.string().trim().min(1).max(200),
  reasoningEffort: z.string().trim().min(1).max(50),
  contextTier: z.enum(['default', 'long_context']),
  mode: z.enum(['interactive', 'plan', 'autopilot']).optional(),
})

const directoryQuerySchema = z.object({
  scope: z.enum(['home', 'all']).optional(),
  path: z.string().trim().max(4096).optional(),
})
const directoryValidationSchema = z.object({
  path: z.string().trim().min(1).max(4096),
})
const knowledgeQuerySchema = z.object({
  root: z.string().trim().min(1).max(4096),
  path: z.string().trim().max(4096).optional(),
})

const knowledgeFileQuerySchema = z.object({
  root: z.string().trim().min(1).max(4096),
  path: z.string().trim().min(1).max(4096),
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

export async function registerNodeRoutes(
  app: FastifyInstance,
  service: SessionService,
  identity: NodeIdentityStore,
): Promise<void> {
  await app.register(
    async (node) => {
      node.addContentTypeParser(
        'application/octet-stream',
        {
          parseAs: 'buffer',
          bodyLimit: MAX_SESSION_FILE_BYTES,
        },
        (_request, body, done) => done(null, body),
      )
      node.addHook('onRequest', async (request, reply) => {
        if (!tokenMatches(request.headers.authorization, identity.token)) {
          return reply.code(401).send({ error: 'Invalid node token' })
        }
      })

      node.get('/info', async () => ({
        ...identity.info,
        providers: service.providers(),
      }))

      node.get('/sessions', async () => ({
        sessions: service.listSessions(),
      }))

      node.get('/history', async () => ({
        sessions: service.listHistory(),
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

      node.get<{ Querystring: { root?: string; path?: string } }>(
        '/knowledge/entries',
        async (request) => {
          const query = knowledgeQuerySchema.parse(request.query)
          return service.listKnowledge(query.root, query.path)
        },
      )

      node.get<{ Querystring: { root?: string; path?: string } }>(
        '/knowledge/file',
        async (request) => {
          const query = knowledgeFileQuerySchema.parse(request.query)
          return service.readKnowledgeFile(query.root, query.path)
        },
      )

      node.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/commands',
        async (request) => ({
          commands: await service.listCommands(request.params.sessionId),
        }),
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

      node.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId',
        async (request) => ({
          session: await service.openSession(request.params.sessionId),
        }),
      )

      node.post('/sessions', async (request, reply) => {
        const input = createSessionSchema.parse(request.body)
        return reply
          .code(201)
          .send({
            session: await service.createSession(
              input.cwd,
              input.terminalBacked,
              input.allowAllPermissions,
              input.provider,
              input.model,
            ),
          })
      })

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

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/clear',
        async (request) => ({
          session: await service.clearConversation(request.params.sessionId),
        }),
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/restart',
        async (request) => ({
          session: await service.restartSession(request.params.sessionId),
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
        async (request) =>
          service.removeQueuedPrompt(
            request.params.sessionId,
            request.params.promptId,
          ),
      )

      node.post<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/messages',
        async (request, reply) => {
          const input = sendMessageSchema.parse(request.body)
          return reply.code(202).send({
            session: await service.sendMessage(
              request.params.sessionId,
              input.content,
              input.enqueue,
            ),
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

      node.get<{ Params: { sessionId: string } }>(
        '/sessions/:sessionId/tasks',
        async (request) =>
          service.listBackgroundTasks(request.params.sessionId),
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
