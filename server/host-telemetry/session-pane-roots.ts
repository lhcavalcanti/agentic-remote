import { execFile } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { promisify } from 'node:util'
import { parseProcessStat } from './process-proc.js'

const execFileAsync = promisify(execFile)

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
  ) {}

  async observe(sessionId: string, pane: { target: string; rootPid: number }, ownerPid = pane.rootPid): Promise<void> {
    const previous = this.roots.get(sessionId)
    if (previous?.target === pane.target && previous.panePid === pane.rootPid && previous.ownerPid === ownerPid) return
    try {
      const observed = parseProcessStat(await this.readStat(pane.rootPid))
      const owner = ownerPid === pane.rootPid ? observed : parseProcessStat(await this.readStat(ownerPid))
      if (observed?.pid !== pane.rootPid || owner?.pid !== ownerPid) return
      this.roots.set(sessionId, {
        sessionId, target: pane.target, panePid: pane.rootPid, paneStartTime: observed.startTime,
        ownerPid, ownerStartTime: owner.startTime,
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
      for (const root of this.roots.values()) {
        if (panes.get(root.target) !== root.panePid) continue
        try {
          const owner = parseProcessStat(await this.readStat(root.ownerPid))
          if (owner?.pid !== root.ownerPid || owner.startTime !== root.ownerStartTime) continue
          let current = owner
          const visited = new Set<number>()
          while (current.pid !== root.panePid && !visited.has(current.pid) && visited.size < 4096) {
            visited.add(current.pid)
            const parent = parseProcessStat(await this.readStat(current.ppid))
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
