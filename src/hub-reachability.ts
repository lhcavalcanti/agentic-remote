/**
 * Whether a request never got an answer from the hub: the browser could not
 * reach it ("Failed to fetch" and its equivalents), or a snapshot timed out.
 * Errors the hub or its gateway returned are not unreachability.
 */
export function isHubUnreachable(error: unknown): boolean {
  return error instanceof TypeError ||
    (error instanceof Error && Reflect.get(error, 'hubUnreachable') === true)
}

/** Marks an error raised because the hub gave no answer in time. */
export function hubUnreachable(error: Error): Error {
  return Object.assign(error, { hubUnreachable: true })
}
