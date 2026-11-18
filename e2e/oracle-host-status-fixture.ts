import type { ManagerSnapshot } from '../shared/manager'
import { oracleHostStatus } from '../server/host-telemetry/oracle-status'
import {
  FIXTURE_NOW,
  fixtureComputers,
  fixtureHostProcesses,
  fixtureHostSnapshot,
} from './workspace-fixtures'

/** Fictional pressure, formatted through the real read tool without accessing a host. */
export async function oracleHostStatusFixture(): Promise<{
  manager: ManagerSnapshot
  toolResult: string
}> {
  const snapshot = structuredClone(fixtureHostSnapshot)
  const inventory = structuredClone(fixtureHostProcesses)
  const total = snapshot.info!.totalMemoryBytes
  snapshot.info!.isWsl = true
  snapshot.info!.wslDistro = 'Ubuntu'
  Object.assign(snapshot.latest!, {
    cpuPercent: 96, memoryUsedBytes: total * 0.94, memoryAvailableBytes: total * 0.06,
    load1: 18.4, load5: 14.2, load15: 9.6,
  })
  snapshot.disk!.freeBytes = snapshot.disk!.totalBytes * 0.03
  inventory.rows.forEach((row) => {
    row.cpuPercent = row.owner === 'session' ? 212 : row.owner === 'shared-runtime' ? 178 : 6
  })
  const toolResult = await oracleHostStatus([fixtureComputers[0]], async () => ({
    snapshot: () => snapshot,
    processes: async () => inventory,
    history: () => [],
    subscribe: () => () => {},
  }), () => Date.parse(FIXTURE_NOW))
  const lines = toolResult.split('\n')
  const metrics = lines.filter((line) => /^(WSL|CPU |Data mount|Load )/.test(line))
  const processes = lines.filter((line) => line.startsWith('- ')).slice(0, 2)
  return {
    toolResult,
    manager: {
      available: true, status: 'idle', queued: 0, managedSessions: [],
      messages: [
        {
          id: 'fixture-host-question', role: 'user', content: 'Why is the hub slow?',
          createdAt: FIXTURE_NOW, state: 'done', answerOnly: true,
        },
        {
          id: 'fixture-host-read', role: 'activity', tool: 'get_host_status',
          content: 'Read host status on Studio.', replyTo: 'fixture-host-question', createdAt: FIXTURE_NOW,
        },
        {
          id: 'fixture-host-answer', role: 'assistant', replyTo: 'fixture-host-question', createdAt: FIXTURE_NOW,
          content: [
            '**Studio is under resource pressure.** The hub is at 96% CPU and 94% memory usage, with only 3% disk free.',
            metrics.join('\n\n'),
            '**Top CPU consumers** (one core = 100%):\n' + processes.join('\n'),
            'This snapshot does not prove which task caused the pressure. I have not changed anything.',
          ].join('\n\n'),
        },
      ],
    },
  }
}
