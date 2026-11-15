import { execFile } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import { chmod, lstat, mkdir, open, realpath, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import {
  scheduleWorktreeInputSchema, scheduleWorktreeRecordSchema,
  type ScheduleWorktreeInput, type ScheduleWorktreeRecord,
} from '../shared/schedule-worktrees.js'
import { launchIdentitySchema } from '../shared/launch-identity.js'
import { isWithin, validateSessionDirectory } from './session-directory.js'

const execute = promisify(execFile)
const failure = (message: string) => Object.assign(new Error(message), { statusCode: 409 })
const missing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT'

export function configuredScheduleWorktreeRoots(): string[] {
  return (process.env.AGENTIC_REMOTE_SCHEDULE_WORKTREE_ROOTS ?? '').split(',').map((root) => root.trim()).filter(Boolean)
}

/** Runs only on the owning computer. No shell, implicit root, or forced removal. */
export class ScheduleWorktreeService {
  private readonly directory: string
  private work: Promise<unknown> = Promise.resolve()
  private directoryIdentity?: { dev: number; ino: number }

  constructor(dataDirectory: string, private readonly roots: readonly string[]) {
    this.directory = path.join(dataDirectory, 'schedule-worktrees')
  }

  get enabled(): boolean { return this.roots.length > 0 }

  private serial<T>(operation: () => Promise<T>): Promise<T> {
    const task = this.work.then(operation)
    this.work = task.catch(() => undefined)
    return task
  }

  private name(launchId: string): string {
    launchIdentitySchema.parse(launchId)
    return createHash('sha256').update(launchId).digest('hex')
  }

  private async storage(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    const metadata = await lstat(this.directory)
    if (!metadata.isDirectory() || (process.getuid && metadata.uid !== process.getuid())) {
      throw failure('Worktree ownership storage must be an owner-only real directory')
    }
    if (this.directoryIdentity &&
        (metadata.dev !== this.directoryIdentity.dev || metadata.ino !== this.directoryIdentity.ino)) {
      throw failure('Worktree ownership storage changed')
    }
    this.directoryIdentity = { dev: metadata.dev, ino: metadata.ino }
    await chmod(this.directory, 0o700)
  }

  private async load(launchId: string): Promise<ScheduleWorktreeRecord | undefined> {
    await this.storage()
    let handle
    try { handle = await open(path.join(this.directory, `${this.name(launchId)}.json`), constants.O_RDONLY | constants.O_NOFOLLOW) }
    catch (error) { if (missing(error)) return undefined; throw error }
    try {
      const metadata = await handle.stat()
      if (!metadata.isFile() || metadata.size > 16_384 || (process.getuid && metadata.uid !== process.getuid())) {
        throw failure('Invalid worktree ownership record')
      }
      await handle.chmod(0o600)
      const record = scheduleWorktreeRecordSchema.parse(JSON.parse(await handle.readFile('utf8')))
      if (record.launchId !== launchId || record.path !== path.join(record.root, `run-${this.name(launchId).slice(0, 24)}`)) {
        throw failure('Mismatched worktree ownership record')
      }
      return record
    } finally { await handle.close() }
  }

  private async save(record: ScheduleWorktreeRecord): Promise<ScheduleWorktreeRecord> {
    await this.storage()
    const destination = path.join(this.directory, `${this.name(record.launchId)}.json`)
    const staging = path.join(this.directory, `${randomUUID()}.pending`)
    try {
      const handle = await open(staging, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600)
      try { await handle.writeFile(JSON.stringify(record)); await handle.sync() }
      finally { await handle.close() }
      await rename(staging, destination)
      const directory = await open(this.directory, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW)
      try { await directory.sync() } finally { await directory.close() }
    } finally { await unlink(staging).catch((error) => { if (!missing(error)) throw error }) }
    return record
  }

  private async allowedRoot(requested?: string): Promise<string> {
    const selected = requested ?? this.roots[0]
    if (!selected) throw failure('Configure an explicitly allowed schedule worktree root on this computer')
    const resolved = await validateSessionDirectory(selected)
    const allowed = await Promise.all(this.roots.map(async (root) => {
      const real = await validateSessionDirectory(root)
      if (!path.isAbsolute(root) || path.resolve(root) !== real) {
        throw failure('Worktree roots must be absolute real directories without symbolic links')
      }
      return real
    }))
    if (!allowed.includes(resolved)) throw failure('Worktree root is not explicitly allowed on this computer')
    // Pin the configured spelling too; a root retargeted through a symlink is never accepted.
    if (!path.isAbsolute(selected) || path.resolve(selected) !== resolved) {
      throw failure('Worktree roots must be absolute real directories without symbolic links')
    }
    return resolved
  }

  private async git(folder: string, args: string[]): Promise<string> {
    const result = await execute('git', ['-C', folder, ...args], { timeout: 30_000, maxBuffer: 1024 * 1024 })
    return result.stdout.trim()
  }

  private async verify(record: ScheduleWorktreeRecord): Promise<void> {
    const root = await this.allowedRoot(record.root)
    const folder = await realpath(record.path)
    if (root !== record.root || folder !== record.path || !isWithin(root, folder) || folder === root) {
      throw failure('Worktree path is outside its owned root')
    }
    const [repositoryCommon, worktreeCommon, toplevel] = await Promise.all([
      this.git(record.repository, ['rev-parse', '--git-common-dir']),
      this.git(folder, ['rev-parse', '--git-common-dir']),
      this.git(folder, ['rev-parse', '--show-toplevel']),
    ])
    if (toplevel !== folder ||
        await realpath(path.resolve(record.repository, repositoryCommon)) !== await realpath(path.resolve(folder, worktreeCommon))) {
      throw failure('Worktree does not belong to its recorded repository')
    }
  }

  allocate(input: ScheduleWorktreeInput): Promise<ScheduleWorktreeRecord> {
    const parsed = scheduleWorktreeInputSchema.parse(input)
    return this.serial(async () => {
      const root = await this.allowedRoot(parsed.root)
      const folder = await validateSessionDirectory(parsed.folder)
      const repository = await validateSessionDirectory(await this.git(folder, ['rev-parse', '--show-toplevel']))
      const existing = await this.load(parsed.launchId)
      if (existing && (existing.repository !== repository || existing.root !== root || existing.state === 'removed')) {
        throw failure('This launch already owns a different or removed worktree')
      }
      const candidate = path.join(root, `run-${this.name(parsed.launchId).slice(0, 24)}`)
      let exists = false
      try { await lstat(candidate); exists = true } catch (error) { if (!missing(error)) throw error }
      if (exists && !existing) throw failure('Refusing to adopt a worktree without an ownership record')
      const record = existing ?? await this.save({
        launchId: parsed.launchId, repository, root, path: candidate,
        createdAt: new Date().toISOString(), state: 'allocating',
      })
      if (!exists) {
        if (existing && existing.state !== 'allocating') throw failure('Owned worktree is missing; refusing to recreate it')
        await this.git(repository, ['worktree', 'add', '--detach', '--', candidate, 'HEAD'])
      }
      await this.verify(record)
      return this.save({ ...record, state: 'ready', reason: undefined })
    })
  }

  read(launchId: string): Promise<ScheduleWorktreeRecord | undefined> {
    return this.serial(() => this.load(launchId))
  }

  cleanup(launchId: string): Promise<ScheduleWorktreeRecord | undefined> {
    return this.serial(async () => {
      const record = await this.load(launchId)
      if (!record || record.state === 'removed') return record
      const defer = (reason: string) => this.save({ ...record, state: 'deferred', reason })
      try {
        await this.verify(record)
        if (await this.git(record.path, ['status', '--porcelain', '--untracked-files=all', '--ignored', '--ignore-submodules=none'])) {
          return defer('Uncommitted work remains; cleanup requires manual review')
        }
        if (await this.git(record.path, ['rev-list', '--max-count=1', 'HEAD', '--not', '--remotes'])) {
          return defer('Unpushed commits remain (or no remote refs prove they were pushed); cleanup requires manual review')
        }
        // Never --force: Git independently refuses dirty or locked worktrees.
        await this.git(record.repository, ['worktree', 'remove', '--', record.path])
        return this.save({ ...record, state: 'removed', reason: undefined })
      } catch {
        return defer('Ownership, allowed roots, or safe removal could not be verified; cleanup requires manual review')
      }
    })
  }
}
