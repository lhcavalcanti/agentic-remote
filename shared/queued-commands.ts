const appOnlyNames = new Set(['cwd', 'statusline', 'footer', 'clear', 'restart'])

export function isAppOnlyQueuedCommand(content: string): boolean {
  return content.startsWith('/') &&
    appOnlyNames.has(content.slice(1).split(/\s+/, 1)[0].toLowerCase())
}
