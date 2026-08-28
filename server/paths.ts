import path from 'node:path'

export function resolveDataDirectory(): string {
  return (
    process.env.AGENTIC_REMOTE_DATA_DIR?.trim() ||
    path.join(process.env.HOME || process.cwd(), '.agentic-remote')
  )
}
