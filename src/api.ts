import type {
  AddComputerInput,
  ComputerSummary,
  CreateSessionInput,
  ManagedSession,
  PermissionReplyInput,
  SendMessageInput,
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
  const response = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
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

export async function getSession(
  computerId: string,
  sessionId: string,
): Promise<ManagedSession> {
  const response = await request<{ session: ManagedSession }>(
    sessionPath(computerId, sessionId),
  )
  return response.session
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
