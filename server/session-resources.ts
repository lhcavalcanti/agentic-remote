import type { Query } from '@anthropic-ai/claude-agent-sdk'
import type { CopilotClient, CopilotSession } from '@github/copilot-sdk'
import type {
  AgentProvider,
  ServerEvent,
  SessionDetail,
  SessionMcpServerSummary,
  SessionMcpServersSnapshot,
  SessionMcpStatus,
  SessionResourceScope,
  SessionResourceSnapshot,
  SessionResourceSource,
  SessionSkillSummary,
  SessionSkillsSnapshot,
} from '../shared/contracts.js'
import type { SessionService } from './session-service.js'

export const MAX_SESSION_RESOURCES = 2_000

export const resourceMessages = {
  unavailable: 'This runtime does not expose read-only session resource metadata.',
  update: 'Update the owning runtime to view session resources.',
  unreported: 'No resource metadata has been reported for this session. A view never starts a turn.',
  workspace: 'Configured defaults for this working folder, not live terminal state or session overrides.',
  lastKnown: 'Last reported by this session; its runtime is no longer active.',
} as const

const errorMessages = {
  missing: 'Session not found.',
  stopped: 'The session resource service is stopped.',
  changed: 'Session ownership changed while reading resources. Refresh the session.',
  pairing: 'Computer pairing changed while reading resources. Select the computer again.',
  computer: 'Computer is not registered.',
  failed: 'Unable to read session resource metadata.',
  invalid: 'The runtime returned invalid session resource metadata.',
} as const

export class SessionResourceError extends Error {
  readonly statusCode: number

  constructor(reason: keyof typeof errorMessages) {
    super(errorMessages[reason])
    this.name = 'SessionResourceError'
    this.statusCode = reason === 'missing' || reason === 'computer' ? 404
      : reason === 'stopped' ? 503
        : reason === 'changed' || reason === 'pairing' ? 409 : 502
  }
}

export function safeResourceError(error: unknown): SessionResourceError {
  return error instanceof SessionResourceError ? error : new SessionResourceError('failed')
}

export function isResourceMethodUnavailable(error: unknown): boolean {
  return object(error)?.code === -32601
}

export function isSessionResourceRoute(url: string | undefined): boolean {
  return url?.endsWith('/sessions/:sessionId/skills') === true ||
    url?.endsWith('/sessions/:sessionId/mcp') === true
}

function object(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined
}

function text(value: unknown, limit: number, required = false, multiline = false): string | undefined {
  if (value === undefined && !required) return undefined
  if (typeof value !== 'string' || value.length > limit) {
    throw new SessionResourceError('invalid')
  }
  for (const character of value) {
    const code = character.charCodeAt(0)
    if ((code < 32 && !(multiline && (code === 9 || code === 10 || code === 13))) ||
      (code >= 127 && code <= 159) || (code >= 0x202a && code <= 0x202e) ||
      (code >= 0x2066 && code <= 0x2069)) throw new SessionResourceError('invalid')
  }
  const normalized = value.trim()
  if (!normalized && required) throw new SessionResourceError('invalid')
  return normalized || undefined
}

function flag(value: unknown): boolean | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'boolean') throw new SessionResourceError('invalid')
  return value
}

function count(value: unknown): number | undefined {
  if (value === undefined) return undefined
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new SessionResourceError('invalid')
  }
  return value as number
}

function source(value: unknown): SessionResourceSource | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string') return 'unknown'
  switch (value) {
    case 'project': case 'inherited': case 'user': case 'plugin':
    case 'builtin': case 'custom': case 'unknown': return value
    case 'personal-copilot': case 'personal-agents': return 'user'
    case 'workspace': return 'project'
    default: return 'unknown'
  }
}

function status(value: unknown): SessionMcpStatus {
  switch (value) {
    case 'connected': case 'failed': case 'needs-auth': case 'pending':
    case 'disabled': case 'stopped': case 'not_configured': return value
    default: return 'unknown'
  }
}

function transport(value: unknown): SessionMcpServerSummary['transport'] {
  switch (value) {
    case 'stdio': case 'http': case 'sse': case 'memory': return value
    default: return undefined
  }
}

function skill(value: unknown): SessionSkillSummary {
  const entry = object(value)
  if (!entry) throw new SessionResourceError('invalid')
  return {
    name: text(entry.name, 256, true)!,
    description: text(entry.description, 4_000, false, true),
    commandName: text(entry.commandName, 256),
    argumentHint: text(entry.argumentHint, 1_000),
    source: source(entry.source),
    enabled: flag(entry.enabled),
    userInvocable: flag(entry.userInvocable),
    pluginName: text(entry.pluginName, 256),
  }
}

function mcpServer(value: unknown): SessionMcpServerSummary {
  const entry = object(value)
  if (!entry || typeof entry.status !== 'string') throw new SessionResourceError('invalid')
  return {
    name: text(entry.name, 256, true)!,
    status: status(entry.status),
    source: source(entry.source),
    transport: transport(entry.transport),
    enabled: flag(entry.enabled),
    toolCount: count(entry.toolCount),
    pluginName: text(entry.pluginName, 256),
  }
}

