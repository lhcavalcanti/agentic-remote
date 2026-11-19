import { defaultHubFeatureFlags, type HubFeatureFlags } from '../shared/feature-flags'
import type { HubHealth } from '../shared/hub-health'
import { skillSettingsSchema, type SkillSettingsSnapshot, type SkillToggle } from '../shared/skill-settings'

export async function listComputerSkills(computerId: string, signal?: AbortSignal): Promise<SkillSettingsSnapshot> {
  return skillSettingsSchema.parse(await request(`/api/computers/${encodeURIComponent(computerId)}/skills`, { signal, cache: 'no-store' }))
}

export async function toggleComputerSkill(computerId: string, input: SkillToggle): Promise<SkillSettingsSnapshot> {
  return skillSettingsSchema.parse(await request(`/api/computers/${encodeURIComponent(computerId)}/skills`, {
    method: 'PATCH', body: JSON.stringify(input),
  }))
}

export async function getHubHealth(signal?: AbortSignal): Promise<HubHealth> {
  return request('/api/diagnostics/health', { signal, cache: 'no-store' })
}
import type {
  AddComputerInput,
  AgentProvider,
  AudioTranscription,
  BackgroundTaskSnapshot,
  ComputerSummary,
  ConfigureRuntimeInput,
  CreateSessionInput,
  DirectoryListing,
  ExecuteCommandInput,
  ManagedSession,
  AddKnowledgeRootInput,
  KnowledgeRoot,
  PushSettings,
  SessionOrderSnapshot,
  ProviderRuntimeOptions,
  ManagedRemovedQueuedPrompt,
  ManagedQueuedPromptDispatchResult,
  ManagedSessionSkillsSnapshot,
  ManagedSessionMcpServersSnapshot,
  SessionResourceSnapshot,
  SessionSkillSummary,
  SessionMcpServerSummary,
  PermissionReplyInput,
  RenameSessionInput,
  RuntimeOptions,
  SessionRecoveryReason,
  SendMessageInput,
  SessionKnowledgeBinding,
  SessionKnowledgeRootMutationInput,
  SessionFileUpload,
  SideQuestionAnswer,
  SideQuestionInput,
  SlashCommand,
  UserInputReplyInput,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
  SideQuestionExchange,
} from '../shared/contracts'
import type {
  ManagerClientDefaults,
  ManagerAttachment,
  ManagerMessage,
  ManagerSettingsSnapshot,
  ManagerSnapshot,
  ResolveManagerConfirmationInput,
  SendManagerMessageInput,
  UpdateManagerSettingsInput,
} from '../shared/manager'
import type { VoiceCapabilities } from '../shared/oracle-voice'
import {
  httpDeliveryUncertain,
  parseSubmissionReceipt,
  SubmissionError,
} from '../shared/submission-error'
import type {
  SettingsChange,
  SettingsProfileKey,
  SettingsProfileSnapshot,
  SettingsProfileValues,
  SettingsUpdateResult,
} from '../shared/settings-profile'
import { HubSignInExpiredError, hubFetch } from './hub-sign-in'
import { currentSessionEventSequence, rememberSessionResponse } from './session-response-order'

async function responseError(
  response: Response,
  definiteStatuses?: ReadonlySet<number>,
  retrySafe = false,
): Promise<Error> {
  const payload = (await response.json().catch(() => null)) as
    | {
        error?: string
        message?: string
        statusCode?: number
        code?: unknown
        submission?: unknown
        terminalDraftConflict?: unknown
        uncertainDelivery?: unknown
      }
    | null
  const retryGuidance = retrySafe
    ? 'Check the hub service and tunnel, then retry.'
    : 'Check the hub service and tunnel before retrying; the request outcome is unknown.'
  const fallback = response.status === 502
    ? `The gateway could not reach Agentic Remote (502). ${retryGuidance}`
    : response.status === 504
      ? `Agentic Remote did not answer the gateway in time (504). ${retryGuidance}`
      : `Request failed (${response.status})`
  const submission = parseSubmissionReceipt(payload?.submission)
  const options = {
    code: typeof payload?.code === 'string' ? payload.code : undefined,
    terminalDraftConflict: payload?.terminalDraftConflict === true,
    uncertainDelivery: httpDeliveryUncertain(
      response.status,
      payload?.uncertainDelivery,
      submission,
      definiteStatuses,
    ),
  }
  if (!payload) {
    return new SubmissionError(fallback, response.status, undefined, options)
  }
  // Fastify's built-in envelope carries a numeric `statusCode`, a generic
  // `error` label, and the real reason in `message`; the app's own handler
  // sends `{ error }` with optional metadata. `statusText` can be empty over
  // HTTP/2. A 5xx `message` is the raw exception and must not reach the UI.
  const isDefaultEnvelope =
    typeof payload.statusCode === 'number' &&
    typeof payload.message === 'string'
  if (isDefaultEnvelope && response.status < 500) {
    return new SubmissionError(
      payload.message || payload.error || fallback,
      response.status,
      submission,
      options,
    )
  }
  return new SubmissionError(
    payload.error || fallback,
    response.status,
    submission,
    options,
  )
}

