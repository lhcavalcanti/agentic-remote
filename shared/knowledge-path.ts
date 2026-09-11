function slashPath(value: string): string {
  return value.replaceAll('\\', '/')
}

export function normalizeKnowledgeRelativePath(value = '.'): string {
  const normalized = slashPath(value.trim())
  if (!normalized || normalized === '.') {
    return '.'
  }
  if (
    normalized.startsWith('/') ||
    /^[A-Za-z]:\//.test(normalized)
  ) {
    throw new Error('Knowledge paths must be relative')
  }
  const segments = normalized.split('/').filter((segment) => segment !== '' && segment !== '.')
  if (
    segments.some(
      (segment) => segment === '..' || segment.startsWith('.'),
    )
  ) {
    throw new Error('Knowledge paths cannot escape the root or include hidden folders')
  }
  return segments.join('/') || '.'
}

export function joinKnowledgeRelativePath(base: string, child: string): string {
  const normalizedBase = normalizeKnowledgeRelativePath(base)
  const normalizedChild = normalizeKnowledgeRelativePath(child)
  return [normalizedBase, normalizedChild]
    .filter((entry) => entry !== '.')
    .join('/') || '.'
}

export function rebaseKnowledgeRelativePath(
  base: string,
  candidate: string,
): string | undefined {
  const normalizedBase = normalizeKnowledgeRelativePath(base)
  const normalizedCandidate = normalizeKnowledgeRelativePath(candidate)
  if (normalizedBase === '.') {
    return normalizedCandidate
  }
  if (normalizedCandidate === normalizedBase) {
    return '.'
  }
  const prefix = `${normalizedBase}/`
  return normalizedCandidate.startsWith(prefix)
    ? normalizedCandidate.slice(prefix.length)
    : undefined
}

export function knowledgeAbsolutePath(base: string, relative: string): string {
  const normalizedRelative = normalizeKnowledgeRelativePath(relative)
  if (normalizedRelative === '.') {
    return base
  }
  const separator = base.includes('\\') && !base.includes('/') ? '\\' : '/'
  const trimmed = base.replace(/[\\/]+$/, '')
  const prefix = trimmed || (base.startsWith('/') ? '' : base)
  return `${prefix}${separator}${normalizedRelative.replaceAll('/', separator)}`
}

export function knowledgeRelativePathFromAbsolute(
  base: string,
  candidate: string,
): string {
  const normalizedBase = slashPath(base).replace(/\/+$/, '') || '/'
  const normalizedCandidate = slashPath(candidate).replace(/\/+$/, '') || '/'
  if (normalizedCandidate === normalizedBase) {
    return '.'
  }
  const prefix = normalizedBase === '/' ? '/' : `${normalizedBase}/`
  if (!normalizedCandidate.startsWith(prefix)) {
    throw new Error('The selected folder is outside the Knowledge root')
  }
  return normalizeKnowledgeRelativePath(normalizedCandidate.slice(prefix.length))
}
