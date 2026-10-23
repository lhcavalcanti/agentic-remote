import { lstat, readFile, realpath, readdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { CopilotClient } from '@github/copilot-sdk'

const MAX_PLUGINS = 128
const MAX_STRING_LENGTH = 4_096
const MAX_CONTRIBUTION_ENTRIES = 10_000
const AGENT_PLUGIN_SCHEMA_PREFIX = 'https://agent-plugins.org/schemas/'
const agentPluginSchemas = new Set([
  `${AGENT_PLUGIN_SCHEMA_PREFIX}1.0.0/plugin.schema.json`,
  `${AGENT_PLUGIN_SCHEMA_PREFIX}1.1.0/plugin.schema.json`,
])
const legacyManifestCandidates = [
  '.plugin/plugin.json',
  'plugin.json',
  '.github/plugin/plugin.json',
  '.claude-plugin/plugin.json',
] as const
const marketplaceManifestCandidates = [
  'marketplace.json',
  '.plugin/marketplace.json',
  '.github/plugin/marketplace.json',
  '.claude-plugin/marketplace.json',
] as const

type PluginListResult = Awaited<ReturnType<CopilotClient['rpc']['plugins']['list']>>
type InstalledPlugin = PluginListResult['plugins'][number]
type PluginIdentity = Pick<InstalledPlugin, 'name' | 'marketplace'> &
  Partial<Pick<InstalledPlugin, 'directSourceId'>>

export interface CopilotPluginClient {
  rpc: {
    plugins?: Pick<CopilotClient['rpc']['plugins'], 'list'>
  }
}

interface PluginManifest {
  format: 'agent' | 'legacy'
  manifest?: Record<string, unknown>
}

function pluginLabel(plugin: PluginIdentity): string {
  return plugin.marketplace
    ? `${plugin.name}@${plugin.marketplace}`
    : plugin.name
}

function pluginKey(plugin: PluginIdentity): string {
  const source = plugin.marketplace || plugin.directSourceId || ''
  return `${plugin.marketplace}\0${plugin.name}\0${source}`
    .toLocaleLowerCase('en-US')
}

function pluginError(
  plugin: PluginIdentity,
  detail: string,
  options?: ErrorOptions,
): Error {
  return new Error(`Copilot plugin ${pluginLabel(plugin)} ${detail}`, options)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function requiredString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 &&
      value.length <= MAX_STRING_LENGTH && !value.includes('\0')
    ? value
    : undefined
}

function safePathSegment(value: string): boolean {
  return value !== '.' && value !== '..' &&
    !value.includes('/') && !value.includes('\\')
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT'
}

function isWithin(parent: string, candidate: string): boolean {
  const relative = path.relative(parent, candidate)
  return relative === '' || (
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  )
}

async function regularDirectory(candidate: string): Promise<string | undefined> {
  try {
    const metadata = await lstat(candidate)
    if (!metadata.isDirectory() || metadata.isSymbolicLink()) return undefined
    return await realpath(candidate)
  } catch {
    return undefined
  }
}

async function assertNoSymlinkPath(
  plugin: PluginIdentity,
  base: string,
  candidate: string,
  detail: string,
): Promise<void> {
  const relative = path.relative(base, candidate)
  if (!isWithin(base, candidate)) throw pluginError(plugin, detail)
  let current = base
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment)
    let metadata
    try {
      metadata = await lstat(current)
    } catch (cause) {
      throw pluginError(plugin, detail, { cause })
    }
    if (metadata.isSymbolicLink()) throw pluginError(plugin, detail)
  }
}

async function readManifest(
  plugin: PluginIdentity,
  root: string,
  relative: string,
): Promise<Record<string, unknown> | undefined> {
  const candidate = path.join(root, relative)
  try {
    const metadata = await lstat(candidate)
    if (metadata.isSymbolicLink()) {
      throw pluginError(plugin, 'has a symlinked manifest')
    }
    if (!metadata.isFile()) return undefined
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Copilot plugin ')) {
      throw error
    }
    if (isMissing(error)) return undefined
    throw pluginError(plugin, 'manifest could not be inspected', { cause: error })
  }
  try {
    const parsed: unknown = JSON.parse(await readFile(candidate, 'utf8'))
    if (!isRecord(parsed)) throw new Error('manifest is not an object')
    return parsed
  } catch (cause) {
    throw pluginError(plugin, 'has a malformed manifest', { cause })
  }
}

async function pluginManifest(
  plugin: PluginIdentity,
  root: string,
): Promise<PluginManifest> {
  const rootManifest = await readManifest(plugin, root, 'plugin.json')
  const schema = rootManifest && requiredString(rootManifest.$schema)
  if (schema?.startsWith(AGENT_PLUGIN_SCHEMA_PREFIX)) {
    if (!agentPluginSchemas.has(schema)) {
      throw pluginError(plugin, 'uses an unsupported Agent Plugins schema')
    }
    return { format: 'agent', manifest: rootManifest }
  }
  for (const relative of legacyManifestCandidates) {
    const manifest = relative === 'plugin.json'
      ? rootManifest
      : await readManifest(plugin, root, relative)
    if (manifest) return { format: 'legacy', manifest }
  }
  return { format: 'legacy' }
}

