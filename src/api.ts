import type {
  AddComputerInput,
  ComputerSummary,
  ConfigureRuntimeInput,
  CreateSessionInput,
  DirectoryListing,
  ExecuteCommandInput,
  ManagedSession,
  PushSettings,
  ManagedRemovedQueuedPrompt,
  PermissionReplyInput,
  RenameSessionInput,
  RuntimeOptions,
  SendMessageInput,
  SlashCommand,
  UserInputReplyInput,
} from '../shared/contracts'

async function responseError(response: Response): Promise<Error> {
  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null
  return new Error(payload?.error || `Request failed (${response.status})`)
}

async function request<TResult>(
  path: string,
  init?: RequestInit,
): Promise<TResult> {
  const headers = new Headers(init?.headers)
  if (init?.body != null && !headers.has('content-type')) {
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

export async function listSessions(): Promise<ManagedSession[]> {
  const response = await request<{ sessions: ManagedSession[] }>('/api/sessions')
  return response.sessions
}

export async function listHistory(): Promise<ManagedSession[]> {
  const response = await request<{ sessions: ManagedSession[] }>('/api/history')
  return response.sessions
}

export async function listDirectories(
  computerId: string,
  path = '~',
): Promise<DirectoryListing> {
  return request<DirectoryListing>(
    `/api/computers/${encodeURIComponent(computerId)}/directories?path=${encodeURIComponent(path)}`,
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
): Promise<ManagedRemovedQueuedPrompt> {
  return request<ManagedRemovedQueuedPrompt>(
    `${sessionPath(computerId, sessionId)}/queue/${encodeURIComponent(promptId)}`,
    { method: 'DELETE' },
  )
}

export async function getRuntimeOptions(
  computerId: string,
  sessionId: string,
): Promise<RuntimeOptions> {
  return request<RuntimeOptions>(
    `${sessionPath(computerId, sessionId)}/runtime`,
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