export async function request<TResult>(
  path: string,
  init?: RequestInit,
): Promise<TResult> {
  const startedAtSequence = currentSessionEventSequence()
  const headers = new Headers(init?.headers)
  if (
    init?.body != null &&
    !(init.body instanceof FormData) &&
    !headers.has('content-type')
  ) {
    headers.set('content-type', 'application/json')
  }
  const response = await hubFetch(path, {
    ...init,
    headers,
  })
  if (!response.ok) {
    throw await responseError(
      response,
      undefined,
      !init?.method || init.method.toUpperCase() === 'GET',
    )
  }
  return rememberSessionResponse(await response.json() as TResult, startedAtSequence)
}

export const HUB_SNAPSHOT_TIMEOUT_MS = 15_000

async function hubSnapshotRequest<TResult>(path: string): Promise<TResult> {
  const controller = new AbortController()
  let timedOut = false
  const timeout = globalThis.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, HUB_SNAPSHOT_TIMEOUT_MS)
  try {
    return await request<TResult>(path, {
      signal: controller.signal,
    })
  } catch (error) {
    if (timedOut) {
      throw new Error(
        'Agentic Remote did not answer within 15 seconds. Check the hub service and tunnel, then retry.',
      )
    }
    throw error
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

async function requestVoid(path: string, init: RequestInit): Promise<void> {
  const response = await hubFetch(path, init)
  if (!response.ok) {
    throw await responseError(response)
  }
}

function sessionPath(computerId: string, sessionId?: string): string {
  const base = `/api/computers/${encodeURIComponent(computerId)}/sessions`
  return sessionId ? `${base}/${encodeURIComponent(sessionId)}` : base
}

const resourceScopes = new Set(['session', 'workspace', 'last-known', 'unavailable'])
const resourceSources = new Set(['project', 'inherited', 'user', 'plugin', 'builtin', 'custom', 'unknown'])
const mcpStatuses = new Set(['connected', 'failed', 'needs-auth', 'pending', 'disabled', 'stopped', 'not_configured', 'unknown'])
const mcpTransports = new Set(['stdio', 'http', 'sse', 'memory'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function optionalText(value: unknown): boolean {
  return value === undefined || typeof value === 'string'
}

function optionalBoolean(value: unknown): boolean {
  return value === undefined || typeof value === 'boolean'
}

function optionalCount(value: unknown): boolean {
  return value === undefined || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0)
}

function resourceMetadata(
  value: unknown,
  computerId: string,
  sessionId: string,
  provider: AgentProvider,
): value is SessionResourceSnapshot & { computerId: string } {
  return isRecord(value) &&
    value.computerId === computerId && value.sessionId === sessionId && value.provider === provider &&
    typeof value.scope === 'string' && resourceScopes.has(value.scope) &&
    typeof value.capturedAt === 'string' && Number.isFinite(Date.parse(value.capturedAt)) &&
    optionalText(value.message) && optionalCount(value.totalCount) && optionalBoolean(value.truncated) &&
    (value.scope !== 'unavailable' || (typeof value.message === 'string' && Boolean(value.message.trim())))
}

function isSkillSummary(value: unknown): value is SessionSkillSummary {
  return isRecord(value) && typeof value.name === 'string' && Boolean(value.name.trim()) &&
    optionalText(value.description) && optionalText(value.commandName) &&
    optionalText(value.argumentHint) && optionalText(value.pluginName) &&
    optionalBoolean(value.enabled) && optionalBoolean(value.userInvocable) &&
    (value.source === undefined || (typeof value.source === 'string' && resourceSources.has(value.source)))
}

function isMcpSummary(value: unknown): value is SessionMcpServerSummary {
  return isRecord(value) && typeof value.name === 'string' && Boolean(value.name.trim()) &&
    typeof value.status === 'string' && mcpStatuses.has(value.status) &&
    optionalText(value.pluginName) && optionalBoolean(value.enabled) && optionalCount(value.toolCount) &&
    (value.source === undefined || (typeof value.source === 'string' && resourceSources.has(value.source))) &&
    (value.transport === undefined || (typeof value.transport === 'string' && mcpTransports.has(value.transport)))
}

function resourceSummary(value: SessionResourceSnapshot & { computerId: string }) {
  return {
    computerId: value.computerId,
    sessionId: value.sessionId,
    provider: value.provider,
    scope: value.scope,
    capturedAt: value.capturedAt,
    message: value.message,
    totalCount: value.totalCount,
    truncated: value.truncated,
  }
}

async function readResourceSnapshot(url: string, signal?: AbortSignal): Promise<unknown> {
  try {
    return await request<unknown>(url, { signal, cache: 'no-store' })
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('The computer returned an invalid resource response.')
    }
    throw error
  }
}

export async function listSessionSkills(
  computerId: string,
  sessionId: string,
  provider: AgentProvider,
  signal?: AbortSignal,
): Promise<ManagedSessionSkillsSnapshot> {
  const value = await readResourceSnapshot(`${sessionPath(computerId, sessionId)}/skills`, signal)
  if (!resourceMetadata(value, computerId, sessionId, provider) ||
    !('skills' in value) || !Array.isArray(value.skills) || !value.skills.every(isSkillSummary) ||
    (value.scope === 'unavailable' && value.skills.length > 0)) {
    throw new Error('The computer returned an invalid skills response for this session.')
  }
  return {
    ...resourceSummary(value),
    skills: value.skills.map((skill) => ({
      name: skill.name,
      description: skill.description,
      commandName: skill.commandName,
      argumentHint: skill.argumentHint,
      source: skill.source,
      enabled: skill.enabled,
      userInvocable: skill.userInvocable,
      pluginName: skill.pluginName,
    })),
  }
}

export async function listSessionMcpServers(
  computerId: string,
  sessionId: string,
  provider: AgentProvider,
  signal?: AbortSignal,
): Promise<ManagedSessionMcpServersSnapshot> {
  const value = await readResourceSnapshot(`${sessionPath(computerId, sessionId)}/mcp`, signal)
  if (!resourceMetadata(value, computerId, sessionId, provider) ||
    !('servers' in value) || !Array.isArray(value.servers) || !value.servers.every(isMcpSummary) ||
    (value.scope === 'unavailable' && value.servers.length > 0)) {
    throw new Error('The computer returned an invalid MCP response for this session.')
  }
  return {
    ...resourceSummary(value),
    servers: value.servers.map((server) => ({
      name: server.name,
      status: server.status,
      source: server.source,
      transport: server.transport,
      enabled: server.enabled,
      toolCount: server.toolCount,
      pluginName: server.pluginName,
    })),
  }
}

export async function fetchHubFeatureFlags(signal?: AbortSignal): Promise<HubFeatureFlags> {
  const response = await request<{ hubFlags?: unknown }>('/api/features', {
    cache: 'no-store',
    signal,
  })
  const flags = response.hubFlags
  if (!flags || typeof flags !== 'object' ||
    Object.keys(defaultHubFeatureFlags).some(
      (key) => typeof (flags as Record<string, unknown>)[key] !== 'boolean',
    )) {
    throw new Error('The hub returned invalid feature flags')
  }
  return Object.fromEntries(Object.keys(defaultHubFeatureFlags).map(
    (key) => [key, (flags as Record<string, unknown>)[key]],
  )) as HubFeatureFlags
}

/** The hub's settings profile, shared by every device that opens this hub. */
export async function fetchSettingsProfile(): Promise<SettingsProfileSnapshot> {
  const response = await request<{ settings: SettingsProfileSnapshot }>('/api/settings', {
    cache: 'no-store',
  })
  return response.settings
}

/** Sends this device's edits with the revision each was made from. */
export async function saveSettingsChanges(
  changes: Partial<Record<SettingsProfileKey, SettingsChange>>,
  deviceId?: string,
): Promise<SettingsUpdateResult> {
  return request<SettingsUpdateResult>('/api/settings', {
    method: 'PATCH',
    cache: 'no-store',
    body: JSON.stringify({ ...(deviceId ? { deviceId } : {}), changes }),
  })
}

/** Offers this browser's earlier settings; the hub keeps only unset ones. */
export async function importSettingsProfile(
  values: SettingsProfileValues,
  deviceId?: string,
): Promise<SettingsProfileSnapshot> {
  const response = await request<{ settings: SettingsProfileSnapshot }>('/api/settings/import', {
    method: 'POST',
    cache: 'no-store',
    body: JSON.stringify({ ...(deviceId ? { deviceId } : {}), values }),
  })
  return response.settings
}

/**
 * The hub's custom session order. It is fetched rather than read from
 * localStorage so every browser on this hub renders the same arrangement.
 */
export async function fetchSessionOrder(): Promise<SessionOrderSnapshot> {
  const response = await request<{ sessionOrder: SessionOrderSnapshot }>(
    '/api/session-order',
  )
  return response.sessionOrder
}

/** Saves the hub-owned session-list visibility shared by every browser. */
export async function saveSessionVisibility(
  showSuspended: boolean,
): Promise<SessionOrderSnapshot> {
  const response = await request<{ sessionOrder: SessionOrderSnapshot }>(
    '/api/session-order',
    { method: 'PUT', body: JSON.stringify({ showSuspended }) },
  )
  return response.sessionOrder
}

/** Saves whether every browser on this hub lists hidden sessions. */
export async function saveHiddenSessionVisibility(
  showHidden: boolean,
): Promise<SessionOrderSnapshot> {
  const response = await request<{ sessionOrder: SessionOrderSnapshot }>(
    '/api/session-order',
    { method: 'PUT', body: JSON.stringify({ showHidden }) },
  )
  return response.sessionOrder
}

/** Leaves a session out of the Sessions list, or puts it back. It keeps running either way. */
export async function saveSessionHidden(
  computerId: string,
  sessionId: string,
  hidden: boolean,
): Promise<SessionOrderSnapshot> {
  const response = await request<{ sessionOrder: SessionOrderSnapshot }>(
    `/api/session-order/${encodeURIComponent(computerId)}/${encodeURIComponent(sessionId)}`,
    { method: 'PUT', body: JSON.stringify({ hidden }) },
  )
  return response.sessionOrder
}

/** Marks a session read or unread for every browser on this hub. */
export async function saveSessionUnread(
  computerId: string,
  sessionId: string,
  unread: boolean,
): Promise<SessionOrderSnapshot> {
  const response = await request<{ sessionOrder: SessionOrderSnapshot }>(
    `/api/session-order/${encodeURIComponent(computerId)}/${encodeURIComponent(sessionId)}`,
    { method: 'PUT', body: JSON.stringify({ unread }) },
  )
  return response.sessionOrder
}

/** Submits one computer's lane, so a stale view cannot rewrite the others. */
export async function saveSessionOrderLane(
  computerId: string,
  order: string[],
): Promise<SessionOrderSnapshot> {
  const response = await request<{ sessionOrder: SessionOrderSnapshot }>(
    `/api/session-order/${encodeURIComponent(computerId)}`,
    { method: 'PUT', body: JSON.stringify({ order }) },
  )
  return response.sessionOrder
}

/** Offers a legacy browser-local order; the hub keeps it only if it has none. */
export async function bootstrapSessionOrder(
  order: Record<string, string[]>,
): Promise<SessionOrderSnapshot> {
  const response = await request<{ sessionOrder: SessionOrderSnapshot }>(
    '/api/session-order/bootstrap',
    { method: 'POST', body: JSON.stringify({ order }) },
  )
  return response.sessionOrder
}

/** Asks the hub something cheap only to learn whether the gateway still lets requests through. */
export async function checkHubSignIn(): Promise<void> {
  await hubFetch('/api/version', { cache: 'no-store' }).catch(() => undefined)
}

export async function listComputers(): Promise<ComputerSummary[]> {
  const response = await hubSnapshotRequest<{ computers: ComputerSummary[] }>(
    '/api/computers',
  )
  return response.computers
}

export async function addComputer(
  input: AddComputerInput,
): Promise<ComputerSummary> {
  const response = await request<{ computer: ComputerSummary }>('/api/computers', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return response.computer
}

export async function removeComputer(computerId: string): Promise<void> {
  await requestVoid(`/api/computers/${encodeURIComponent(computerId)}`, {
    method: 'DELETE',
  })
}

export interface SessionListing {
  sessions: ManagedSession[]
  /**
   * Which computers answered for their own sessions.
   *
   * A hub answers for a paired computer out of its cache when the node does
   * not reply, so a session missing from the list is only known to be missing
   * for a computer named here.
   */
  answeredComputerIds: string[]
}

export async function listSessions(): Promise<ManagedSession[]> {
  return (await listSessionListing()).sessions
}

export async function listSessionListing(): Promise<SessionListing> {
  const response = await hubSnapshotRequest<{
    sessions: ManagedSession[]
    answeredComputerIds?: string[]
  }>('/api/sessions')
  return {
    sessions: response.sessions,
    // An older hub says nothing about authority, and it answers for a node it
    // could not reach out of its own cache -- so the computers named in the
    // list are not the computers that were asked. Inferring authority from
    // them let a cached row settle a replacement that nothing had looked for.
    // Silence is read as silence: absence settles nothing and evicts nothing,
    // and a replacement is still settled by its own arrival or by an explicit
    // removal.
    answeredComputerIds: response.answeredComputerIds ?? [],
  }
}

export async function listHistory(): Promise<ManagedSession[]> {
  const response = await request<{ sessions: ManagedSession[] }>('/api/history')
  return response.sessions
}

/** Sessions closed on every reachable computer that can still be reopened. */
export async function listClosedSessions(): Promise<ManagedSession[]> {
  const response = await request<{ sessions: ManagedSession[] }>('/api/closed-sessions')
  return response.sessions
}

export async function listKnowledgeRoots(): Promise<KnowledgeRoot[]> {
  const response = await request<{ roots: KnowledgeRoot[] }>(
    '/api/knowledge/roots',
  )
  return response.roots
}

export async function addKnowledgeRoot(
  input: AddKnowledgeRootInput,
): Promise<KnowledgeRoot> {
  const response = await request<{ root: KnowledgeRoot }>(
    '/api/knowledge/roots',
    { method: 'POST', body: JSON.stringify(input) },
  )
  return response.root
}

export async function deleteKnowledgeRoot(rootId: string): Promise<void> {
  await requestVoid(`/api/knowledge/roots/${encodeURIComponent(rootId)}`, {
    method: 'DELETE',
  })
}

export class SessionKnowledgeRequestError extends Error {
  readonly status: number
  readonly binding?: SessionKnowledgeBinding

  constructor(
    message: string,
    status: number,
    binding?: SessionKnowledgeBinding,
  ) {
    super(message)
    this.name = 'SessionKnowledgeRequestError'
    this.status = status
    this.binding = binding
  }
}

async function requestSessionKnowledgeRoot(
  computerId: string,
  sessionId: string,
  input?: SessionKnowledgeRootMutationInput,
): Promise<SessionKnowledgeBinding> {
  const response = await hubFetch(`${sessionPath(computerId, sessionId)}/knowledge-root`, {
    cache: 'no-store',
    ...(input === undefined
      ? {}
      : {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input),
        }),
  })
  if (!response.ok) {
    const payload = await response.clone().json().catch(() => null) as {
      binding?: SessionKnowledgeBinding
    } | null
    throw new SessionKnowledgeRequestError(
      (await responseError(response, undefined, input === undefined)).message,
      response.status,
      payload?.binding,
    )
  }
  const payload = await response.json() as { binding: SessionKnowledgeBinding }
  return payload.binding
}

export async function getSessionKnowledgeRoot(
  computerId: string,
  sessionId: string,
): Promise<SessionKnowledgeBinding> {
  return requestSessionKnowledgeRoot(computerId, sessionId)
}

export async function updateSessionKnowledgeRoot(
  computerId: string,
  sessionId: string,
  input: SessionKnowledgeRootMutationInput,
): Promise<SessionKnowledgeBinding> {
  return requestSessionKnowledgeRoot(computerId, sessionId, input)
}

export async function listKnowledgeEntries(
  rootId: string,
  path = '.',
  basePath = '.',
): Promise<WorkspaceListing> {
  return request<WorkspaceListing>(
    `/api/knowledge/roots/${encodeURIComponent(rootId)}/entries?path=${encodeURIComponent(path)}${
      basePath === '.' ? '' : `&basePath=${encodeURIComponent(basePath)}`
    }`,
  )
}

export async function readKnowledgeFile(
  rootId: string,
  path: string,
  basePath = '.',
): Promise<WorkspaceFile> {
  return request<WorkspaceFile>(
    `/api/knowledge/roots/${encodeURIComponent(rootId)}/file?path=${encodeURIComponent(path)}${
      basePath === '.' ? '' : `&basePath=${encodeURIComponent(basePath)}`
    }`,
  )
}

export async function listDirectories(
  computerId: string,
  path = '~',
  scope: 'home' | 'all' = 'home',
): Promise<DirectoryListing> {
  return request<DirectoryListing>(
    `/api/computers/${encodeURIComponent(computerId)}/directories?path=${encodeURIComponent(path)}&scope=${encodeURIComponent(scope)}`,
  )
}

export async function validateSessionDirectory(
  computerId: string,
  path: string,
): Promise<string> {
  const response = await request<{ path: string }>(
    `/api/computers/${encodeURIComponent(computerId)}/directories/validate`,
    {
      method: 'POST',
      body: JSON.stringify({ path }),
    },
  )
  return response.path
}

export async function listWorkspace(
  computerId: string,
  sessionId: string,
  path = '.',
): Promise<WorkspaceListing> {
  return request<WorkspaceListing>(
    `${sessionPath(computerId, sessionId)}/workspace?path=${encodeURIComponent(path)}`,
  )
}

export async function readWorkspaceFile(
  computerId: string,
  sessionId: string,
  path: string,
): Promise<WorkspaceFile> {
  return request<WorkspaceFile>(
    `${sessionPath(computerId, sessionId)}/workspace/file?path=${encodeURIComponent(path)}`,
  )
}

export async function searchWorkspace(
  computerId: string,
  sessionId: string,
  query: string,
  path = '.',
): Promise<WorkspaceSearchResponse> {
  return request<WorkspaceSearchResponse>(
    `${sessionPath(computerId, sessionId)}/workspace/search?query=${encodeURIComponent(query)}&path=${encodeURIComponent(path)}`,
  )
}

export async function getSession(
  computerId: string,
  sessionId: string,
  signal?: AbortSignal,
  options: { passive?: boolean } = {},
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}${options.passive ? '?passive=1' : ''}`,
    { signal, cache: 'no-store' },
  )
  return response.session
}

export async function listCommands(
  computerId: string,
  sessionId: string,
): Promise<SlashCommand[]> {
  const response = await request<{ commands: SlashCommand[] }>(
    `${sessionPath(computerId, sessionId)}/commands`,
  )
  return response.commands
}

export async function createSession(
  computerId: string,
  input: CreateSessionInput,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    sessionPath(computerId),
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
  return response.session
}

export async function getProviderRuntimeOptions(
  computerId: string,
  provider: 'copilot' | 'claude',
): Promise<ProviderRuntimeOptions> {
  return request<ProviderRuntimeOptions>(
    `/api/computers/${encodeURIComponent(computerId)}/providers/${encodeURIComponent(provider)}/runtime`,
    { cache: 'no-store' },
  )
}

export async function activateSession(
  computerId: string,
  sessionId: string,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/open`,
    {
      method: 'POST',
      body: '{}',
    },
  )
  return response.session
}

