import { execFile } from 'node:child_process'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export interface CliCanaryState {
  /** The last Copilot CLI version a probe passed on. */
  verifiedVersion?: string
  /** The version the last probe failed on, when, and why. */
  failedVersion?: string
  failedAt?: string
  failure?: string
}

export interface CliCanaryDependencies {
  /** Whether this computer can start terminal sessions at all. */
  available?(): Promise<boolean>
  readVersion(): Promise<string | undefined>
  /** Rejects, saying what went wrong, when a new session cannot be driven. */
  probe(): Promise<void>
  readState(): Promise<CliCanaryState>
  writeState(state: CliCanaryState): Promise<void>
  alert(message: string): void
  now?(): number
}

export type CliCanaryResult = 'unknown' | 'unchanged' | 'passed' | 'failed'

// A failure is looked at again a day later, in case the app was fixed rather
// than the CLI, and reported again if it still fails.
const RETRY_FAILED_MS = 24 * 60 * 60_000
const PROBE_ATTEMPTS = 2

/**
 * Notices when Copilot CLI updates itself and, once per version, starts a
 * disposable tmux session to check that the app can still drive one. Copilot
 * updates in the background, and a release that redraws its prompt used to be
 * found only when someone's new session failed to start.
 */
export class CliCanary {
  private running?: Promise<CliCanaryResult>
  private timers: NodeJS.Timeout[] = []

  constructor(private readonly dependencies: CliCanaryDependencies) {}

  check(): Promise<CliCanaryResult> {
    this.running ??= this.run().finally(() => {
      this.running = undefined
    })
    return this.running
  }

  start(firstDelayMs = 2 * 60_000, intervalMs = 30 * 60_000): void {
    this.stop()
    const tick = () => {
      void this.check().catch((error: unknown) => {
        console.warn('Unable to check the Copilot CLI version:', error)
      })
    }
    const first = setTimeout(tick, firstDelayMs)
    const repeat = setInterval(tick, intervalMs)
    first.unref()
    repeat.unref()
    this.timers = [first, repeat]
  }

  stop(): void {
    for (const timer of this.timers) clearTimeout(timer)
    this.timers = []
  }

  private async run(): Promise<CliCanaryResult> {
    if (this.dependencies.available && !(await this.dependencies.available())) {
      return 'unknown'
    }
    const version = await this.dependencies.readVersion()
    if (!version) return 'unknown'
    const state = await this.dependencies.readState()
    const now = this.dependencies.now?.() ?? Date.now()
    if (version === state.verifiedVersion) return 'unchanged'
    if (
      version === state.failedVersion &&
      now - Date.parse(state.failedAt ?? '') < RETRY_FAILED_MS
    ) {
      return 'unchanged'
    }
    let failure: unknown
    // A machine too busy to start Copilot in time once is not a broken
    // update, so the probe gets a second chance before anyone is told.
    for (let attempt = 0; attempt < PROBE_ATTEMPTS; attempt += 1) {
      try {
        await this.dependencies.probe()
        await this.dependencies.writeState({ verifiedVersion: version })
        return 'passed'
      } catch (error) {
        failure = error
      }
    }
    const reason = failure instanceof Error ? failure.message : String(failure)
    console.error(`Copilot CLI ${version} failed the terminal startup check:`, failure)
    await this.dependencies.writeState({
      ...(state.verifiedVersion ? { verifiedVersion: state.verifiedVersion } : {}),
      failedVersion: version,
      failedAt: new Date(now).toISOString(),
      failure: reason,
    })
    this.dependencies.alert(
      `Copilot CLI ${version} did not start in a way Agentic Remote can use, so new terminal sessions may fail: ${reason.split('\n')[0]}`,
    )
    return 'failed'
  }
}

/** The version `copilot --version` reports, or nothing when it cannot be run. */
export async function readCopilotVersion(
  bin: string,
): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync(bin, ['--version'], { timeout: 15_000 })
    return /\b(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/u.exec(stdout)?.[1]
  } catch {
    return undefined
  }
}

export function cliCanaryStateFile(file: string): {
  read(): Promise<CliCanaryState>
  write(state: CliCanaryState): Promise<void>
} {
  return {
    async read() {
      try {
        const parsed: unknown = JSON.parse(await readFile(file, 'utf8'))
        return parsed && typeof parsed === 'object' ? parsed as CliCanaryState : {}
      } catch (error) {
        // Missing or unreadable state only means the next version is probed.
        if (error instanceof SyntaxError) return {}
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}
        throw error
      }
    },
    async write(state) {
      await mkdir(path.dirname(file), { recursive: true })
      const temporary = `${file}.${process.pid}.tmp`
      await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`)
      await rename(temporary, file)
    },
  }
}

export function createCliCanary(options: {
  dataDirectory: string
  copilotBin: string
  probe(cwd: string): Promise<void>
  alert(message: string): void
}): CliCanary {
  // An empty folder of its own, so the probe reads no project's instructions.
  const workspace = path.join(options.dataDirectory, 'cli-canary')
  const state = cliCanaryStateFile(path.join(options.dataDirectory, 'cli-canary.json'))
  return new CliCanary({
    available: () => execFileAsync('tmux', ['-V'], { timeout: 15_000 }).then(() => true, () => false),
    readVersion: () => readCopilotVersion(options.copilotBin),
    probe: async () => {
      await mkdir(workspace, { recursive: true })
      await options.probe(workspace)
    },
    readState: state.read,
    writeState: state.write,
    alert: options.alert,
  })
}
