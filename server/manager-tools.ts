import { createHash } from 'node:crypto'
import { z } from 'zod'
import type {
  AgentMode,
  AgentProvider,
  ComputerSummary,
  CreateSessionInput,
  ManagedSession,
  PendingPermission,
  RuntimeReasoningEffort,
  UserInputField,
  UserInputReplyInput,
} from '../shared/contracts.js'
import type { ManagerClientDefaults, ManagerSessionRef } from '../shared/manager.js'
import type { ManagerStructuredMemoryScope } from '../shared/manager-structured-memory.js'
import { rosterLine } from './manager-context.js'
import { ManagerMemoryError, type ManagerMemory } from './manager-memory.js'
import {
  formatStructuredMemoryContext,
} from './manager-structured-memory-search.js'
import type { ManagerStructuredMemoryStore } from './manager-structured-memory-store.js'
import { registryKey, type ManagerRegistry } from './manager-store.js'

export interface ManagerSkillSummary {
  name: string
  description?: string
  source?: string
}

/** What the manager's tools act on. Backed by the hub's ComputerManager. */
export interface ManagerToolHost {
  computers(): ComputerSummary[]
  findComputer(nameOrId: string): ComputerSummary | undefined
  listSessions(): Promise<ManagedSession[]>
  listHistory(): Promise<ManagedSession[]>
  /** A session as recorded, never opened or resumed, so reading cannot change it. */
  readSession(computerId: string, sessionId: string): Promise<ManagedSession>
  askSession(computerId: string, sessionId: string, question: string): Promise<string>
  createSession(computerId: string, input: CreateSessionInput): Promise<ManagedSession>
  renameSession(computerId: string, sessionId: string, title: string): Promise<ManagedSession>
  sendMessage(computerId: string, sessionId: string, content: string): Promise<ManagedSession>
  /** Answers a permission request, such as folder trust, with one of its options. */
  replyPermission(computerId: string, sessionId: string, requestId: string, optionId: string): Promise<ManagedSession>
  /** Answers a question or form the session is waiting on. */
  replyUserInput(computerId: string, sessionId: string, requestId: string, input: UserInputReplyInput): Promise<ManagedSession>
  /** Opens a closed session again, so it can be steered. */
  reopenSession(computerId: string, sessionId: string): Promise<ManagedSession>
  /** Resumes a suspended session, so it can be steered. */
  resumeSession(computerId: string, sessionId: string): Promise<ManagedSession>
  cancel(computerId: string, sessionId: string): Promise<void>
  /** Asks you, in the app, to confirm closing a session. Nothing is deleted until you do. */
  requestCloseConfirmation(session: ManagedSession, reason?: string): Promise<void>
  discoverSkills(projectPaths: string[]): Promise<ManagerSkillSummary[]>
  markManaged(session: ManagedSession, task: string): Promise<void>
  registry(): ManagerRegistry
  /** The message being answered was asked in Ask mode, so no session may be acted on. */
  answerOnly(): boolean
  /** Where Oracle starts new sessions, by computer ID. */
  sessionFolders(): Record<string, string>
  /** Validates and keeps the folder, or returns the computer to its default; gives back what was kept. */
  setSessionFolder(computerId: string, folder?: string): Promise<string | undefined>
  memory: ManagerMemory
  structuredMemory?: ManagerStructuredMemoryStore
  structuredMemoryScopes?(): ManagerStructuredMemoryScope[]
  authorizeStructuredMemory?(
    operation: 'remember' | 'correct' | 'forget',
  ): { allowed: boolean; sourceManagerMessageId?: string }
  defaults(): ManagerClientDefaults
  now(): Date
}

/** Something a tool did that the user should see in the manager's transcript. */
export interface ManagerToolActivity {
  tool: string
  content: string
  sessionRefs?: ManagerSessionRef[]
}

export interface ManagerToolInvocation {
  sessionId: string
  toolCallId: string
  toolName: string
  arguments: unknown
}

export type ManagerToolResult =
  | string
  | { textResultForLlm: string; resultType: 'failure'; error: string }

/** The subset of the SDK's tool definition the manager uses. */
export interface ManagerTool {
  name: string
  description: string
  parameters: Record<string, unknown>
  handler: (args: unknown, invocation: ManagerToolInvocation) => Promise<ManagerToolResult>
  skipPermission: true
  defer: 'never'
}

/** A tool failure the model reads and can act on. */
class ToolFailure extends Error {}

const MESSAGE_LIMIT = 2000
const sessionIdField = z.string().trim().min(1).max(200)
  .describe('The session id from the roster; a unique prefix of at least 6 characters also works.')
const computerField = z.string().trim().min(1).max(200)
  .describe('Computer id or name. Only needed when the same session id exists on two computers.')