interface ResourceItems<T> {
  items: T[]
  totalCount: number
  truncated: boolean
}

function items<T>(value: unknown, normalize: (entry: unknown) => T): ResourceItems<T> {
  if (!Array.isArray(value)) throw new SessionResourceError('invalid')
  return {
    items: value.slice(0, MAX_SESSION_RESOURCES).map(normalize),
    totalCount: value.length,
    truncated: value.length > MAX_SESSION_RESOURCES,
  }
}

type CopilotSkills = Awaited<ReturnType<CopilotSession['rpc']['skills']['list']>>
type CopilotWorkspaceSkills = Awaited<ReturnType<CopilotClient['rpc']['skills']['discover']>>
type CopilotMcp = Awaited<ReturnType<CopilotSession['rpc']['mcp']['list']>>
type CopilotWorkspaceMcp = Awaited<ReturnType<CopilotClient['rpc']['mcp']['discover']>>

export function copilotSkills(result: CopilotSkills | CopilotWorkspaceSkills): ResourceItems<SessionSkillSummary> {
  const raw = object(result)
  if (raw?.errors !== undefined &&
    (!Array.isArray(raw.errors) || raw.errors.length > 0)) {
    // Discovery diagnostics contain paths. A partial/failed discovery is not
    // an authoritative empty list, and its raw diagnostics never leave here.
    throw new SessionResourceError('failed')
  }
  return items(raw?.skills, skill)
}

export function copilotMcp(result: CopilotMcp): ResourceItems<SessionMcpServerSummary> {
  return items(object(result)?.servers, (value) => {
    const entry = object(value)
    return mcpServer({
      name: entry?.name, status: entry?.status, source: entry?.source,
      pluginName: entry?.sourcePlugin,
    })
  })
}

export function copilotWorkspaceMcp(result: CopilotWorkspaceMcp): ResourceItems<SessionMcpServerSummary> {
  return items(object(result)?.servers, (value) => {
    const entry = object(value)
    if (typeof entry?.enabled !== 'boolean') throw new SessionResourceError('invalid')
    return mcpServer({
      name: entry.name, status: entry.enabled ? 'unknown' : 'disabled',
      source: entry.source, pluginName: entry.sourcePlugin,
      enabled: entry.enabled, transport: entry.type,
    })
  })
}

export function claudeSkillNames(value: unknown): ResourceItems<SessionSkillSummary> {
  return items(value, (name) => skill({ name }))
}

export function claudeMcp(value: unknown): ResourceItems<SessionMcpServerSummary> {
  return items(value, (value) => {
    const entry = object(value)
    if (entry?.tools !== undefined && !Array.isArray(entry.tools)) {
      throw new SessionResourceError('invalid')
    }
    return mcpServer({
      name: entry?.name, status: entry?.status, source: entry?.scope,
      toolCount: Array.isArray(entry?.tools) ? entry.tools.length : undefined,
    })
  })
}