function configuredSkillRoots(
  plugin: PluginIdentity,
  descriptor: PluginManifest,
): {
  explicit: boolean
  roots: string[]
} {
  if (descriptor.format === 'agent') {
    return { explicit: false, roots: ['skills'] }
  }
  const manifest = descriptor.manifest
  if (!manifest || manifest.skills === undefined) {
    return { explicit: false, roots: ['skills'] }
  }
  const values = Array.isArray(manifest.skills)
    ? manifest.skills
    : [manifest.skills]
  if (!values.length || !values.every((value) =>
    typeof value === 'string' && value.length > 0 &&
    value.length <= MAX_STRING_LENGTH && !value.includes('\0'))) {
    throw pluginError(plugin, 'has malformed skill contribution paths')
  }
  return { explicit: true, roots: values as string[] }
}

async function validateSkillDirectory(
  plugin: PluginIdentity,
  pluginRoot: string,
  candidate: string,
): Promise<string> {
  if (path.isAbsolute(candidate) || candidate.split(/[\\/]/u).includes('..')) {
    throw pluginError(plugin, 'has an unsafe skill contribution path')
  }
  const joined = path.resolve(pluginRoot, candidate)
  await assertNoSymlinkPath(
    plugin,
    pluginRoot,
    joined,
    'has an unsafe or missing skill contribution directory',
  )
  const resolved = await regularDirectory(joined)
  if (!resolved || !isWithin(pluginRoot, resolved)) {
    throw pluginError(plugin, 'has an unsafe or missing skill contribution directory')
  }
  const pending = [resolved]
  let entries = 0
  while (pending.length) {
    const directory = pending.pop()!
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      entries += 1
      if (entries > MAX_CONTRIBUTION_ENTRIES) {
        throw pluginError(plugin, 'has too many skill contribution files')
      }
      if (entry.isSymbolicLink()) {
        throw pluginError(plugin, 'has a symlink in its skill contributions')
      }
      const candidatePath = path.join(directory, entry.name)
      const canonicalPath = await realpath(candidatePath)
      if (!isWithin(pluginRoot, canonicalPath)) {
        throw pluginError(plugin, 'has a skill contribution that escapes its plugin root')
      }
      if (entry.isDirectory()) pending.push(canonicalPath)
    }
  }
  return resolved
}

async function validatePluginRoot(
  plugin: PluginIdentity,
  candidate: string,
  allowedRoot: string,
): Promise<string[]> {
  if (!path.isAbsolute(candidate)) {
    throw pluginError(plugin, 'has a non-absolute plugin root')
  }
  await assertNoSymlinkPath(
    plugin,
    allowedRoot,
    candidate,
    'has an unsafe or missing plugin root',
  )
  const root = await regularDirectory(candidate)
  if (!root || !isWithin(allowedRoot, root)) {
    throw pluginError(plugin, 'has an unsafe or missing plugin root')
  }
  const descriptor = await pluginManifest(plugin, root)
  const configured = configuredSkillRoots(plugin, descriptor)
  const roots: string[] = []
  for (const relative of configured.roots) {
    const target = path.resolve(root, relative)
    const exists = await regularDirectory(target)
    if (!exists && !configured.explicit) continue
    roots.push(await validateSkillDirectory(plugin, root, relative))
  }
  if (!roots.length && descriptor.format === 'legacy') {
    const rootSkill = path.join(root, 'SKILL.md')
    try {
      const metadata = await lstat(rootSkill)
      if (metadata.isSymbolicLink()) {
        throw pluginError(plugin, 'has a symlinked root skill file')
      }
      if (metadata.isFile()) roots.push(root)
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Copilot plugin ')) {
        throw error
      }
      if (!isMissing(error)) {
        throw pluginError(plugin, 'root skill file could not be inspected', {
          cause: error,
        })
      }
    }
  }
  return roots
}