function failure(message: string): ManagerToolResult {
  return { textResultForLlm: `Error: ${message}`, resultType: 'failure', error: message }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function link(session: Pick<ManagedSession, 'computerId' | 'id' | 'title'>): string {
  return `[${session.title.replaceAll(/[[\]]/g, '')}](?computer=${encodeURIComponent(session.computerId)}&session=${encodeURIComponent(session.id)})`
}

function ref(session: Pick<ManagedSession, 'computerId' | 'id' | 'title'>): ManagerSessionRef {
  return { computerId: session.computerId, sessionId: session.id, title: session.title }
}

/** A title the session list accepts: one line, no control characters or double quotes. */
export function sessionTitle(title: string): string {
  const clean = [...title]
    .map((character) => {
      const code = character.charCodeAt(0)
      if (character === '"') return "'"
      return code < 32 || code === 127 ? ' ' : character
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
  return (clean || 'Manager task').slice(0, 100)
}

function truncate(text: string, limit: number): string {
  return text.length > limit ? `${text.slice(0, limit)}… (truncated)` : text
}

const FOLDER_TRUST_PREFIX = 'Trust folder for this session:'
const APPROVE_WORDS = new Set(['allow', 'approve', 'accept', 'yes', 'trust', 'ok', 'continue'])
const DECLINE_WORDS = new Set(['deny', 'reject', 'decline', 'no', 'stop', 'cancel'])

/** The option a response names: its id or name, or approve or deny in plain words. */
function permissionOption(permission: PendingPermission, response: string) {
  const wanted = response.trim().toLowerCase()
  const named = permission.options.find((option) =>
    option.optionId.toLowerCase() === wanted || option.name.toLowerCase() === wanted)
  if (named) return named
  if (APPROVE_WORDS.has(wanted)) return permission.options.find((option) => option.kind.startsWith('allow'))
  if (DECLINE_WORDS.has(wanted)) return permission.options.find((option) => option.kind.startsWith('reject'))
  return undefined
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * The folder a genuine Copilot folder-trust prompt names, joined back where
 * the terminal wrapped it. Anything else that merely starts with the same
 * words, such as a command's permission, is not one.
 */
function trustedFolderOf(permission: PendingPermission): string | undefined {
  if (permission.stale || permission.kind !== 'terminal' || permission.choiceCount !== 3) return undefined
  if (!permission.title.startsWith(FOLDER_TRUST_PREFIX)) return undefined
  const [allow, stop, ...rest] = permission.options
  if (rest.length || allow?.optionId !== 'terminal:allow' || allow.name !== 'Trust for this session'
    || stop?.optionId !== 'terminal:stop') return undefined
  return permission.title.slice(FOLDER_TRUST_PREFIX.length).split('\n').map((part) => part.trim()).join('')
}

function sameFolder(left: string, right: string): boolean {
  return left.replace(/\/+$/, '') === right.replace(/\/+$/, '')
}

function describeField(field: UserInputField): string {
  const parts: string[] = [field.type]
  if (field.required) parts.push('required')
  if (field.options?.length) parts.push(`one of ${field.options.map((option) => option.value).join(', ')}`)
  if (field.minimum !== undefined || field.maximum !== undefined) parts.push(`${field.minimum ?? ''}–${field.maximum ?? ''}`)
  if (field.minLength !== undefined || field.maxLength !== undefined) parts.push(`${field.minLength ?? 0}–${field.maxLength ?? ''} characters`)
  if (field.minItems !== undefined || field.maxItems !== undefined) parts.push(`${field.minItems ?? 0}–${field.maxItems ?? ''} items`)
  if (field.format) parts.push(field.format)
  return `${field.name} (${parts.join(', ')})`
}

export function createManagerTools(
  host: ManagerToolHost,
  onActivity: (activity: ManagerToolActivity) => void,
  timing: { pollMs?: number; trustWaitMs?: number } = {},
): ManagerTool[] {
  const pollMs = timing.pollMs ?? 250
  const trustWaitMs = timing.trustWaitMs ?? 10_000

  /**
   * Answers the folder-trust prompt a session opens on, as the user would for
   * a folder they chose, and waits for it to go. Without `waitMs` it only
   * looks once. True when a prompt was answered.
   */
  async function trustFolder(session: ManagedSession, waitMs = 0): Promise<boolean> {
    const deadline = Date.now() + waitMs
    for (;;) {
      const detail = await host.readSession(session.computerId, session.id).catch(() => undefined)
      const permission = detail?.pendingPermission
      const folder = permission && trustedFolderOf(permission)
      // Only the folder the session was given; any other prompt is left to answer_session.
      if (permission && folder && sameFolder(folder, detail.cwd || session.cwd)) {
        await host.replyPermission(session.computerId, session.id, permission.requestId, 'terminal:allow')
        onActivity({
          tool: 'trust_folder',
          content: `Trusted ${folder} for "${session.title}"`,
          sessionRefs: [ref(session)],
        })
        // Copilot takes a moment to act on the answer; until then the prompt is still showing.
        const settled = Date.now() + trustWaitMs
        while (Date.now() < settled) {
          const next = await host.readSession(session.computerId, session.id).catch(() => undefined)
          if (next?.pendingPermission?.requestId !== permission.requestId) break
          await delay(pollMs)
        }
        return true
      }
      if (Date.now() >= deadline) return false
      await delay(pollMs)
    }
  }

  /** Delivers a message, first answering a folder-trust prompt, and once more if one appears. */
  async function deliver(session: ManagedSession, content: string): Promise<void> {
    await trustFolder(session)
    try {
      await host.sendMessage(session.computerId, session.id, content)
    } catch (error) {
      if (!(await trustFolder(session, trustWaitMs))) throw error
      await host.sendMessage(session.computerId, session.id, content)
    }
  }

  async function resolveSession(
    sessionId: string,
    computer?: string,
    options: { history?: boolean } = {},
  ): Promise<ManagedSession> {
    const computerId = computer ? requireComputer(computer, false).id : undefined
    const match = (sessions: ManagedSession[]) => {
      const candidates = sessions.filter((session) => !computerId || session.computerId === computerId)
      const exact = candidates.filter((session) => session.id === sessionId)
      if (exact.length === 1) return exact[0]
      if (exact.length > 1) {
        throw new ToolFailure(`Session ${sessionId} exists on more than one computer; pass computer.`)
      }
      if (sessionId.length < 6) return undefined
      const prefixed = candidates.filter((session) => session.id.startsWith(sessionId))
      if (prefixed.length > 1) {
        throw new ToolFailure(`${sessionId} matches ${prefixed.length} sessions; give more of the id.`)
      }
      return prefixed[0]
    }
    const open = match(await host.listSessions())
    if (open) return open
    if (options.history) {
      const closed = match(await host.listHistory())
      if (closed) return closed
    }
    throw new ToolFailure(
      `No open session matches ${sessionId}${computerId ? ` on ${computerId}` : ''}. Check the roster or call list_sessions.`,
    )
  }

  function requireComputer(nameOrId: string, online = true): ComputerSummary {
    const computer = host.findComputer(nameOrId)
    if (!computer) {
      const names = host.computers().map((candidate) => `${candidate.name} (${candidate.id})`).join(', ')
      throw new ToolFailure(`No computer named ${nameOrId}. Computers: ${names}.`)
    }
    if (online && !computer.online) {
      throw new ToolFailure(`${computer.name} is offline; choose another computer or wait for it to come back.`)
    }
    return computer
  }

  function define<T extends z.ZodType>(
    name: string,
    description: string,
    schema: T,
    run: (
      args: z.infer<T>,
      invocation: ManagerToolInvocation,
    ) => Promise<string>,
    options: { actsOnSessions?: boolean } = {},
  ): ManagerTool {
    const parameters = z.toJSONSchema(schema) as Record<string, unknown>
    delete parameters.$schema
    return {
      name,
      description,
      parameters,
      skipPermission: true,
      defer: 'never',
      handler: async (args, invocation) => {
        // Enforced here rather than only asked of the model, so an Ask mode
        // message can never start, steer, or stop a session.
        if (options.actsOnSessions && host.answerOnly()) {
          return failure('The user asked this in Ask mode, so no session may be started, messaged, renamed, stopped, or closed. Answer from what you can read and ask instead; switching Oracle to Delegate lets you do it.')
        }
        const parsed = schema.safeParse(args ?? {})
        if (!parsed.success) {
          return failure(parsed.error.issues
            .map((issue) => `${issue.path.join('.') || 'arguments'}: ${issue.message}`)
            .join('; '))
        }
        try {
          return await run(parsed.data, invocation)
        } catch (error) {
          return failure(errorMessage(error))
        }
      },
    }
  }

  const structuredScopeSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('global') }).strict(),
    z.object({ type: z.literal('user') }).strict(),
    z.object({
      type: z.literal('computer'),
      computerId: z.string().trim().min(1).max(200),
    }).strict(),
    z.object({
      type: z.literal('project'),
      computerId: z.string().trim().min(1).max(200),
      projectRoot: z.string().trim().min(1).max(4_096),
    }).strict(),
    z.object({
      type: z.literal('session'),
      computerId: z.string().trim().min(1).max(200),
      sessionId: z.string().trim().min(1).max(200),
    }).strict(),
  ])
  const structuredValueFields = {
    kind: z.enum(['preference', 'fact', 'procedure', 'decision', 'outcome']),
    canonicalKey: z.string().trim().min(1).max(200),
    content: z.string().trim().min(1).max(2_000),
    scope: structuredScopeSchema,
    confidence: z.number().min(0).max(1).optional(),
    validFrom: z.iso.datetime({ offset: true }).optional(),
    validUntil: z.iso.datetime({ offset: true }).optional(),
  }

  function structuredTools(): ManagerTool[] {
    const memory = host.structuredMemory
    const allowedScopes = host.structuredMemoryScopes
    const authorize = host.authorizeStructuredMemory
    if (!memory || !allowedScopes || !authorize) return []

    const requireAllowedScope = (scope: ManagerStructuredMemoryScope) => {
      if (!allowedScopes().some((candidate) =>
        JSON.stringify(candidate) === JSON.stringify(scope))) {
        throw new ToolFailure(
          'That structured-memory scope is outside the current Oracle context.',
        )
      }
    }
    const requireRecordInAllowedScope = (recordId: string) => {
      const record = memory.snapshot().records.find(({ id }) => id === recordId)
      if (
        !record ||
        !allowedScopes().some((candidate) =>
          JSON.stringify(candidate) === JSON.stringify(record.scope))
      ) {
        throw new ToolFailure(
          'That structured-memory record is outside the current Oracle context.',
        )
      }
    }
    const requireExplicitIntent = (
      operation: 'remember' | 'correct' | 'forget',
    ) => {
      const authorization = authorize(operation)
      if (!authorization.allowed) {
        throw new ToolFailure(
          `The user must explicitly ask Oracle to ${operation} structured memory in the current message.`,
        )
      }
      return authorization
    }
    const mutationRequestId = (
      operation: 'remember' | 'correct' | 'forget',
      sourceManagerMessageId: string | undefined,
      toolCallId: string,
      input: unknown,
    ) => {
      const identity = JSON.stringify({
        operation,
        source: sourceManagerMessageId ?? toolCallId,
        input,
      })
      return `manager:${createHash('sha256').update(identity).digest('hex')}`
    }

    return [
      define(
        'structured_memory_search',
        'Search active structured memory in the exact scopes available to the current Oracle context.',
        z.object({
          query: z.string(),
          limit: z.number().int().min(1).max(8).optional(),
        }).strict(),
        async ({ query, limit }) => {
          const formatted = formatStructuredMemoryContext(memory.search({
            query,
            scopes: allowedScopes(),
            limit,
            at: host.now().toISOString(),
          }))
          return formatted.text || 'No structured memory matched.'
        },
      ),
      define(
        'structured_memory_remember',
        'Remember one user-explicit structured fact, preference, procedure, decision, or outcome.',
        z.object(structuredValueFields).strict(),
        async (input, invocation) => {
          const authorization = requireExplicitIntent('remember')
          requireAllowedScope(input.scope)
          const result = await memory.remember({
            ...input,
            requestId: mutationRequestId(
              'remember',
              authorization.sourceManagerMessageId,
              invocation.toolCallId,
              input,
            ),
            ...(authorization.sourceManagerMessageId
              ? {
                  sourceManagerMessageId:
                    authorization.sourceManagerMessageId,
                }
              : {}),
          })
          const id = result.record?.id
          if (!id) throw new ToolFailure('Structured memory did not return a record.')
          onActivity({
            tool: 'structured_memory_remember',
            content: `Remembered structured memory record ${id}.`,
          })
          return `${result.idempotent ? 'Already remembered' : 'Remembered'} structured memory record ${id}.`
        },
      ),
      define(
        'structured_memory_correct',
        'Correct an active structured-memory record by superseding it with a user-explicit replacement.',
        z.object({
          recordId: z.string().uuid(),
          ...structuredValueFields,
        }).strict(),
        async (input, invocation) => {
          const authorization = requireExplicitIntent('correct')
          requireRecordInAllowedScope(input.recordId)
          requireAllowedScope(input.scope)
          const result = await memory.correct({
            ...input,
            requestId: mutationRequestId(
              'correct',
              authorization.sourceManagerMessageId,
              invocation.toolCallId,
              input,
            ),
            ...(authorization.sourceManagerMessageId
              ? {
                  sourceManagerMessageId:
                    authorization.sourceManagerMessageId,
                }
              : {}),
          })
          const id = result.record?.id
          if (!id) throw new ToolFailure('Structured memory did not return a correction.')
          onActivity({
            tool: 'structured_memory_correct',
            content: `Corrected structured memory record ${input.recordId} with ${id}.`,
          })
          return `${result.idempotent ? 'Already corrected' : 'Corrected'} structured memory record ${input.recordId} with ${id}.`
        },
      ),
      define(
        'structured_memory_forget',
        'Forget an active structured-memory record by creating a durable content-free tombstone.',
        z.object({ recordId: z.string().uuid() }).strict(),
        async ({ recordId }, invocation) => {
          const authorization = requireExplicitIntent('forget')
          requireRecordInAllowedScope(recordId)
          const result = await memory.forget({
            recordId,
            requestId: mutationRequestId(
              'forget',
              authorization.sourceManagerMessageId,
              invocation.toolCallId,
              { recordId },
            ),
            ...(authorization.sourceManagerMessageId
              ? {
                  sourceManagerMessageId:
                    authorization.sourceManagerMessageId,
                }
              : {}),
          })
          if (!result.tombstone) {
            throw new ToolFailure('Structured memory did not return a tombstone.')
          }
          onActivity({
            tool: 'structured_memory_forget',
            content: `Forgot structured memory record ${recordId}.`,
          })
          return `${result.idempotent ? 'Already forgot' : 'Forgot'} structured memory record ${recordId}.`
        },
      ),
    ]
  }

  /** What a session waits on, with what answer_session needs to answer it. */
  const pendingRequests = (session: ManagedSession) => {
    const lines: string[] = []
    const permission = session.pendingPermission
    if (permission && !permission.stale) {
      const options = (permission.options ?? []).map((option) => `"${option.name}"`)
      lines.push(`Waiting for the user to approve: ${permission.title} (requestId ${permission.requestId}).${
        options.length ? ` Options: ${options.join(', ')}.` : ''}`)
    }
    const question = session.pendingUserInput
    if (question && !question.stale) {
      const details = [
        ...(question.choices?.length ? [`Choices: ${question.choices.map((choice) => `"${choice}"`).join(', ')}`] : []),
        ...(question.multiSelect ? ['several may be chosen'] : []),
        ...(question.allowFreeform ? ['free text is allowed'] : []),
      ]
      lines.push(`Waiting for the user to answer: ${question.question} (requestId ${question.requestId}).${
        details.length ? ` ${details.join('; ')}.` : ''}`)
      if (question.form?.fields.length) {
        lines.push(`Form fields: ${question.form.fields.map(describeField).join('; ')}.`)
      }
    }
    return lines
  }

  const describeSession = (session: ManagedSession) => {
    const line = rosterLine(session, host.registry()[registryKey(session.computerId, session.id)], host.now())
    return session.isOpen === false ? `${line} · closed` : line
  }

  const memoryTool = async <T>(work: () => Promise<T>) => {
    try {
      return await work()
    } catch (error) {
      if (error instanceof ManagerMemoryError) throw new ToolFailure(error.message)
      throw error
    }
  }

  return [
    define(
      'list_computers',
      'List the computers sessions can run on, whether each is online, and which providers it offers.',
      z.object({}),
      async () => host.computers().map((computer) => {
        const providers = (computer.providers ?? [])
          .filter((provider) => provider.available)
          .map((provider) => provider.id)
          .join(', ') || 'none'
        return `- ${computer.name} (${computer.id}) · ${computer.online ? 'online' : 'offline'}${computer.isLocal ? ' · this hub' : ''} · providers: ${providers}`
      }).join('\n'),
    ),
    define(
      'list_sessions',
      'List open sessions, newest first, optionally filtered. Set includeClosed to add recently closed sessions from history.',
      z.object({
        query: z.string().trim().max(200).optional().describe('Case-insensitive text to match in the title, folder, or id.'),
        computer: computerField.optional(),
        includeClosed: z.boolean().optional(),
      }),
      async ({ query, computer, includeClosed }) => {
        const computerId = computer ? requireComputer(computer, false).id : undefined
        const needle = query?.toLowerCase()
        const keep = (session: ManagedSession) =>
          (!computerId || session.computerId === computerId) &&
          (!needle || `${session.title} ${session.cwd} ${session.id}`.toLowerCase().includes(needle))
        const open = (await host.listSessions()).filter(keep)
        const sections = [
          open.length ? `Open sessions (${open.length}):\n${open.map(describeSession).join('\n')}` : 'Open sessions: none match.',
        ]
        if (includeClosed) {
          const openKeys = new Set(open.map((session) => registryKey(session.computerId, session.id)))
          const closed = (await host.listHistory())
            .filter((session) => keep(session) && !openKeys.has(registryKey(session.computerId, session.id)))
            .slice(0, 50)
          sections.push(closed.length
            ? `Recently closed (${closed.length}):\n${closed.map((session) => describeSession({ ...session, isOpen: false })).join('\n')}`
            : 'Recently closed: none match.')
        }
        return sections.join('\n\n')
      },
    ),
    define(
      'get_session',
      "Read one session: its state, any question or permission waiting for the user, and its most recent messages. Works for closed sessions in history too.",
      z.object({
        sessionId: sessionIdField,
        computer: computerField.optional(),
        messages: z.number().int().min(1).max(30).optional().describe('How many recent messages to include (default 6).'),
      }),
      async ({ sessionId, computer, messages }) => {
        const found = await resolveSession(sessionId, computer, { history: true })
        const detail = await host.readSession(found.computerId, found.id)
        const lines = [describeSession({ ...detail, isOpen: found.isOpen }), ...pendingRequests(detail)]
        if (detail.queuedPrompts?.length) {
          lines.push(`Queued prompts: ${detail.queuedPrompts.map((prompt) => truncate(prompt.content, 200)).join(' | ')}`)
        }
        const recent = (detail.messages ?? []).slice(-(messages ?? 6))
        lines.push(recent.length
          ? 'Recent messages, oldest first:'
          : (found.provider ?? 'copilot') === 'copilot'
            ? 'No messages recorded here; ask_session can answer from its full history.'
            : 'No messages recorded here.')
        for (const message of recent) {
          lines.push(`[${message.role}] ${truncate(message.content.trim(), MESSAGE_LIMIT)}`)
        }
        return lines.join('\n')
      },
    ),
    define(
      'ask_session',
      "Ask a session a question about its own work (findings, results, blockers). It is answered from the session's finished turns without prompting or interrupting it; for a session in the middle of a turn, its current state is added. Copilot sessions only.",
      z.object({
        sessionId: sessionIdField,
        computer: computerField.optional(),
        question: z.string().trim().min(1).max(4000),
      }),
      async ({ sessionId, computer, question }) => {
        const found = await resolveSession(sessionId, computer)
        if ((found.provider ?? 'copilot') !== 'copilot') {
          throw new ToolFailure('Only Copilot sessions answer side questions; use get_session to read this one.')
        }
        const answer = await host.askSession(found.computerId, found.id, question)
        // A side question is answered from the session's finished turns, so
        // one it is still working on, or waiting on the user in, is told
        // apart from the answer rather than missed.
        if (found.status !== 'running' && found.status !== 'waiting') return answer
        return [
          answer,
          '',
          'Note: this session is in the middle of a turn, which the answer above cannot see because side questions read only finished turns. Its current state:',
          describeSession(found),
          ...pendingRequests(found),
        ].join('\n')
      },
    ),
    define(
      'create_session',
      'Start a new session to do a piece of work, name it, and give it its task. The folder defaults to your session folder for that computer, else the user\'s default folder; the computer, mode, and model default to the user\'s settings. The session appears in the user\'s app immediately.',
      z.object({
        title: z.string().trim().min(1).max(100).describe('Short descriptive name, at most 60 characters.'),
        prompt: z.string().trim().min(1).max(100_000).describe('The self-contained task: goal, context, constraints, acceptance criteria, what to report back, and which of the user\'s skills to use.'),
        cwd: z.string().trim().min(1).max(4096).optional().describe('Working folder on that computer, e.g. ~/src/<project>.'),
        computer: computerField.optional(),
        provider: z.enum(['copilot', 'claude']).optional(),
        mode: z.enum(['interactive', 'plan', 'autopilot']).optional().describe('autopilot works without stopping to ask; interactive may ask the user questions.'),
        model: z.string().trim().min(1).max(200).optional(),
        reasoningEffort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
      }),
      async (args) => {
        const defaults = host.defaults()
        const computer = requireComputer(args.computer ?? defaults.computerId ?? localComputer(host).id)
        const provider: AgentProvider = args.provider ?? defaults.provider ?? 'copilot'
        const capability = computer.providers?.find((candidate) => candidate.id === provider)
        if (capability && !capability.available) {
          throw new ToolFailure(capability.unavailableReason || `${provider} is not available on ${computer.name}.`)
        }
        const sameProvider = (defaults.provider ?? 'copilot') === provider
        const mode: AgentMode | undefined = args.mode ?? defaults.mode
        const model = args.model ?? (sameProvider ? defaults.model : undefined)
        const reasoningEffort: RuntimeReasoningEffort | undefined =
          args.reasoningEffort ?? (sameProvider && !args.model ? defaults.reasoningEffort : undefined)
        const input: CreateSessionInput = {
          cwd: args.cwd ?? (host.sessionFolders()[computer.id] || defaults.folders?.[computer.id]?.trim() || '~'),
          provider,
          terminalBacked: capability?.terminalBacked === true,
          allowAllPermissions: true,
          ...(mode ? { mode } : {}),
          ...(model ? { model } : {}),
          ...(reasoningEffort ? { reasoningEffort } : {}),
        }
        const created = await host.createSession(computer.id, input)
        const title = sessionTitle(args.title)
        let named = created
        try {
          named = await host.renameSession(computer.id, created.id, title)
        } catch {
          named = { ...created, title: created.title }
        }
        const session = { ...named, title: named.title || title }
        await host.markManaged(session, args.prompt)
        onActivity({
          tool: 'create_session',
          content: `Started "${session.title}" on ${computer.name}`,
          sessionRefs: [ref(session)],
        })
        try {
          await deliver(session, args.prompt)
        } catch (error) {
          throw new ToolFailure(
            `Session ${session.id} (${link(session)}) was created on ${computer.name}, but its task was not delivered: ${errorMessage(error)}. Read it with get_session, answer anything it is waiting on with answer_session, then send the task with send_to_session using that id; do not create another session.`,
          )
        }
        return `Started ${link(session)} — id ${session.id} on ${computer.name} (${computer.id}) in ${created.cwd}${mode ? `, ${mode} mode` : ''}. Its task was sent.`
      },
      { actsOnSessions: true }
    ),
    define(
      'set_session_folder',
      "Change the folder your new sessions start in on a computer, when the user asks you to. The user's choice in App settings → Oracle is where it starts; null returns that computer to its default folder. Existing sessions stay where they are.",
      z.object({
        folder: z.string().trim().min(1).max(4096).nullable().describe('Folder on that computer, e.g. ~/src/<project>; null returns to the default.'),
        computer: computerField.optional(),
      }),
      async ({ folder, computer }) => {
        const target = requireComputer(computer ?? host.defaults().computerId ?? localComputer(host).id)
        const saved = await host.setSessionFolder(target.id, folder ?? undefined)
        onActivity({
          tool: 'set_session_folder',
          content: saved
            ? `Now starting sessions on ${target.name} in ${saved}`
            : `Back to ${target.name}'s default folder for new sessions`,
        })
        return saved
          ? `New sessions on ${target.name} (${target.id}) now start in ${saved}.`
          : `New sessions on ${target.name} (${target.id}) now start in ${target.name}'s default folder.`
      },
    ),
    define(
      'send_to_session',
      'Send a message or follow-up instruction to any session. A closed session is reopened and a suspended one resumed first; a folder-trust prompt is answered. If it is busy the message waits in its queue.',
      z.object({
        sessionId: sessionIdField,
        computer: computerField.optional(),
        message: z.string().trim().min(1).max(100_000),
      }),
      async ({ sessionId, computer, message }) => {
        let session = await resolveSession(sessionId, computer, { history: true })
        if (session.isOpen === false) {
          session = { ...session, ...(await host.reopenSession(session.computerId, session.id)), title: session.title }
          onActivity({ tool: 'send_to_session', content: `Reopened "${session.title}"`, sessionRefs: [ref(session)] })
        } else if (session.suspended) {
          session = { ...session, ...(await host.resumeSession(session.computerId, session.id)), title: session.title }
          onActivity({ tool: 'send_to_session', content: `Resumed "${session.title}"`, sessionRefs: [ref(session)] })
        }
        await deliver(session, message)
        onActivity({ tool: 'send_to_session', content: `Sent a message to "${session.title}"`, sessionRefs: [ref(session)] })
        return `Sent to ${link(session)}${session.status === 'running' ? ' (it was busy, so the message is queued)' : ''}.`
      },
      { actsOnSessions: true }
    ),
    define(
      'rename_session',
      "Rename a session so its purpose is clear in the user's list.",
      z.object({ sessionId: sessionIdField, computer: computerField.optional(), title: z.string().trim().min(1).max(100) }),
      async ({ sessionId, computer, title }) => {
        const session = await resolveSession(sessionId, computer)
        const renamed = await host.renameSession(session.computerId, session.id, sessionTitle(title))
        onActivity({ tool: 'rename_session', content: `Renamed "${session.title}" to "${renamed.title}"`, sessionRefs: [ref(renamed)] })
        return `Renamed to ${link(renamed)}.`
      },
      { actsOnSessions: true }
    ),
    define(
      'answer_session',
      "Answer what a session is waiting on, so it can carry on without the user: a permission request, including Copilot's folder-trust prompt, or a question or form. Read it first with get_session. For a permission, response names an option or says approve or deny. For a question, response is one of its choices or your own answer where it allows one; responses picks several; values fills a form; dismiss cancels a question.",
      z.object({
        sessionId: sessionIdField,
        computer: computerField.optional(),
        response: z.string().trim().min(1).max(20_000).optional(),
        responses: z.array(z.string().trim().min(1).max(20_000)).min(1).max(32).optional(),
        values: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
        dismiss: z.boolean().optional(),
        requestId: z.string().trim().min(1).max(500).optional()
          .describe('The request you read with get_session, so a different prompt is never answered by mistake.'),
      }),
      async ({ sessionId, computer, response, responses, values, dismiss, requestId }) => {
        const found = await resolveSession(sessionId, computer)
        const detail = await host.readSession(found.computerId, found.id)
        const permission = detail.pendingPermission && !detail.pendingPermission.stale ? detail.pendingPermission : undefined
        const question = detail.pendingUserInput && !detail.pendingUserInput.stale ? detail.pendingUserInput : undefined
        const pending = permission ?? question
        if (!pending) throw new ToolFailure(`"${found.title}" is not waiting on an answer.`)
        if (requestId && pending.requestId !== requestId) {
          throw new ToolFailure(`"${found.title}" is now waiting on something else (${permission ? permission.title : question!.question}). Read it with get_session before answering.`)
        }
        if (permission) {
          const option = response ? permissionOption(permission, response) : undefined
          if (!option) {
            throw new ToolFailure(`Choose one of: ${permission.options.map((candidate) => `"${candidate.name}"`).join(', ')}.`)
          }
          await host.replyPermission(found.computerId, found.id, permission.requestId, option.optionId)
          onActivity({
            tool: 'answer_session',
            content: `Answered "${truncate(permission.title, 120)}" on "${found.title}": ${option.name}`,
            sessionRefs: [ref(found)],
          })
          return `Chose "${option.name}" for "${permission.title}" on ${link(found)}.`
        }
        const asked = question!
        const choice = (text: string) => asked.choices.find((candidate) => candidate.toLowerCase() === text.trim().toLowerCase())
        let reply: UserInputReplyInput
        if (dismiss) {
          reply = { action: 'cancel', answer: '', wasFreeform: false }
        } else if (asked.form) {
          if (!values) {
            throw new ToolFailure(`This is a form; give values for: ${asked.form.fields.map((field) => field.name).join(', ')}.`)
          }
          reply = { answer: JSON.stringify(values), wasFreeform: false, values }
        } else if (responses?.length) {
          const picked = responses.map((text) => choice(text))
          if (picked.some((candidate) => candidate === undefined) || (!asked.multiSelect && picked.length > 1)) {
            throw new ToolFailure(`Choose ${asked.multiSelect ? 'from' : 'one of'}: ${asked.choices.map((candidate) => `"${candidate}"`).join(', ')}.`)
          }
          const answers = picked as string[]
          reply = asked.multiSelect
            ? { answer: answers.join(', '), wasFreeform: false, answers }
            : { answer: answers[0], wasFreeform: false }
        } else if (response) {
          const chosen = choice(response)
          if (chosen) reply = { answer: chosen, wasFreeform: false }
          else if (asked.allowFreeform) reply = { answer: response, wasFreeform: true }
          else throw new ToolFailure(`Choose one of: ${asked.choices.map((candidate) => `"${candidate}"`).join(', ')}.`)
        } else {
          throw new ToolFailure('Give a response, responses, values, or dismiss.')
        }
        await host.replyUserInput(found.computerId, found.id, asked.requestId, reply)
        const said = reply.action === 'cancel' ? 'dismissed' : truncate(reply.answer, 120)
        onActivity({
          tool: 'answer_session',
          content: `Answered "${truncate(asked.question, 120)}" on "${found.title}": ${said}`,
          sessionRefs: [ref(found)],
        })
        return `Answered ${link(found)}: ${said}.`
      },
      { actsOnSessions: true },
    ),
    define(
      'cancel_session',
      "Stop a session's current turn. The session stays open.",
      z.object({ sessionId: sessionIdField, computer: computerField.optional() }),
      async ({ sessionId, computer }) => {
        const session = await resolveSession(sessionId, computer)
        await host.cancel(session.computerId, session.id)
        onActivity({ tool: 'cancel_session', content: `Stopped "${session.title}"`, sessionRefs: [ref(session)] })
        return `Stopped the current turn of ${link(session)}.`
      },
      { actsOnSessions: true }
    ),
    define(
      'close_session',
      "Ask the user to close a session, which permanently deletes it and its history. This does not close anything itself: the user confirms or declines in the app, and the session stays open until they confirm. Only ask when the user wants that specific session closed.",
      z.object({
        sessionId: sessionIdField,
        computer: computerField.optional(),
        reason: z.string().trim().max(300).optional().describe('One short line on why, shown to the user beside the request.'),
      }),
      async ({ sessionId, computer, reason }) => {
        const session = await resolveSession(sessionId, computer)
        await host.requestCloseConfirmation(session, reason)
        return `Asked the user to confirm closing ${link(session)} in the app. It stays open until they confirm; the outcome appears in your next turn.`
      },
      { actsOnSessions: true }
    ),
    define(
      'list_skills',
      "List the user's skills (name and description), so delegated prompts can name the ones that apply.",
      z.object({
        folder: z.string().trim().min(1).max(4096).optional().describe('A project folder on this hub whose project skills to include.'),
      }),
      async ({ folder }) => {
        const local = localComputer(host)
        const folders = folder
          ? [folder]
          : [...new Set((await host.listSessions())
              .filter((session) => session.computerId === local.id)
              .map((session) => session.cwd))].slice(0, 10)
        const skills = await host.discoverSkills(folders)
        if (!skills.length) return 'No skills found.'
        return skills
          .map((skill) => `- ${skill.name}${skill.description ? ` — ${truncate(skill.description.replace(/\s+/g, ' '), 300)}` : ''}${skill.source ? ` (${skill.source})` : ''}`)
          .join('\n')
      },
    ),
    ...structuredTools(),
    define(
      'memory_list',
      'List your memory notes with their sizes.',
      z.object({}),
      async () => {
        const entries = await host.memory.list()
        return entries.length
          ? entries.map((entry) => `- ${entry.path} (${entry.bytes} bytes, updated ${entry.updatedAt})`).join('\n')
          : 'Memory is empty. Start with MEMORY.md as your index.'
      },
    ),
    define(
      'memory_read',
      'Read one of your memory notes.',
      z.object({ path: z.string().trim().min(1).max(300) }),
      ({ path }) => memoryTool(() => host.memory.read(path)),
    ),
    define(
      'memory_write',
      'Create or replace one of your memory notes (Markdown, relative path such as MEMORY.md or sessions/<id>.md).',
      z.object({ path: z.string().trim().min(1).max(300), content: z.string().max(256 * 1024) }),
      async ({ path, content }) => {
        await memoryTool(() => host.memory.write(path, content))
        onActivity({ tool: 'memory_write', content: `Updated memory: ${path}` })
        return `Saved ${path}.`
      },
    ),
    define(
      'memory_append',
      'Append text to one of your memory notes, creating it if needed.',
      z.object({ path: z.string().trim().min(1).max(300), content: z.string().min(1).max(256 * 1024) }),
      async ({ path, content }) => {
        await memoryTool(() => host.memory.append(path, content))
        onActivity({ tool: 'memory_append', content: `Updated memory: ${path}` })
        return `Appended to ${path}.`
      },
    ),
    define(
      'memory_delete',
      'Delete one of your memory notes.',
      z.object({ path: z.string().trim().min(1).max(300) }),
      async ({ path }) => {
        await memoryTool(() => host.memory.delete(path))
        onActivity({ tool: 'memory_delete', content: `Deleted memory: ${path}` })
        return `Deleted ${path}.`
      },
    ),
  ]
}

function localComputer(host: ManagerToolHost): ComputerSummary {
  const local = host.computers().find((computer) => computer.isLocal)
  if (!local) throw new ToolFailure('This hub is not listed among the computers.')
  return local
}
