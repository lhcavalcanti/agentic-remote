import { writeFile } from 'node:fs/promises'
import path from 'node:path'

export function safeUploadName(filename: string): string {
  const basename = path.basename(filename.trim()) || 'upload'
  const normalized = basename
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._ -]/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 120)
  return normalized && normalized !== '.' && normalized !== '..'
    ? normalized
    : 'upload'
}

export function writePrivateUpload(filePath: string, data: Buffer): Promise<void> {
  return writeFile(filePath, data, { flag: 'wx', mode: 0o600 })
}