export function enrichClaudeSkills(
  skills: SessionSkillSummary[],
  commands: Awaited<ReturnType<Query['supportedCommands']>>,
): SessionSkillSummary[] {
  if (!Array.isArray(commands)) throw new SessionResourceError('invalid')
  const matches = new Map<string, SessionSkillSummary>()
  for (const value of commands.slice(0, MAX_SESSION_RESOURCES)) {
    const entry = object(value)
    const name = text(entry?.name, 256, true)!
    const summary = skill({
      name, commandName: name,
      description: entry?.description, argumentHint: entry?.argumentHint,
    })
    matches.set(name.replace(/^\//, ''), summary)
    if (entry?.aliases !== undefined) {
      if (!Array.isArray(entry.aliases)) throw new SessionResourceError('invalid')
      for (const alias of entry.aliases.slice(0, 32)) {
        matches.set(text(alias, 256, true)!.replace(/^\//, ''), summary)
      }
    }
  }
  return skills.map((entry) => {
    const match = matches.get(entry.name.replace(/^\//, ''))
    return match ? { ...match, name: entry.name } : { ...entry }
  })
}

function messageFor(scope: SessionResourceScope): string | undefined {
  return scope === 'workspace' ? resourceMessages.workspace
    : scope === 'last-known' ? resourceMessages.lastKnown
      : scope === 'unavailable' ? resourceMessages.unavailable : undefined
}

export function skillsSnapshot(
  sessionId: string, provider: AgentProvider, scope: SessionResourceScope,
  result: ResourceItems<SessionSkillSummary>,
  capturedAt = new Date().toISOString(),
): SessionSkillsSnapshot {
  return {
    sessionId, provider, scope, capturedAt, message: messageFor(scope),
    totalCount: result.totalCount, truncated: result.truncated, skills: result.items,
  }
}

export function mcpSnapshot(
  sessionId: string, provider: AgentProvider, scope: SessionResourceScope,
  result: ResourceItems<SessionMcpServerSummary>,
  capturedAt = new Date().toISOString(),
): SessionMcpServersSnapshot {
  return {
    sessionId, provider, scope, capturedAt, message: messageFor(scope),
    totalCount: result.totalCount, truncated: result.truncated, servers: result.items,
  }
}

export function unavailableSkills(
  sessionId: string, provider: AgentProvider,
  message: string = resourceMessages.unavailable,
): SessionSkillsSnapshot {
  return { sessionId, provider, scope: 'unavailable', capturedAt: new Date().toISOString(), message, skills: [] }
}

export function unavailableMcp(
  sessionId: string, provider: AgentProvider,
  message: string = resourceMessages.unavailable,
): SessionMcpServersSnapshot {
  return { sessionId, provider, scope: 'unavailable', capturedAt: new Date().toISOString(), message, servers: [] }
}

function snapshotBase(
  raw: unknown, sessionId: string, provider: AgentProvider, length: number,
): SessionResourceSnapshot {
  const value = object(raw)
  if (!value || value.sessionId !== sessionId || value.provider !== provider) {
    throw new SessionResourceError('invalid')
  }
  const scope = value.scope
  if (scope !== 'session' && scope !== 'workspace' && scope !== 'last-known' && scope !== 'unavailable') {
    throw new SessionResourceError('invalid')
  }
  const capturedAt = text(value.capturedAt, 40, true)!
  if (!/^\d{4}-\d{2}-\d{2}T/.test(capturedAt) || !Number.isFinite(Date.parse(capturedAt))) {
    throw new SessionResourceError('invalid')
  }
  const total = count(value.totalCount)
  const truncated = flag(value.truncated) === true || length > MAX_SESSION_RESOURCES
  if ((total !== undefined && total < length) ||
    (total !== undefined && total > length && !truncated) ||
    (truncated && (total ?? length) <= Math.min(length, MAX_SESSION_RESOURCES)) ||
    (scope === 'unavailable' && (length > 0 || (total ?? 0) > 0 || truncated))) {
    throw new SessionResourceError('invalid')
  }
  const safeMessage = Object.values(resourceMessages).find((message) => value.message === message)
  return {
    sessionId, provider, scope, capturedAt,
    message: safeMessage ?? messageFor(scope),
    ...(scope === 'unavailable' ? {} : { totalCount: total ?? length, truncated }),
  }
}

export function sanitizeSkillsSnapshot(
  raw: unknown, sessionId: string, provider: AgentProvider,
): SessionSkillsSnapshot {
  const result = items(object(raw)?.skills, skill)
  return { ...snapshotBase(raw, sessionId, provider, result.totalCount), skills: result.items }
}

export function sanitizeMcpSnapshot(
  raw: unknown, sessionId: string, provider: AgentProvider,
): SessionMcpServersSnapshot {
  const result = items(object(raw)?.servers, mcpServer)
  return { ...snapshotBase(raw, sessionId, provider, result.totalCount), servers: result.items }
}

export function sameResourceOwner(before: SessionDetail, after: SessionDetail | undefined): boolean {
  return after !== undefined && before.id === after.id &&
    (before.provider ?? 'copilot') === (after.provider ?? 'copilot') &&
    before.cwd === after.cwd && before.executionMode === after.executionMode &&
    Boolean(before.suspended) === Boolean(after.suspended)
}

// Observers do not join lifecycle/turn queues, hydrate sessions, or write to
// storage. Their results are discarded when their original owner changes.
async function readServiceResources<T>(
  service: SessionService, sessionId: string,
  read: (session: SessionDetail, provider: AgentProvider) => Promise<T>,
): Promise<T> {
  let changed = false
  const session = service.getSession(sessionId)
  if (!session) throw new SessionResourceError('missing')
  const listener = (event: ServerEvent) => {
    if ((event.type === 'session.removed' && event.sessionId === sessionId) ||
      (event.type === 'session.upserted' && event.session.id === sessionId &&
        !sameResourceOwner(session, event.session))) changed = true
  }
  service.on('event', listener)
  try {
    const result = await read(session, session.provider ?? 'copilot')
    if (changed || !sameResourceOwner(session, service.getSession(sessionId))) {
      throw new SessionResourceError('changed')
    }
    return result
  } catch (error) {
    throw safeResourceError(error)
  } finally {
    service.off('event', listener)
  }
}

export function readSessionSkills(service: SessionService, sessionId: string): Promise<SessionSkillsSnapshot> {
  return readServiceResources(service, sessionId, async (_session, provider) => {
    if (!service.listSkills || !service.providers().some((entry) =>
      entry.id === provider && entry.supportsSessionResources === true)) {
      return unavailableSkills(sessionId, provider, resourceMessages.update)
    }
    return sanitizeSkillsSnapshot(await service.listSkills(sessionId), sessionId, provider)
  })
}

export function readSessionMcpServers(service: SessionService, sessionId: string): Promise<SessionMcpServersSnapshot> {
  return readServiceResources(service, sessionId, async (_session, provider) => {
    if (!service.listMcpServers || !service.providers().some((entry) =>
      entry.id === provider && entry.supportsSessionResources === true)) {
      return unavailableMcp(sessionId, provider, resourceMessages.update)
    }
    return sanitizeMcpSnapshot(await service.listMcpServers(sessionId), sessionId, provider)
  })
}
