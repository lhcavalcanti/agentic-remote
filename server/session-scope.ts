import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

// tmux built with systemd support starts every pane in a transient systemd
// scope, and systemd stops a scope -- every process in it -- once the kernel
// kills any one of them for memory. A Copilot session therefore ended
// whenever a build or test run it had started was killed that way. A scope's
// OOM policy cannot be changed after it exists, so Copilot is started in a new
// scope of its own that carries on, and only the tool that was killed fails.
// systemd-run execs the command in place, so the pane's own process is still
// Copilot itself.
const SESSION_SCOPE = [
  'systemd-run', '--user', '--scope', '--quiet', '--collect', '-p', 'OOMPolicy=continue', '--',
]
const PROBE_TIMEOUT_MS = 5_000

type ProbeRun = (file: string, args: string[], options: { timeout: number }) => Promise<unknown>

/** Whether `command` is still the scope's own launcher rather than what it runs. */
export function isSessionScopeLauncher(command: readonly string[]): boolean {
  return SESSION_SCOPE.every((argument, index) => command[index] === argument)
}

/**
 * What tmux is asked to run to start `command` as a session's Copilot: in a
 * scope of its own wherever this host can create one, unless
 * `AGENTIC_REMOTE_SESSION_SCOPE` turns that off. A command read back from a
 * process that is still becoming Copilot is never wrapped twice.
 */
export async function sessionLaunchCommand(
  command: readonly string[],
  available: () => Promise<boolean> = sessionScopeAvailable,
  environment: NodeJS.ProcessEnv = process.env,
): Promise<string[]> {
  const bare = isSessionScopeLauncher(command)
    ? command.slice(SESSION_SCOPE.length)
    : [...command]
  const disabled = ['off', 'false', '0', 'no', 'disabled'].includes(
    environment.AGENTIC_REMOTE_SESSION_SCOPE?.trim().toLowerCase() ?? '',
  )
  return !disabled && (await available()) ? [...SESSION_SCOPE, ...bare] : bare
}

/**
 * Whether this host can start a session in a scope of its own, asked once by
 * starting a throwaway scope exactly as a session's is started. macOS, and
 * WSL, Linux, or containers without a user systemd manager cannot; their
 * sessions start Copilot directly.
 */
export function sessionScopeProbe(
  run: ProbeRun = (file, args, options) => execFileAsync(file, args, options),
  platform: NodeJS.Platform = process.platform,
): () => Promise<boolean> {
  let available: Promise<boolean> | undefined
  return () => {
    available ??= platform === 'linux'
      ? run(SESSION_SCOPE[0], [...SESSION_SCOPE.slice(1), 'true'], {
          timeout: PROBE_TIMEOUT_MS,
        }).then(() => true, () => false)
      : Promise.resolve(false)
    return available
  }
}

export const sessionScopeAvailable = sessionScopeProbe()
