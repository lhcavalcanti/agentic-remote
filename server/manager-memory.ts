import { lstat, mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

/** A memory request that cannot be honoured, with the reason the agent sees. */
export class ManagerMemoryError extends Error {
  constructor(message: string, readonly statusCode = 400) {
    super(message)
    this.name = 'ManagerMemoryError'
  }
}

export interface ManagerMemoryEntry {
  path: string
  bytes: number
  updatedAt: string
}

export interface ManagerMemoryLimits {
  maxFileBytes?: number
  maxTotalBytes?: number
  /** How much of MEMORY.md goes into a prompt. */
  indexLimit?: number
}

export const MANAGER_MEMORY_INDEX = 'MEMORY.md'

/**
 * The manager agent's own notes: Markdown files it reads and writes through
 * its tools, confined to one folder. The app never edits them.
 */
export class ManagerMemory {
  private readonly maxFileBytes: number
  private readonly maxTotalBytes: number
  private readonly indexLimit: number
  private work: Promise<unknown> = Promise.resolve()

  constructor(readonly root: string, limits: ManagerMemoryLimits = {}) {
    this.maxFileBytes = limits.maxFileBytes ?? 256 * 1024
    this.maxTotalBytes = limits.maxTotalBytes ?? 4 * 1024 * 1024
    this.indexLimit = limits.indexLimit ?? 12_000
  }

  async list(): Promise<ManagerMemoryEntry[]> {
    const entries: ManagerMemoryEntry[] = []
    const visit = async (relative: string) => {
      let children
      try {
        children = await readdir(path.join(this.root, relative), { withFileTypes: true })
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
        throw error
      }
      for (const child of children) {
        if (child.name.startsWith('.')) continue
        const childPath = relative ? `${relative}/${child.name}` : child.name
        if (child.isDirectory()) {
          await visit(childPath)
        } else if (child.isFile() && child.name.endsWith('.md')) {
          const info = await lstat(path.join(this.root, childPath))
          entries.push({
            path: childPath,
            bytes: info.size,
            updatedAt: info.mtime.toISOString(),
          })
        }
      }
    }
    await visit('')
    return entries.sort((left, right) => left.path.localeCompare(right.path))
  }

  async read(relative: string): Promise<string> {
    const target = await this.resolve(relative)
    try {
      return await readFile(target, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new ManagerMemoryError(`No memory note at ${relative}`, 404)
      }
      throw error
    }
  }

  write(relative: string, content: string): Promise<void> {
    return this.serialized(async () => {
      const target = await this.resolve(relative)
      await this.store(target, relative, content)
    })
  }

  append(relative: string, content: string): Promise<void> {
    return this.serialized(async () => {
      const target = await this.resolve(relative)
      const current = await readFile(target, 'utf8').catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return ''
        throw error
      })
      const separator = current && !current.endsWith('\n') ? '\n' : ''
      await this.store(target, relative, `${current}${separator}${content}`)
    })
  }

  delete(relative: string): Promise<void> {
    return this.serialized(async () => {
      const target = await this.resolve(relative)
      try {
        await rm(target)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          throw new ManagerMemoryError(`No memory note at ${relative}`, 404)
        }
        throw error
      }
    })
  }

  /** MEMORY.md as it goes into a prompt, or nothing before it exists. */
  async index(): Promise<string | undefined> {
    const content = await this.read(MANAGER_MEMORY_INDEX).catch((error: unknown) => {
      if (error instanceof ManagerMemoryError && error.statusCode === 404) return undefined
      throw error
    })
    if (content === undefined) return undefined
    return content.length > this.indexLimit
      ? `${content.slice(0, this.indexLimit)}\n… (truncated; read ${MANAGER_MEMORY_INDEX} for the rest)`
      : content
  }

  private async store(target: string, relative: string, content: string): Promise<void> {
    const bytes = Buffer.byteLength(content, 'utf8')
    if (bytes > this.maxFileBytes) {
      throw new ManagerMemoryError(
        `${relative} would be ${bytes} bytes; a memory note is limited to ${this.maxFileBytes} bytes. Summarize or split it.`,
        413,
      )
    }
    const others = (await this.list())
      .filter((entry) => entry.path !== relative)
      .reduce((total, entry) => total + entry.bytes, 0)
    if (others + bytes > this.maxTotalBytes) {
      throw new ManagerMemoryError(
        `Memory would hold ${others + bytes} bytes; it is limited to ${this.maxTotalBytes} bytes. Consolidate or delete old notes first.`,
        413,
      )
    }
    await mkdir(path.dirname(target), { recursive: true })
    const temporary = `${target}.${randomUUID()}.tmp`
    await writeFile(temporary, content, 'utf8')
    await rename(temporary, target)
  }

  /**
   * Resolves a note's path inside the memory folder. Only relative Markdown
   * paths without hidden or parent segments are accepted, and no segment that
   * already exists may be a symbolic link.
   */
  private async resolve(relative: string): Promise<string> {
    const candidate = typeof relative === 'string' ? relative.trim() : ''
    if (!candidate || candidate.includes('\0') || candidate.includes('\\')) {
      throw new ManagerMemoryError('Give a relative path such as MEMORY.md or sessions/<id>.md')
    }
    if (path.isAbsolute(candidate)) {
      throw new ManagerMemoryError('Memory paths are relative to the memory folder')
    }
    const segments = candidate.split('/')
    if (segments.some((segment) => !segment || segment === '.' || segment === '..' || segment.startsWith('.'))) {
      throw new ManagerMemoryError('Memory paths cannot contain empty, hidden, or parent segments')
    }
    if (!candidate.endsWith('.md')) {
      throw new ManagerMemoryError('Memory notes are Markdown files ending in .md')
    }
    let current = this.root
    for (const segment of segments) {
      current = path.join(current, segment)
      const info = await lstat(current).catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return undefined
        throw error
      })
      if (!info) break
      if (info.isSymbolicLink()) {
        throw new ManagerMemoryError('Memory paths cannot go through a symbolic link')
      }
    }
    return path.join(this.root, ...segments)
  }

  private serialized<T>(work: () => Promise<T>): Promise<T> {
    const next = this.work.then(work, work)
    this.work = next.catch(() => undefined)
    return next
  }
}