export async function renameSession(
  computerId: string,
  sessionId: string,
  input: RenameSessionInput,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    sessionPath(computerId, sessionId),
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )
  return response.session
}

export async function removeQueuedPrompt(
  computerId: string,
  sessionId: string,
  promptId: string,
  acknowledgesDispatch?: string,
): Promise<ManagedRemovedQueuedPrompt> {
  return request<ManagedRemovedQueuedPrompt>(
    `${sessionPath(computerId, sessionId)}/queue/${encodeURIComponent(promptId)}`,
    {
      method: 'DELETE',
      ...(acknowledgesDispatch ? { body: JSON.stringify({ acknowledgesDispatch }) } : {}),
    },
  )
}

export async function dispatchQueuedPrompt(
  computerId: string,
  sessionId: string,
  promptId: string,
  content: string,
): Promise<ManagedQueuedPromptDispatchResult> {
  let response: Response
  try {
    response = await hubFetch(
      `${sessionPath(computerId, sessionId)}/queue/${encodeURIComponent(promptId)}/dispatch`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content }),
        signal: AbortSignal.timeout(35_000),
      },
    )
  } catch (caught) {
    // The gateway refused it before anything reached the hub.
    if (caught instanceof HubSignInExpiredError) throw caught
    throw Object.assign(new Error(
      'Dispatch could not be confirmed. Your rewrite is still here; check the queue and provider before trying again.',
    ), { uncertainDelivery: true })
  }
  if (!response.ok) {
    // A dispatch that might have gone is answered in the body, as an uncertain
    // outcome. A 409 is the queue refusing before anything was handed over, so
    // it is definite -- left to the conservative default it stranded a rewrite
    // that was plainly rejected behind a warning offering only to discard it.
    throw await responseError(response, definiteDispatchRefusals)
  }
  const result: unknown = await response.json().catch(() => null)
  if (!isQueuedDispatchResult(result, computerId, sessionId, promptId)) {
    throw Object.assign(new Error('The server returned no valid dispatch confirmation. Do not resend without checking the session.'), {
      uncertainDelivery: true,
    })
  }
  return result
}

