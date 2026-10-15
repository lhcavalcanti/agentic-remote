import { performance } from 'node:perf_hooks'

export type StartupPhaseEvent = 'begin' | 'complete' | 'fail'

/**
 * One startup diagnostic line. `elapsedMs` is monotonic time since the process
 * started, so a process killed mid-phase still leaves that phase's `begin`
 * record as the last one. Records carry phase labels and error types only,
 * never session content, paths, or credentials.
 */
export interface StartupPhaseRecord {
  startupPhase: string
  event: StartupPhaseEvent
  elapsedMs: number
  durationMs?: number
  error?: string
  code?: string
}

export interface StartupPhases {
  run<T>(phase: string, work: () => Promise<T>): Promise<T>
}

/** Runs each phase unchanged and records nothing. */
export const silentStartupPhases: StartupPhases = {
  run: (_phase, work) => work(),
}

const errorTypePattern = /^[A-Za-z_$][\w$]{0,63}$/
const errorCodePattern = /^[A-Z][A-Z0-9_]{1,63}$/

/**
 * Names a failure by its class and constant-style code only. `Error.name` and
 * other fields are data that can carry paths or credentials, so they are never
 * read for the record.
 */
function failure(error: unknown): Pick<StartupPhaseRecord, 'error' | 'code'> {
  try {
    if (typeof error !== 'object' || error === null) return { error: typeof error }
    const type: unknown = Object.getPrototypeOf(error)?.constructor?.name
    const code: unknown = Reflect.get(error, 'code')
    return {
      error: typeof type === 'string' && errorTypePattern.test(type) ? type : 'unknown',
      ...(typeof code === 'string' && errorCodePattern.test(code) ? { code } : {}),
    }
  } catch {
    return { error: 'unknown' }
  }
}

/** Diagnostics must never change startup, whatever the clock or sink does. */
function quietly(record: () => void): void {
  try {
    record()
  } catch {
    // Ignored: the phase result is what startup depends on.
  }
}

export function createStartupPhases({
  now = () => performance.now(),
  write = (line: string) => console.log(line),
}: {
  now?: () => number
  write?: (line: string) => void
} = {}): StartupPhases {
  const emit = (record: StartupPhaseRecord) => write(JSON.stringify(record))
  return {
    run<T>(phase: string, work: () => Promise<T>): Promise<T> {
      let began: number | undefined
      quietly(() => {
        began = now()
        emit({ startupPhase: phase, event: 'begin', elapsedMs: Math.round(began) })
      })
      const finish = (event: 'complete' | 'fail', error?: unknown) => quietly(() => {
        const ended = now()
        emit({
          startupPhase: phase,
          event,
          elapsedMs: Math.round(ended),
          ...(began === undefined ? {} : { durationMs: Math.round(ended - began) }),
          ...(event === 'fail' ? failure(error) : {}),
        })
      })
      let running: Promise<T>
      try {
        running = work()
      } catch (error) {
        finish('fail', error)
        return Promise.reject(error)
      }
      return running.then(
        (value) => {
          finish('complete')
          return value
        },
        (error: unknown) => {
          finish('fail', error)
          throw error
        },
      )
    },
  }
}

/**
 * The managed entrypoint's critical path: the service starts, then the server
 * listens. Listening never begins before the service has started.
 */
export async function startManagedServer(
  app: { listen(address: { host: string; port: number }): Promise<unknown> },
  service: { start(phases?: StartupPhases): Promise<void> },
  address: { host: string; port: number },
  phases: StartupPhases,
): Promise<void> {
  await phases.run('service.start', () => service.start(phases))
  await phases.run('fastify.listen', () => app.listen(address))
}
