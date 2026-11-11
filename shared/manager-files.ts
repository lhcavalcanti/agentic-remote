export const MAX_MANAGER_TEXT_BYTES = 1024 * 1024
export const MAX_MANAGER_FILE_BYTES = 25 * 1024 * 1024

const textTypes: Record<string, string> = {
  txt: 'text/plain', md: 'text/markdown', markdown: 'text/markdown',
  json: 'application/json', yaml: 'application/yaml', yml: 'application/yaml',
  csv: 'text/csv', tsv: 'text/tab-separated-values',
}
const codeExtensions = new Set([
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'py', 'rb', 'go', 'rs', 'java',
  'c', 'h', 'cpp', 'hpp', 'cs', 'css', 'scss', 'html', 'xml', 'svg', 'sql',
  'sh', 'bash', 'zsh', 'fish', 'ps1', 'php', 'swift', 'kt', 'kql', 'toml',
  'ini', 'conf', 'log', 'vue', 'svelte', 'r', 'ex', 'exs', 'erl', 'lua',
])
const fileTypes: Record<string, string> = {
  pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg',
  jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
}

export function managerFileType(name: string): { mimeType: string; kind: 'blob' | 'file'; limit: number } | undefined {
  const extension = name.split(/[\\/]/).at(-1)?.split('.').at(-1)?.toLowerCase() ?? ''
  const text = textTypes[extension] ?? (codeExtensions.has(extension) ? 'text/plain' : undefined)
  if (text) return { mimeType: text, kind: 'blob', limit: MAX_MANAGER_TEXT_BYTES }
  const file = fileTypes[extension]
  return file ? { mimeType: file, kind: 'file', limit: MAX_MANAGER_FILE_BYTES } : undefined
}

export function managerFileValidationError(file: { name: string; size: number }): string | undefined {
  const type = managerFileType(file.name)
  if (!type) return 'This file type is not supported'
  if (!file.size) return 'The uploaded file is empty'
  if (file.size > type.limit) return `The file exceeds the ${type.kind === 'blob' ? '1' : '25'} MiB limit`
  return undefined
}
