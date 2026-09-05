export interface AppVersion {
  version: string
  buildId?: string
}

export function parseAppVersion(value: unknown): AppVersion {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('version' in value) ||
    typeof value.version !== 'string' ||
    !value.version.trim()
  ) {
    throw new Error('The server returned an invalid app version')
  }
  const version = value.version.trim()
  if (!('buildId' in value)) {
    return { version }
  }
  if (
    typeof value.buildId !== 'string' ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value.buildId)
  ) {
    throw new Error('The server returned an invalid app build identity')
  }
  return { version, buildId: value.buildId }
}
