import type {
  CreateSessionInput,
  PermissionReplyInput,
  SendMessageInput,
  SessionDetail,
} from '../shared/contracts'

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
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null
    throw new Error(payload?.error || `Request failed (${response.status})`)
  }
  return response.json() as Promise<TResult>
}

export async function listSessions(): Promise<SessionDetail[]> {
  const response = await request<{ sessions: SessionDetail[] }>('/api/sessions')
  return response.sessions
}

export async function createSession(
  input: CreateSessionInput,
): Promise<SessionDetail> {
  const response = await request<{ session: SessionDetail }>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return response.session
}

export async function sendMessage(
  sessionId: string,
  input: SendMessageInput,
): Promise<SessionDetail> {
  const response = await request<{ session: SessionDetail }>(
    `/api/sessions/${encodeURIComponent(sessionId)}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
  return response.session
}

export async function cancelSession(sessionId: string): Promise<void> {
  await request<{ ok: true }>(
    `/api/sessions/${encodeURIComponent(sessionId)}/cancel`,
    { method: 'POST', body: '{}' },
  )
}

export async function replyPermission(
  sessionId: string,
  requestId: string,
  input: PermissionReplyInput,
): Promise<SessionDetail> {
  const response = await request<{ session: SessionDetail }>(
    `/api/sessions/${encodeURIComponent(sessionId)}/permissions/${encodeURIComponent(requestId)}`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
  return response.session
}