const definiteDispatchRefusals: ReadonlySet<number> = new Set([409])

function isQueuedDispatchResult(
  result: unknown,
  computerId: string,
  sessionId: string,
  promptId: string,
): result is ManagedQueuedPromptDispatchResult {
  if (
    !result || typeof result !== 'object' ||
    !('promptId' in result) || result.promptId !== promptId ||
    !('outcome' in result) || typeof result.outcome !== 'string' ||
    !['sent', 'refused', 'uncertain'].includes(result.outcome) ||
    ('message' in result && typeof result.message !== 'string') ||
    (result.outcome === 'refused' && (!('restored' in result) || typeof result.restored !== 'boolean')) ||
    (result.outcome === 'uncertain' && (!('delivery' in result) ||
      (result.delivery !== 'accepted' && result.delivery !== 'unknown')))
  ) return false
  const attemptId = 'attemptId' in result ? result.attemptId : undefined
  if (attemptId === undefined) {
    if (result.outcome !== 'uncertain' || !('delivery' in result) || result.delivery !== 'unknown') {
      return false
    }
  } else if (typeof attemptId !== 'string' || !attemptId) {
    return false
  }
  if (!('session' in result) || result.session === undefined) return result.outcome !== 'sent'
  const session = result.session
  return Boolean(
    session && typeof session === 'object' &&
    'id' in session && session.id === sessionId &&
    'computerId' in session && session.computerId === computerId &&
    'computerName' in session && typeof session.computerName === 'string' &&
    'title' in session && typeof session.title === 'string' &&
    'cwd' in session && typeof session.cwd === 'string' &&
    'updatedAt' in session && typeof session.updatedAt === 'string' &&
    'isOpen' in session && typeof session.isOpen === 'boolean' &&
    'status' in session && typeof session.status === 'string' &&
    ['idle', 'running', 'waiting', 'error'].includes(session.status) &&
    'messages' in session && Array.isArray(session.messages),
  )
}

