import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

export interface RegisteredComputer {
  id: string
  name: string
  baseUrl: string
  token: string
}

interface RegistryState {
  version: 1
  computers: RegisteredComputer[]
}

export class ComputerRegistry {
  private readonly filePath: string
  private state: RegistryState = { version: 1, computers: [] }
  private writeQueue: Promise<void> = Promise.resolve()

  constructor(private readonly directory: string) {
    this.filePath = path.join(directory, 'computers.json')
  }

  async initialize(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    try {
      const parsed = JSON.parse(await readFile(this.filePath, 'utf8')) as RegistryState
      if (parsed.version !== 1 || !Array.isArray(parsed.computers)) {
        throw new Error('Invalid Agentic Remote computer registry')
      }
      this.state = parsed
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
      await this.persist()
    }
  }

  list(): RegisteredComputer[] {
    return structuredClone(this.state.computers)
  }

  async upsert(computer: RegisteredComputer): Promise<void> {
    this.state.computers = [
      computer,
      ...this.state.computers.filter((entry) => entry.id !== computer.id),
    ]
    await this.persist()
  }

  async remove(id: string): Promise<void> {
    this.state.computers = this.state.computers.filter((entry) => entry.id !== id)
    await this.persist()
  }

  private async persist(): Promise<void> {
    const snapshot = JSON.stringify(this.state, null, 2)
    const task = this.writeQueue.then(async () => {
      const temporaryPath = `${this.filePath}.tmp`
      await writeFile(temporaryPath, snapshot, {
        mode: 0o600,
      })
      await rename(temporaryPath, this.filePath)
    })
    this.writeQueue = task.catch(() => undefined)
    await task
  }
}
