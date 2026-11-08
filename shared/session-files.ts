export const MAX_SESSION_FILE_BYTES = 25 * 1024 * 1024

const supportedExtensions = new Set([
  '.csv',
  '.doc',
  '.docx',
  '.gif',
  '.jpeg',
  '.jpg',
  '.json',
  '.kql',
  '.md',
  '.ofx',
  '.pdf',
  '.png',
  '.qfx',
  '.tsv',
  '.txt',
  '.webp',
  '.xls',
  '.xlsx',
  '.yaml',
  '.yml',
])

function extension(filename: string): string {
  const basename = filename.split(/[\\/]/).at(-1) || ''
  const dot = basename.lastIndexOf('.')
  return dot >= 0 ? basename.slice(dot).toLowerCase() : ''
}

export function supportsSessionFile(filename: string): boolean {
  return supportedExtensions.has(extension(filename))
}

export function sessionFileValidationError(
  file: Pick<File, 'name' | 'size'>,
): string | undefined {
  if (!supportsSessionFile(file.name)) {
    return 'This file type is not supported'
  }
  if (file.size === 0) {
    return 'The uploaded file is empty'
  }
  if (file.size > MAX_SESSION_FILE_BYTES) {
    return 'The file exceeds the 25 MiB limit'
  }
  return undefined
}
