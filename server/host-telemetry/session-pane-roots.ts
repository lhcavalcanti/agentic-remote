import { execFile } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { setImmediate as yieldToEventLoop } from 'node:timers/promises'
import { promisify } from 'node:util'
import { parseProcessStat } from './process-proc.js'

const execFileAsync = promisify(execFile)
const MAX_ANCESTRY_READS = 4096
const ANCESTRY_YIELD_INTERVAL = 32

export interface SessionPaneRoot {
  sessionId: string
  panePid: number
  paneStartTime?: number
}

interface BoundPaneRoot extends SessionPaneRoot {
  target: string
  ownerPid: number
  ownerStartTime: number
}

/** Observations come only from the terminal controller's existing owner checks. */
export class SessionPaneRoots {
  private readonly roots = new Map<string, BoundPaneRoot>()

  constructor(
    private readonly readStat = async (pid: number) => readFileSync(`/proc/${pid}/stat`, 'utf8'),
    private readonly listPanes = async () => (await execFileAsync('tmux', [
      'list-panes', '-a', '-F', '#{pane_id}\t#{pane_pid}',
    ], { timeout: 2_000, maxBuffer: 1024 * 1024 })).stdout,
    private readonly yieldTraversal: () => Promise<void> = () => yieldToEventLoop(),
  ) {}

  async observe(sessionId: string, pane: { target: string; rootPid: number }, ownerPid: number, ownerStartTime: number | undefined): Promise<void> {
    if (ownerStartTime === undefined) return
    const previous = this.roots.get(sessionId)
    if (previous?.target === pane.target && previous.panePid === pane.rootPid &&
        previous.ownerPid === ownerPid && previous.ownerStartTime === ownerStartTime) return
    try {
      const observed = parseProcessStat(await this.readStat(pane.rootPid))
      const owner = ownerPid === pane.rootPid ? observed : parseProcessStat(await this.readStat(ownerPid))
      if (observed?.pid !== pane.rootPid || owner?.pid !== ownerPid || owner.startTime !== ownerStartTime) return
      this.roots.set(sessionId, {
        sessionId, target: pane.target, panePid: pane.rootPid, paneStartTime: observed.startTime,
        ownerPid, ownerStartTime,
      })
    } catch {
      // Telemetry must not change whether a terminal operation succeeds.
    }
  }

  forget(sessionId: string): void {
    this.roots.delete(sessionId)
  }

  async listSessionPaneRoots(): Promise<SessionPaneRoot[]> {
    if (!this.roots.size) return []
    try {
      const panes = new Map((await this.listPanes()).trim().split('\n').map((line) => {
        const [target, pid] = line.split('\t')
        return [target, Number(pid)]
      }))
      const roots: SessionPaneRoot[] = []
      let reads = 0
      const readStat = async (pid: number) => {
        reads += 1
        try {
          return parseProcessStat(await this.readStat(pid))
        } finally {
          if (reads % ANCESTRY_YIELD_INTERVAL === 0) await this.yieldTraversal()
        }
      }
      for (const root of this.roots.values()) {
        if (reads >= MAX_ANCESTRY_READS) break
        if (panes.get(root.target) !== root.panePid) continue
        try {
          const owner = await readStat(root.ownerPid)
          if (owner?.pid !== root.ownerPid || owner.startTime !== root.ownerStartTime) continue
          let current = owner
          const visited = new Set<number>()
          while (current.pid !== root.panePid && !visited.has(current.pid) && reads < MAX_ANCESTRY_READS) {
            visited.add(current.pid)
            const parent = await readStat(current.ppid)
            if (!parent || parent.pid !== current.ppid || parent.startTime > current.startTime) break
            current = parent
          }
          if (current.pid !== root.panePid || current.startTime !== root.paneStartTime) continue
          const { sessionId, panePid, paneStartTime } = root
          roots.push({ sessionId, panePid, paneStartTime })
        } catch {
          // A surviving shell pane no longer belongs to a session whose owner exited.
        }
      }
      return roots
    } catch {
      return []
    }
  }
}
