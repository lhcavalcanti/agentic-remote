import type {
  AddComputerInput,
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
  ProviderRuntimeOptions,
  ManagedRemovedQueuedPrompt,
  ManagedQueuedPromptDispatchResult,
  PermissionReplyInput,
  RenameSessionInput,
  RuntimeOptions,
  SendMessageInput,
  SessionFileUpload,
  SlashCommand,
  UserInputReplyInput,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
} from '../shared/contracts'

async function responseError(response: Response): Promise<Error> {
  const payload = (await response.json().catch(() => null)) as
    | { error?: string; message?: string; statusCode?: number }
    | null
  const fallback = `Request failed (${response.status})`
  if (!payload) {
    return new Error(fallback)
  }
  // Fastify's built-in envelope carries a numeric `statusCode`, a generic
  // `error` label, and the real reason in `message`; the app's own handler
  // sends only `{ error }`. Do not key off `statusText`, which is empty over
  // HTTP/2. A 5xx `message` is the raw exception and must not reach the UI.
  const isDefaultEnvelope =
    typeof payload.statusCode === 'number' &&
    typeof payload.message === 'string'
  if (isDefaultEnvelope && response.status < 500) {
    return new Error(payload.message || payload.error || fallback)
  }
  return new Error(payload.error || fallback)
}

async function request<TResult>(
  path: string,
  init?: RequestInit,
): Promise<TResult> {
  const headers = new Headers(init?.headers)
  if (
    init?.body != null &&
    !(init.body instanceof FormData) &&
    !headers.has('content-type')
  ) {
    headers.set('content-type', 'application/json')
  }
  const response = await fetch(path, {
    ...init,
    headers,
  })
  if (!response.ok) {
    throw await responseError(response)
  }
  return response.json() as Promise<TResult>
}

async function requestVoid(path: string, init: RequestInit): Promise<void> {
  const response = await fetch(path, init)
  if (!response.ok) {
    throw await responseError(response)
  }
}

function sessionPath(computerId: string, sessionId?: string): string {
  const base = `/api/computers/${encodeURIComponent(computerId)}/sessions`
  return sessionId ? `${base}/${encodeURIComponent(sessionId)}` : base
}

export async function listComputers(): Promise<ComputerSummary[]> {
  const response = await request<{ computers: ComputerSummary[] }>(
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
  const response = await request<{
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

export async function listKnowledgeEntries(
  rootId: string,
  path = '.',
): Promise<WorkspaceListing> {
  return request<WorkspaceListing>(
    `/api/knowledge/roots/${encodeURIComponent(rootId)}/entries?path=${encodeURIComponent(path)}`,
  )
}

export async function readKnowledgeFile(
  rootId: string,
  path: string,
): Promise<WorkspaceFile> {
  return request<WorkspaceFile>(
    `/api/knowledge/roots/${encodeURIComponent(rootId)}/file?path=${encodeURIComponent(path)}`,
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
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    sessionPath(computerId, sessionId),
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
    response = await fetch(
      `${sessionPath(computerId, sessionId)}/queue/${encodeURIComponent(promptId)}/dispatch`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content }),
        signal: AbortSignal.timeout(35_000),
      },
    )
  } catch {
    throw Object.assign(new Error(
      'Dispatch could not be confirmed. Your rewrite is still here; check the queue and provider before trying again.',
    ), { uncertainDelivery: true })
  }
  if (!response.ok) {
    throw Object.assign(await responseError(response), {
      // Only explicit request/admission refusals release the pending identity.
      uncertainDelivery: ![400, 401, 403, 404, 405, 409, 410, 413, 415, 422, 429].includes(response.status),
    })
  }
  const result: unknown = await response.json().catch(() => null)
  if (!isQueuedDispatchResult(result, computerId, sessionId, promptId)) {
    throw Object.assign(new Error('The server returned no valid dispatch confirmation. Do not resend without checking the session.'), {
      uncertainDelivery: true,
    })
  }
  return result
}

function isQueuedDispatchResult(
  result: unknown,
  computerId: string,
  sessionId: string,
  promptId: string,
): result is ManagedQueuedPromptDispatchResult {
  if (
    !result || typeof result !== 'object' ||
    !('promptId' in result) || result.promptId !== promptId ||
    !('attemptId' in result) || typeof result.attemptId !== 'string' || !result.attemptId ||
    !('outcome' in result) || typeof result.outcome !== 'string' ||
    !['sent', 'refused', 'uncertain'].includes(result.outcome) ||
    ('message' in result && typeof result.message !== 'string') ||
    (result.outcome === 'refused' && (!('restored' in result) || typeof result.restored !== 'boolean')) ||
    (result.outcome === 'uncertain' && (!('delivery' in result) ||
      (result.delivery !== 'accepted' && result.delivery !== 'unknown')))
  ) return false
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
