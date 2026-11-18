import type { ComputerSummary } from '../../shared/contracts.js'
import type { NotificationCenterService } from '../notification-center-service.js'
import type { HostTelemetryTarget } from './service.js'

export const HOST_ALERT_POLL_INTERVAL_MS = 15_000

/** Hub-only, constructed only with both flags enabled; never adds live viewers or scans. */
export class HostAlertMonitor {
  private running = false
  private timer?: ReturnType<typeof setTimeout>
  private work: Promise<void> = Promise.resolve()

  constructor(private readonly options: {
    computers: () => ComputerSummary[]
    resolve: (computerId: string) => Promise<HostTelemetryTarget>
    notifications: Pick<NotificationCenterService, 'host'>
    warn: () => void
  }) {}

  start(): void {
    if (this.running) return
    this.running = true
    this.poll()
  }

  async stop(): Promise<void> {
    this.running = false
    if (this.timer) clearTimeout(this.timer)
    await this.work
  }

  private poll(): void {
    this.work = this.collect().catch(() => this.options.warn()).finally(() => {
      if (!this.running) return
      this.timer = setTimeout(() => this.poll(), HOST_ALERT_POLL_INTERVAL_MS)
      this.timer.unref?.()
    })
  }

  private async collect(): Promise<void> {
    const computers = this.options.computers()
    // Bound node fan-out; wait for this batch before starting the next.
    for (let offset = 0; this.running && offset < computers.length; offset += 4) {
      await Promise.all(computers.slice(offset, offset + 4).map(async (computer) => {
        try {
          const snapshot = computer.online
            ? await this.options.resolve(computer.id).then((target) => target.snapshot()).catch(() => undefined)
            : undefined
          if (this.running) await this.options.notifications.host(computer, snapshot)
        } catch {
          this.options.warn()
        }
      }))
    }
  }
}
