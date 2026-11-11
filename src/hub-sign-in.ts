/**
 * Whether the hub's sign-in gateway, such as Cloudflare Access, has started
 * turning this browser away because its session lapsed.
 *
 * Asked for a page, Access redirects to its login on another origin, which
 * `fetch` cannot follow and can only report as "Failed to fetch". Marked as an
 * app request, it answers 401 with `www-authenticate` instead. The hub API
 * never redirects and never sends `www-authenticate`, so either one means the
 * gateway refused the request before the hub saw it.
 */

export const HUB_SIGN_IN_EXPIRED_MESSAGE =
  'Your sign-in has expired; sign in again to reconnect'

export class HubSignInExpiredError extends Error {
  // The gateway refused the request before the hub saw it.
  readonly uncertainDelivery = false

  constructor() {
    super(HUB_SIGN_IN_EXPIRED_MESSAGE)
    this.name = 'HubSignInExpiredError'
  }
}

let expired = false
// Requests are numbered as they are sent, and the gateway judged each one as it
// arrived. An answer to an older request than the newest heard from says
// nothing new about the sign-in, whichever arrives first.
let sent = 0
let newestHeard = 0
const listeners = new Set<() => void>()

export function hubSignInExpired(): boolean {
  return expired
}

export function setHubSignInExpired(next: boolean): void {
  if (expired === next) return
  expired = next
  for (const listener of [...listeners]) listener()
}

export function subscribeHubSignIn(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function gatewayRefused(response: Response): boolean {
  return response.type === 'opaqueredirect' ||
    (response.status === 401 && response.headers.has('www-authenticate'))
}

/**
 * `fetch` for hub API requests. Any answer the gateway let through, even a
 * hub failure, shows the sign-in is valid; a network failure shows nothing.
 */
export async function hubFetch(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set('x-requested-with', 'XMLHttpRequest')
  const request = ++sent
  const response = await fetch(input, { ...init, headers, redirect: 'manual' })
  const newest = request > newestHeard
  if (newest) newestHeard = request
  if (gatewayRefused(response)) {
    if (newest) setHubSignInExpired(true)
    throw new HubSignInExpiredError()
  }
  if (newest) setHubSignInExpired(false)
  return response
}
