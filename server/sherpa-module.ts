/**
 * Shared by the native-inference worker children: Oracle Conversation's voice
 * worker and the Parakeet transcription worker. Only a forked child imports
 * the binding, so a native crash cannot stop the server.
 */
export function importSherpaModule(): Promise<unknown> {
  return import('sherpa-onnx-node')
}

/**
 * Finds an export on the module namespace or on its CommonJS default,
 * whichever the loader exposes it on.
 */
export function sherpaExport<T>(
  imported: unknown,
  name: string,
  accept: (value: unknown) => value is T,
): T | undefined {
  const named = propertyCarrier(imported)
  const defaults = propertyCarrier(named?.default)
  for (const candidate of [named?.[name], defaults?.[name]]) {
    if (accept(candidate)) return candidate
  }
  return undefined
}

function propertyCarrier(value: unknown): Record<string, unknown> | undefined {
  if ((typeof value !== 'object' || value === null) && typeof value !== 'function') {
    return undefined
  }
  return value as Record<string, unknown>
}