export async function updateQueuedPrompt(
  computerId: string,
  sessionId: string,
  promptId: string,
  content: string,
): Promise<ManagedRemovedQueuedPrompt> {
  return request<ManagedRemovedQueuedPrompt>(
    `${sessionPath(computerId, sessionId)}/queue/${encodeURIComponent(promptId)}`,
    { method: 'PATCH', body: JSON.stringify({ content }) },
  )
}

export async function reorderQueuedPrompts(
  computerId: string,
  sessionId: string,
  order: string[],
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/queue`,
    { method: 'PUT', body: JSON.stringify({ order }) },
  )
  return response.session
}

export async function getRuntimeOptions(
  computerId: string,
  sessionId: string,
): Promise<RuntimeOptions> {
  return request<RuntimeOptions>(
    `${sessionPath(computerId, sessionId)}/runtime`,
    { cache: 'no-store' },
  )
}

export async function configureRuntime(
  computerId: string,
  sessionId: string,
  input: ConfigureRuntimeInput,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/runtime`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )
  return response.session
}

export async function clearConversation(
  computerId: string,
  sessionId: string,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/clear`,
    {
      method: 'POST',
      body: '{}',
    },
  )
  return response.session
}

export async function recoverConversation(
  computerId: string,
  sessionId: string,
  reason: SessionRecoveryReason,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/recover`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    },
  )
  return response.session
}