async function resolveLivePluginRoot(
  plugin: PluginIdentity,
  installedFrom: string,
): Promise<{ allowedRoot: string; pluginRoot: string }> {
  if (!path.isAbsolute(installedFrom)) {
    throw pluginError(plugin, 'has a non-absolute live marketplace root')
  }
  const marketplaceRoot = await regularDirectory(installedFrom)
  if (!marketplaceRoot) {
    throw pluginError(plugin, 'has an unsafe or missing live marketplace root')
  }
  for (const relative of marketplaceManifestCandidates) {
    const manifestPath = path.join(marketplaceRoot, relative)
    let metadata
    try {
      metadata = await lstat(manifestPath)
    } catch (error) {
      if (isMissing(error)) continue
      throw pluginError(plugin, 'marketplace manifest could not be inspected', {
        cause: error,
      })
    }
    if (metadata.isSymbolicLink()) {
      throw pluginError(plugin, 'has a symlinked marketplace manifest')
    }
    if (!metadata.isFile()) continue
    let manifest: unknown
    try {
      manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    } catch (cause) {
      throw pluginError(plugin, 'has a malformed marketplace manifest', { cause })
    }
    if (!isRecord(manifest) || !Array.isArray(manifest.plugins)) {
      throw pluginError(plugin, 'has a malformed marketplace manifest')
    }
    const entry = manifest.plugins.find((candidate) =>
      isRecord(candidate) && candidate.name === plugin.name)
    if (!isRecord(entry) || typeof entry.source !== 'string') {
      throw pluginError(plugin, 'cannot be resolved from its live marketplace')
    }
    const source = entry.source
    if (!source || source.length > MAX_STRING_LENGTH || path.isAbsolute(source) ||
      source.split(/[\\/]/u).includes('..')) {
      throw pluginError(plugin, 'has an unsafe live marketplace source')
    }
    const candidate = path.resolve(marketplaceRoot, source)
    await assertNoSymlinkPath(
      plugin,
      marketplaceRoot,
      candidate,
      'has an unsafe or missing live plugin root',
    )
    const root = await regularDirectory(candidate)
    if (!root || !isWithin(marketplaceRoot, root)) {
      throw pluginError(plugin, 'has an unsafe or missing live plugin root')
    }
    return { allowedRoot: marketplaceRoot, pluginRoot: root }
  }
  throw pluginError(plugin, 'has no readable live marketplace manifest')
}

function copilotHome(environment: NodeJS.ProcessEnv): string {
  const configured = environment.COPILOT_HOME?.trim()
  const home = configured || path.join(environment.HOME || os.homedir(), '.copilot')
  if (!path.isAbsolute(home)) {
    throw new Error('COPILOT_HOME must be an absolute path for plugin discovery')
  }
  return path.resolve(home)
}

export async function resolveCopilotPluginSkillDirectories(
  client: CopilotPluginClient,
  environment: NodeJS.ProcessEnv = process.env,
): Promise<string[]> {
  const list = client.rpc.plugins?.list
  if (!list) {
    throw new Error('Copilot SDK runtime does not expose installed-plugin discovery')
  }
  const result = await list()
  if (!Array.isArray(result.plugins) || result.plugins.length > MAX_PLUGINS) {
    throw new Error('Copilot SDK returned malformed installed-plugin state')
  }
  const enabled = result.plugins.filter((plugin) =>
    plugin.enabled && plugin.source !== 'builtin')
  if (!enabled.length) return []
  const home = copilotHome(environment)
  let installedRoot: string | undefined
  const managedRoot = async () => {
    installedRoot ??= await regularDirectory(path.join(home, 'installed-plugins'))
    if (!installedRoot) {
      throw new Error('Copilot installed-plugin root is missing or unsafe')
    }
    return installedRoot
  }
  const seen = new Set<string>()
  const directories: string[] = []
  for (const plugin of enabled) {
    const name = requiredString(plugin.name)
    const marketplace =
      typeof plugin.marketplace === 'string' &&
        plugin.marketplace.length <= MAX_STRING_LENGTH &&
        !plugin.marketplace.includes('\0')
        ? plugin.marketplace
        : undefined
    const installedFrom = requiredString(plugin.installedFrom)
    const directSourceId = requiredString(plugin.directSourceId)
    if (!name || marketplace === undefined || !safePathSegment(name) ||
      marketplace && !safePathSegment(marketplace) ||
      installedFrom && !marketplace ||
      !marketplace && !installedFrom &&
        (!directSourceId || !safePathSegment(directSourceId))) {
      throw new Error('Copilot SDK returned a malformed enabled plugin')
    }
    const normalized = {
      ...plugin,
      name,
      marketplace,
      ...(directSourceId ? { directSourceId } : {}),
    }
    const key = pluginKey(normalized)
    if (seen.has(key)) {
      throw new Error(`Copilot SDK returned ${pluginLabel(normalized)} twice`)
    }
    seen.add(key)
    if (installedFrom) {
      const live = await resolveLivePluginRoot(normalized, installedFrom)
      directories.push(
        ...await validatePluginRoot(
          normalized,
          live.pluginRoot,
          live.allowedRoot,
        ),
      )
      continue
    }
    const root = await managedRoot()
    const pluginRoot = marketplace
      ? path.join(root, marketplace, name)
      : path.join(root, '_direct', directSourceId!)
    directories.push(
      ...await validatePluginRoot(normalized, pluginRoot, root),
    )
  }
  return [...new Set(directories)]
}
