import { constants } from 'node:fs'
import { isUtf8 } from 'node:buffer'
import { chmod, lstat, mkdir, open, readdir, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import type { MessageOptions } from '@github/copilot-sdk'
import type { ManagerAttachment } from '../shared/manager.js'
import { managerFileType, managerFileValidationError } from '../shared/manager-files.js'
import { safeUploadName, writePrivateUpload } from './upload-storage.js'

const uuid = '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'
const referenceId = new RegExp(`^${uuid}$`)
const storedFile = new RegExp(`^(${uuid})-(.+)$`)
const unsentRetentionMs = 24 * 60 * 60 * 1000
const failure = (message: string, statusCode = 400) => Object.assign(new Error(message), { statusCode })

/** Only this directory's UUID uploads are importable; callers supply opaque IDs. */
export class ManagerUploads {
  readonly directory: string
  constructor(private readonly managerDirectory: string, private readonly now: () => Date) {
    this.directory = path.join(managerDirectory, 'uploads')
  }

  private async prepare(): Promise<void> {
    for (const directory of [this.managerDirectory, this.directory]) {
      await mkdir(directory, { mode: 0o700 }).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'EEXIST') throw error
      })
      const metadata = await lstat(directory)
      if (!metadata.isDirectory() || metadata.uid !== process.getuid?.()) {
        throw failure('Oracle upload directory is not a private owned directory')
      }
      await chmod(directory, 0o700)
    }
  }

  async upload(filename: string, data: Buffer): Promise<ManagerAttachment> {
    const name = safeUploadName(filename)
    const error = managerFileValidationError({ name, size: data.length })
    if (error) throw failure(error, !managerFileType(name) ? 415 : data.length ? 413 : 400)
    if (managerFileType(name)!.kind === 'blob') this.validateText(data)
    await this.prepare()
    const id = randomUUID()
    await writePrivateUpload(path.join(this.directory, `${id}-${name}`), data)
    return { id, name, size: data.length, mimeType: managerFileType(name)!.mimeType }
  }

  async references(ids: string[]): Promise<ManagerAttachment[]> {
    if (ids.length > 20 || new Set(ids).size !== ids.length || ids.some((id) => !referenceId.test(id))) {
      throw failure('Invalid Oracle attachment references')
    }
    if (!ids.length) return []
    await this.prepare()
    const files = await readdir(this.directory)
    return Promise.all(ids.map(async (id) => {
      const matches = files.filter((file) => file.startsWith(`${id}-`) && storedFile.test(file))
      if (matches.length !== 1) throw failure('Oracle attachment is missing or expired. Remove it and attach the file again.', 404)
      const name = matches[0].slice(id.length + 1)
      const handle = await open(path.join(this.directory, matches[0]), constants.O_RDONLY | constants.O_NOFOLLOW)
      try {
        const metadata = await handle.stat()
        if (!metadata.isFile() || metadata.nlink !== 1 || metadata.uid !== process.getuid?.()) {
          throw failure('Oracle attachment is not a private regular file')
        }
        await handle.chmod(0o600)
        const error = managerFileValidationError({ name, size: metadata.size })
        if (error) throw failure(error, managerFileType(name) ? 413 : 415)
        return { id, name, size: metadata.size, mimeType: managerFileType(name)!.mimeType }
      } finally {
        await handle.close()
      }
    }))
  }

  async resolve(references: ManagerAttachment[]): Promise<NonNullable<MessageOptions['attachments']>> {
    const files = await this.references(references.map((file) => file.id))
    return Promise.all(files.map(async (file) => {
      const filePath = path.join(this.directory, `${file.id}-${file.name}`)
      const type = managerFileType(file.name)!
      if (type.kind === 'file') return { type: 'file' as const, path: filePath, displayName: file.name }
      const handle = await open(filePath, constants.O_RDONLY | constants.O_NOFOLLOW)
      try {
        const metadata = await handle.stat()
        if (!metadata.isFile() || metadata.nlink !== 1 || metadata.size > type.limit) {
          throw failure('The file exceeds the 1 MiB limit', 413)
        }
        // A bounded read also prevents a growing file from allocating beyond the cap.
        const bytes = Buffer.alloc(metadata.size + 1)
        const { bytesRead } = await handle.read(bytes, 0, bytes.length, 0)
        if (bytesRead > type.limit) throw failure('The file exceeds the 1 MiB limit', 413)
        const content = bytes.subarray(0, bytesRead)
        this.validateText(content)
        return { type: 'blob' as const, data: content.toString('base64'), mimeType: file.mimeType, displayName: file.name }
      } finally {
        await handle.close()
      }

    }))
  }

  private validateText(data: Buffer): void {
    if (!isUtf8(data) || data.includes(0)) throw failure('Text attachments must contain UTF-8 text, not binary data', 415)
  }

  async cleanup(owned: Set<string>, removed = new Set<string>(), all = false): Promise<void> {
    await this.prepare()
    for (const name of await readdir(this.directory)) {
      const match = storedFile.exec(name)
      if (!match || owned.has(match[1])) continue
      const filePath = path.join(this.directory, name)
      const metadata = await lstat(filePath)
      if (all || removed.has(match[1]) || this.now().getTime() - metadata.mtimeMs >= unsentRetentionMs) {
        await unlink(filePath).catch((error: NodeJS.ErrnoException) => {
          if (error.code !== 'ENOENT') throw error
        })
      }
    }
  }
}