export async function configureRetention(
  computerId: string,
  sessionId: string,
  input: import('../shared/contracts').SessionRetentionPatch,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/retention`,
    { method: 'PATCH', body: JSON.stringify(input) },
  )
  return response.session
}

export async function suspendSession(
  computerId: string,
  sessionId: string,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/suspend`,
    {
      method: 'POST',
      body: '{}',
    },
  )
  return response.session
}

export async function resumeSession(
  computerId: string,
  sessionId: string,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/resume`,
    {
      method: 'POST',
      body: '{}',
    },
  )
  return response.session
}

export async function restartSession(
  computerId: string,
  sessionId: string,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/restart`,
    {
      method: 'POST',
      body: '{}',
    },
  )
  return response.session
}

export async function moveSessionToTmux(
  computerId: string,
  sessionId: string,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/tmux`,
    {
      method: 'POST',
      body: '{}',
    },
  )
  return response.session
}

export async function sendMessage(
  computerId: string,
  sessionId: string,
  input: SendMessageInput,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
  return response.session
}

export async function transcribeAudio(file: File): Promise<AudioTranscription> {
  const body = new FormData()
  body.append('audio', file, file.name)
  return request<AudioTranscription>('/api/transcriptions', {
    method: 'POST',
    body,
  })
}

export interface OracleVoiceTicket {
  ticket: string
  expiresAt: string
}

export function getOracleVoiceCapabilities(): Promise<VoiceCapabilities> {
  return request<VoiceCapabilities>('/api/oracle-voice/capabilities', {
    cache: 'no-store',
  })
}

export function createOracleVoiceTicket(): Promise<OracleVoiceTicket> {
  return request<OracleVoiceTicket>('/api/oracle-voice/tickets', {
    method: 'POST',
    cache: 'no-store',
  })
}

export async function uploadSessionFile(
  computerId: string,
  sessionId: string,
  file: File,
): Promise<SessionFileUpload> {
  const body = new FormData()
  body.append('file', file, file.name)
  const response = await request<{ file: SessionFileUpload }>(
    `${sessionPath(computerId, sessionId)}/files`,
    {
      method: 'POST',
      body,
    },
  )
  return response.file
}

export async function executeCommand(
  computerId: string,
  sessionId: string,
  input: ExecuteCommandInput,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/commands`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
  return response.session
}

