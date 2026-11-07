import { randomBytes, randomUUID } from 'node:crypto'
import { hostname } from 'node:os'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { NodeInfo } from '../shared/contracts.js'

const appVersion = (
  JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { version: string }
).version

interface StoredNodeIdentityV1 {
  version: 1
  id: string
  name: string
  token: string
}

interface StoredNodeIdentity {
  version: 2
  id: string
  name: string
  token: string
  lifecycleGeneration: string
}

export class NodeIdentityStore {
  private readonly filePath: string
  private identity?: StoredNodeIdentity

  constructor(private readonly directory: string) {
    this.filePath = path.join(directory, 'node.json')
  }

  async initialize(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    try {
      const parsed = JSON.parse(
        await readFile(this.filePath, 'utf8'),
      ) as StoredNodeIdentity | StoredNodeIdentityV1
      if (
        (parsed.version !== 1 && parsed.version !== 2) ||
        !parsed.id?.trim() ||
        !parsed.name?.trim() ||
        !parsed.token?.trim() ||
        (parsed.version === 2 && !parsed.lifecycleGeneration?.trim())
      ) {
        throw new Error('Invalid Agentic Remote node identity')
      }
      this.identity = parsed.version === 2
        ? parsed
        : {
            ...parsed,
            version: 2,
            lifecycleGeneration: randomUUID(),
          }
      if (parsed.version === 1) await this.persist()
      const configuredName = process.env.AGENTIC_REMOTE_NODE_NAME?.trim()
      if (configuredName && configuredName !== parsed.name) {
        this.identity.name = configuredName
        await this.persist()
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
      this.identity = {
        version: 2,
        id: randomUUID(),
        name: process.env.AGENTIC_REMOTE_NODE_NAME?.trim() || hostname(),
        token: randomBytes(32).toString('base64url'),
        lifecycleGeneration: randomUUID(),
      }
      await this.persist()
    }
  }

  get info(): NodeInfo {
    const identity = this.requireIdentity()
    return {
      id: identity.id,
      name: identity.name,
      version: appVersion,
    }
  }

  get token(): string {
    return this.requireIdentity().token
  }

  get lifecycleGeneration(): string {
    return this.requireIdentity().lifecycleGeneration
  }

  private requireIdentity(): StoredNodeIdentity {
    if (!this.identity) {
      throw new Error('Node identity has not been initialized')
    }
    return this.identity
  }

  private async persist(): Promise<void> {
    const temporaryPath = `${this.filePath}.tmp`
    await writeFile(temporaryPath, JSON.stringify(this.requireIdentity(), null, 2), {
      mode: 0o600,
    })
    await rename(temporaryPath, this.filePath)
  }
}
