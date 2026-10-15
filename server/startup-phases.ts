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

function errorType(error: unknown): string {
  if (!(error instanceof Error)) return typeof error
  return error.name !== 'Error' ? error.name : error.constructor?.name || error.name
}

function errorCode(error: unknown): string | undefined {
  const code = typeof error === 'object' && error !== null ? Reflect.get(error, 'code') : undefined
  return typeof code === 'string' && /^[A-Za-z0-9_.-]{1,64}$/.test(code) ? code : undefined
}

export function createStartupPhases({
  now = () => performance.now(),
  write = (line: string) => console.log(line),
}: {
  now?: () => number
  write?: (line: string) => void
} = {}): StartupPhases {
  const emit = (record: StartupPhaseRecord) => {
    try {
      write(JSON.stringify(record))
    } catch {
      // Diagnostics must never change startup.
    }
  }
  return {
    run<T>(phase: string, work: () => Promise<T>): Promise<T> {
      const began = now()
      emit({ startupPhase: phase, event: 'begin', elapsedMs: Math.round(began) })
      const finish = (event: 'complete' | 'fail', error?: unknown) => {
        const ended = now()
        const code = event === 'fail' ? errorCode(error) : undefined
        emit({
          startupPhase: phase,
          event,
          elapsedMs: Math.round(ended),
          durationMs: Math.round(ended - began),
          ...(event === 'fail' ? { error: errorType(error) } : {}),
          ...(code ? { code } : {}),
        })
      }
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