export async function cancelSession(
  computerId: string,
  sessionId: string,
): Promise<void> {
  await request<{ ok: true }>(`${sessionPath(computerId, sessionId)}/cancel`, {
    method: 'POST',
    body: '{}',
  })
}

/** Answers a question from the session's conversation without prompting it. */
export async function askSession(
  computerId: string,
  sessionId: string,
  question: string,
  earlier: readonly SideQuestionExchange[] = [],
): Promise<string> {
  const response = await request<SideQuestionAnswer>(
    `${sessionPath(computerId, sessionId)}/ask`,
    {
      method: 'POST',
      body: JSON.stringify({
        question,
        ...(earlier.length ? { earlier: [...earlier] } : {}),
      } satisfies SideQuestionInput),
    },
  )
  return response.answer
}

export async function listBackgroundTasks(
  computerId: string,
  sessionId: string,
): Promise<BackgroundTaskSnapshot> {
  return request<BackgroundTaskSnapshot>(
    `${sessionPath(computerId, sessionId)}/tasks`,
  )
}

export async function cancelBackgroundTask(
  computerId: string,
  sessionId: string,
  taskId: string,
): Promise<BackgroundTaskSnapshot> {
  return request<BackgroundTaskSnapshot>(
    `${sessionPath(computerId, sessionId)}/tasks/${encodeURIComponent(taskId)}/cancel`,
    {
      method: 'POST',
      body: '{}',
    },
  )
}

export async function deleteSession(
  computerId: string,
  sessionId: string,
): Promise<void> {
  await requestVoid(sessionPath(computerId, sessionId), { method: 'DELETE' })
}

/** Stops a session but keeps it to reopen; `deleteSession` deletes for good. */
export async function closeSession(
  computerId: string,
  sessionId: string,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/close`,
    { method: 'POST', body: '{}' },
  )
  return response.session
}

export async function replyPermission(
  computerId: string,
  sessionId: string,
  requestId: string,
  input: PermissionReplyInput,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/permissions/${encodeURIComponent(requestId)}`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
  return response.session
}

export async function replyUserInput(
  computerId: string,
  sessionId: string,
  requestId: string,
  input: UserInputReplyInput,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    `${sessionPath(computerId, sessionId)}/user-input/${encodeURIComponent(requestId)}`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
  return response.session
}

export async function getPushPublicKey(): Promise<string> {
  const response = await request<{ publicKey: string }>(
    '/api/push/public-key',
  )
  return response.publicKey
}

