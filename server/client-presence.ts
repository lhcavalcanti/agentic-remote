/** The largest presence message accepted; anything larger is ignored. */
const PRESENCE_MESSAGE_LIMIT = 256
/**
 * How long a report holds. An app showing Oracle repeats it more often than
 * this, so a phone that froze or lost its network without closing its socket
 * stops holding Oracle's notifications back soon after.
 */
export const PRESENCE_TTL_MS = 90_000

/**
 * What the open apps are looking at, as each reports over its event socket.
 * Only one fact is kept: whether Oracle's panel is on a visible screen, which
 * makes a push about Oracle redundant. Nothing is stored.
 */
export class ClientPresence {
  /** When each client last said it shows Oracle. */
  private readonly watchingOracle = new Map<object, number>()

  constructor(private readonly now: () => number = Date.now) {}

  /** Applies one message from a client; anything else it sends is ignored. */
  update(client: object, raw: unknown): void {
    const text = typeof raw === 'string' ? raw : Buffer.isBuffer(raw) ? raw.toString('utf8') : undefined
    if (text === undefined || text.length > PRESENCE_MESSAGE_LIMIT) return
    let message: unknown
    try {
      message = JSON.parse(text)
    } catch {
      return
    }
    if (!message || typeof message !== 'object') return
    const { type, oracleVisible } = message as { type?: unknown; oracleVisible?: unknown }
    if (type !== 'presence' || typeof oracleVisible !== 'boolean') return
    if (oracleVisible) this.watchingOracle.set(client, this.now())
    else this.watchingOracle.delete(client)
  }

  remove(client: object): void {
    this.watchingOracle.delete(client)
  }

  oracleWatched(): boolean {
    const now = this.now()
    for (const [client, at] of this.watchingOracle) {
      if (now - at < PRESENCE_TTL_MS) return true
      this.watchingOracle.delete(client)
    }
    return false
  }
}
