import type { DreamerPlanItem, DreamerSnapshot } from '../shared/dreamer'

export class DreamerApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'DreamerApiError'
  }
}

export interface DreamerSettingsEdit {
  revision: number
  enabled: boolean
  timeZone: string
}

export interface DreamerPlanEdit {
  revision: number
  planId: string
  order?: string[]
  item?: { id: string; status: DreamerPlanItem['status'] }
  completion?: {
    itemId: string
    computerId: string
    sessionId: string
    sessionRevision: number
    messageId: string
    resultDigest: string
  }
}

async function request(path: string, input?: DreamerSettingsEdit | DreamerPlanEdit): Promise<DreamerSnapshot> {
  const response = await fetch(`/api/manager/dreamer${path}`, {
    cache: 'no-store',
    ...(input ? {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    } : {}),
  })
  if (!response.ok) {
    throw new DreamerApiError(
      response.status === 409
        ? 'Dreamer changed elsewhere. Refresh and review before saving again.'
        : response.status === 400
          ? 'Dreamer input was refused. Check the timezone and try again.'
          : 'Dreamer is unavailable. Try refreshing later.',
      response.status,
    )
  }
  const snapshot: DreamerSnapshot = await response.json()
  if (
    !snapshot || typeof snapshot.available !== 'boolean' ||
    !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0 ||
    typeof snapshot.settings?.enabled !== 'boolean' ||
    typeof snapshot.settings.timeZone !== 'string'
  ) {
    throw new DreamerApiError('This hub returned an unreadable Dreamer response.', 502)
  }
  return snapshot
}

export const getDreamer = () => request('')
export const saveDreamerSettings = (input: DreamerSettingsEdit) => request('/settings', input)
export const updateDreamerPlan = (input: DreamerPlanEdit) => request('/plan', input)
