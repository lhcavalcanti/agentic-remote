import type { HubEvent } from '../../shared/contracts'

export type FeatureEvent = HubEvent | { type: 'hub.connected' }
const listeners = new Set<(event: FeatureEvent) => void>()
export function publishFeatureEvent(event: FeatureEvent): void {
  for (const listener of listeners) listener(event)
}
export function subscribeFeatureEvents(listener: (event: FeatureEvent) => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