export async function savePushSubscription(
  subscription: PushSubscriptionJSON,
): Promise<void> {
  await request<{ ok: true }>('/api/push/subscriptions', {
    method: 'POST',
    body: JSON.stringify(subscription),
  })
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  await requestVoid('/api/push/subscriptions', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  })
}

export async function getPushSettings(): Promise<PushSettings> {
  return request<PushSettings>('/api/push/settings')
}

export async function setSessionNotificationsMuted(
  computerId: string,
  sessionId: string,
  muted: boolean,
): Promise<PushSettings> {
  return request<PushSettings>('/api/push/session-mute', {
    method: 'PUT',
    body: JSON.stringify({ computerId, sessionId, muted }),
  })
}

export async function sendTestPushNotification(): Promise<{ sent: number }> {
  return request<{ sent: number }>('/api/push/test', {
    method: 'POST',
    body: JSON.stringify({ confirm: true }),
  })
}

export function getManager(): Promise<ManagerSnapshot> {
  return request<ManagerSnapshot>('/api/manager')
}

export async function uploadManagerFile(file: File): Promise<ManagerAttachment> {
  const body = new FormData()
  body.append('file', file, file.name)
  const response = await request<{ file: ManagerAttachment }>('/api/manager/files', { method: 'POST', body })
  return response.file
}

export async function removeManagerFile(id: string): Promise<void> {
  const controller = new AbortController()
  let timedOut = false
  const timeout = globalThis.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, 15_000)
  try {
    await requestVoid(`/api/manager/files/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof HubSignInExpiredError) throw error
    if (timedOut) throw new Error('Removing the upload timed out. Try Remove again.')
    throw error
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

export async function sendManagerMessage(
  content: string,
  defaults?: ManagerClientDefaults,
  options: { answerOnly?: boolean; attachmentIds?: string[] } = {},
): Promise<ManagerMessage> {
  const response = await request<{ message: ManagerMessage }>('/api/manager/messages', {
    method: 'POST',
    body: JSON.stringify({
      content,
      ...(defaults ? { defaults } : {}),
      ...(options.answerOnly ? { answerOnly: true } : {}),
      ...(options.attachmentIds?.length ? { attachmentIds: options.attachmentIds } : {}),
    } satisfies SendManagerMessageInput),
  })
  return response.message
}

export async function removeQueuedManagerMessage(messageId: string): Promise<ManagerMessage> {
  const response = await request<{ message: ManagerMessage }>(
    `/api/manager/messages/${encodeURIComponent(messageId)}/remove`,
    { method: 'POST' },
  )
  return response.message
}

/** Rewrites a waiting Oracle message in place, keeping its place in the queue. */
export async function editQueuedManagerMessage(messageId: string, content: string): Promise<ManagerMessage> {
  const response = await request<{ message: ManagerMessage }>(
    `/api/manager/messages/${encodeURIComponent(messageId)}`,
    { method: 'PUT', body: JSON.stringify({ content }) },
  )
  return response.message
}

export async function updateManagerSettings(
  input: UpdateManagerSettingsInput,
): Promise<ManagerSettingsSnapshot> {
  const response = await request<{ settings: ManagerSettingsSnapshot }>('/api/manager/settings', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return response.settings
}

export async function retryManagerMessage(messageId: string): Promise<ManagerMessage> {
  const response = await request<{ message: ManagerMessage }>(
    `/api/manager/messages/${encodeURIComponent(messageId)}/retry`,
    { method: 'POST' },
  )
  return response.message
}

export async function resolveManagerConfirmation(
  messageId: string,
  accept: boolean,
): Promise<ManagerMessage> {
  const response = await request<{ message: ManagerMessage }>(
    `/api/manager/messages/${encodeURIComponent(messageId)}/confirmation`,
    { method: 'POST', body: JSON.stringify({ accept } satisfies ResolveManagerConfirmationInput) },
  )
  return response.message
}

export async function listScheduleProposals(): Promise<import('../shared/schedule-proposals').ScheduleProposal[]> {
  const response = await request<{ proposals: import('../shared/schedule-proposals').ScheduleProposal[] }>(
    '/api/schedules/proposals', { cache: 'no-store' },
  )
  return response.proposals
}

export async function getSchedule(id: string): Promise<import('../shared/schedules').Schedule> {
  const response = await request<{ schedule: import('../shared/schedules').Schedule }>(
    `/api/schedules/${encodeURIComponent(id)}`, { cache: 'no-store' },
  )
  return response.schedule
}

export async function resolveScheduleProposal(id: string, approve: boolean): Promise<import('../shared/schedule-proposals').ScheduleProposal> {
  const response = await request<{ proposal: import('../shared/schedule-proposals').ScheduleProposal }>(
    `/api/schedules/proposals/${encodeURIComponent(id)}/${approve ? 'approve' : 'reject'}`,
    { method: 'POST', body: '{}' },
  )
  return response.proposal
}

export function cancelManager(): Promise<void> {
  return requestVoid('/api/manager/cancel', { method: 'POST' })
}

export function resetManager(): Promise<ManagerSnapshot> {
  return request<ManagerSnapshot>('/api/manager/reset', { method: 'POST' })
}
