import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const sourcePaths = [
  'server', 'shared', 'src', 'package.json', 'pnpm-lock.yaml',
  'vite.config.ts', 'tsconfig*.json',
  'docs/reviews/2026-09-09/*.mjs',
  'docs/reviews/2026-09-09/*.mts',
  'docs/reviews/2026-09-09/*.tsx',
]
const sha256 = (data) => createHash('sha256').update(data).digest('hex')

export async function measurementSource(root) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' })
  const headCommit = git('rev-parse', 'HEAD').trim()
  const changes = git('status', '--porcelain=v1', '-z', '--untracked-files=all', '--', ...sourcePaths)
    .split('\0').filter(Boolean)
  const names = [...new Set(git('ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ...sourcePaths)
    .split('\0').filter(Boolean))].sort()
  const files = await Promise.all(names.map(async (name) => {
    try {
      return { path: name, sha256: sha256(await readFile(path.join(root, name))) }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      return { path: name, sha256: null, missing: true }
    }
  }))
  return {
    headCommit,
    sourceCommit: changes.length === 0 ? headCommit : null,
    workingTreeDirty: changes.length > 0,
    changes,
    scope: sourcePaths,
    snapshotSha256: sha256(JSON.stringify(files)),
    files,
  }
}

export async function measurementBundle(root) {
  const directory = path.join(root, 'dist')
  let html
  try {
    html = await readFile(path.join(directory, 'index.html'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    return { available: false, reason: 'Run pnpm build first' }
  }
  const metadataBytes = await readFile(path.join(directory, 'build-info.json'))
  const buildInfo = JSON.parse(metadataBytes)
  if (typeof buildInfo.version !== 'string' || typeof buildInfo.buildId !== 'string' ||
      !buildInfo.version || !buildInfo.buildId) {
    throw new Error('Bundle build-info.json must identify its version and buildId')
  }
  const urls = [...html.toString('utf8').matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)]
    .map((match) => match[1])
  const assets = await Promise.all([...new Set(urls)].map(async (url) => {
    const filename = path.resolve(directory, `.${url}`)
    if (!filename.startsWith(`${path.join(directory, 'assets')}${path.sep}`)) {
      throw new Error(`Built asset escapes its directory: ${url}`)
    }
    const data = await readFile(filename)
    return { asset: url, bytes: data.length, gzipBytes: gzipSync(data).length, sha256: sha256(data) }
  }))
  return {
    available: true,
    sourceCommit: null,
    sourceAssociation: 'Not established. This independently identified dist may be older than the measured source snapshot.',
    scope: 'Assets referenced by built HTML, not lazy chunks, compression on the server, or field load time',
    buildInfo,
    buildInfoSha256: sha256(metadataBytes),
    htmlSha256: sha256(html),
    assets,
  }
}
