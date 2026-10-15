import type { ManagerSessionRef } from '../shared/manager'

/** A `?computer=…&session=…` link to a session, as the manager writes them. */
export function sessionLinkTarget(href: string | undefined): ManagerSessionRef | undefined {
  if (!href) return undefined
  let url: URL
  try {
    url = new URL(href, window.location.href)
  } catch {
    return undefined
  }
  if (url.origin !== window.location.origin) return undefined
  const computerId = url.searchParams.get('computer')
  const sessionId = url.searchParams.get('session')
  return computerId && sessionId ? { computerId, sessionId } : undefined
}
