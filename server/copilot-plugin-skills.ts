import { lstat, readFile, realpath, readdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { CopilotClient } from '@github/copilot-sdk'

const MAX_PLUGINS = 128
const MAX_STRING_LENGTH = 4_096
const MAX_CONTRIBUTION_ENTRIES = 10_000
const manifestCandidates = [
  'plugin.json',
  '.plugin/plugin.json',
  '.github/plugin/plugin.json',
  '.claude-plugin/plugin.json',
] as const

type PluginListResult = Awaited<ReturnType<CopilotClient['rpc']['plugins']['list']>>
type InstalledPlugin = PluginListResult['plugins'][number]

export interface CopilotPluginClient {
  rpc: {
    plugins?: Pick<CopilotClient['rpc']['plugins'], 'list'>
  }
}

interface StoredPlugin {
  name: string
  marketplace: string
  cache_path?: string
  enabled?: boolean
}

function pluginLabel(plugin: Pick<InstalledPlugin, 'name' | 'marketplace'>): string {
  return plugin.marketplace
    ? `${plugin.name}@${plugin.marketplace}`
    : plugin.name
}

function pluginKey(plugin: Pick<InstalledPlugin, 'name' | 'marketplace'>): string {
  return `${plugin.marketplace}\0${plugin.name}`.toLocaleLowerCase('en-US')
}

function pluginError(
  plugin: Pick<InstalledPlugin, 'name' | 'marketplace'>,
  detail: string,
  options?: ErrorOptions,
): Error {
  return new Error(`Copilot plugin ${pluginLabel(plugin)} ${detail}`, options)
}

function stripJsonComments(contents: string): string {
  let output = ''
  let string = false
  let escaped = false
  let lineComment = false
  let blockComment = false
  for (let index = 0; index < contents.length; index += 1) {
    const current = contents[index]
    const next = contents[index + 1]
    if (lineComment) {
      if (current === '\n') {
        lineComment = false
        output += current
      }
      continue
    }
    if (blockComment) {
      if (current === '*' && next === '/') {
        blockComment = false
        index += 1
      } else if (current === '\n') {
        output += current
      }
      continue
    }
    if (string) {
      output += current
      if (escaped) {
        escaped = false
      } else if (current === '\\') {
        escaped = true
      } else if (current === '"') {
        string = false
      }
      continue
    }
    if (current === '"') {
      string = true
      output += current
      continue
    }
    if (current === '/' && next === '/') {
      lineComment = true
      index += 1
      continue
    }
    if (current === '/' && next === '*') {
      blockComment = true
      index += 1
      continue
    }
    output += current
  }
  return output
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

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT'
}

async function readStoredPlugins(configPath: string): Promise<Map<string, StoredPlugin>> {
  let parsed: unknown
  try {
    parsed = JSON.parse(stripJsonComments(await readFile(configPath, 'utf8')))
  } catch (cause) {
    throw new Error('Copilot installed-plugin state could not be read', { cause })
  }
  if (!isRecord(parsed) || !Array.isArray(parsed.installedPlugins)) {
    throw new Error('Copilot installed-plugin state is malformed')
  }
  if (parsed.installedPlugins.length > MAX_PLUGINS) {
    throw new Error('Copilot installed-plugin state exceeds the supported plugin limit')
  }
  const plugins = new Map<string, StoredPlugin>()
  for (const value of parsed.installedPlugins) {
    if (!isRecord(value)) {
      throw new Error('Copilot installed-plugin state contains a malformed plugin')
    }
    const name = requiredString(value.name)
    const marketplace =
      typeof value.marketplace === 'string' &&
        value.marketplace.length <= MAX_STRING_LENGTH &&
        !value.marketplace.includes('\0')
        ? value.marketplace
        : undefined
    const cachePath =
      value.cache_path === undefined
        ? undefined
        : requiredString(value.cache_path)
    if (!name || marketplace === undefined || value.cache_path !== undefined && !cachePath) {
      throw new Error('Copilot installed-plugin state contains a malformed plugin')
    }
    const plugin = {
      name,
      marketplace,
      ...(cachePath ? { cache_path: cachePath } : {}),
      ...(typeof value.enabled === 'boolean' ? { enabled: value.enabled } : {}),
    }
    const key = pluginKey(plugin)
    if (plugins.has(key)) {
      throw new Error(`Copilot installed-plugin state lists ${pluginLabel(plugin)} twice`)
    }
    plugins.set(key, plugin)
  }
  return plugins
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

function configuredSkillRoots(
  plugin: Pick<InstalledPlugin, 'name' | 'marketplace'>,
  manifest: Record<string, unknown> | undefined,
): {
  explicit: boolean
  roots: string[]
} {
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

async function pluginManifest(
  plugin: Pick<InstalledPlugin, 'name' | 'marketplace'>,
  root: string,
): Promise<Record<string, unknown> | undefined> {
  for (const relative of manifestCandidates) {
    const candidate = path.join(root, relative)
    try {
      const metadata = await lstat(candidate)
      if (metadata.isSymbolicLink()) {
        throw pluginError(plugin, 'has a symlinked manifest')
      }
      if (!metadata.isFile()) continue
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Copilot plugin ')) {
        throw error
      }
      if (isMissing(error)) continue
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
  return undefined
}

async function validateSkillDirectory(
  plugin: Pick<InstalledPlugin, 'name' | 'marketplace'>,
  pluginRoot: string,
  candidate: string,
): Promise<string> {
  if (path.isAbsolute(candidate) || candidate.split(/[\\/]/u).includes('..')) {
    throw pluginError(plugin, 'has an unsafe skill contribution path')
  }
  const joined = path.resolve(pluginRoot, candidate)
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
  plugin: Pick<InstalledPlugin, 'name' | 'marketplace'>,
  cachePath: string,
  installedRoot: string,
  installedFrom?: string,
): Promise<string[]> {
  if (!path.isAbsolute(cachePath)) {
    throw pluginError(plugin, 'has a non-absolute cache path')
  }
  if (installedFrom && !path.isAbsolute(installedFrom)) {
    throw pluginError(plugin, 'has a non-absolute live marketplace root')
  }
  const root = await regularDirectory(cachePath)
  const liveRoot = installedFrom
    ? await regularDirectory(installedFrom)
    : undefined
  const allowedRoot = liveRoot || installedRoot
  if (!root || !allowedRoot || !isWithin(allowedRoot, root)) {
    throw pluginError(plugin, 'has an unsafe or missing cache root')
  }
  if (!liveRoot && plugin.marketplace) {
    const expected = path.join(installedRoot, plugin.marketplace, plugin.name)
    const expectedRoot = await regularDirectory(expected)
    if (!expectedRoot || expectedRoot !== root) {
      throw pluginError(plugin, 'does not match its managed install location')
    }
  } else if (!liveRoot && !isWithin(path.join(installedRoot, '_direct'), root)) {
    throw pluginError(plugin, 'does not match a managed direct-install location')
  }
  const manifest = await pluginManifest(plugin, root)
  const configured = configuredSkillRoots(plugin, manifest)
  const roots: string[] = []
  for (const relative of configured.roots) {
    const candidate = path.resolve(root, relative)
    const exists = await regularDirectory(candidate)
    if (!exists && !configured.explicit) continue
    roots.push(await validateSkillDirectory(plugin, root, relative))
  }
  if (!roots.length) {
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
  plugin: Pick<InstalledPlugin, 'name' | 'marketplace'>,
  installedFrom: string,
): Promise<string> {
  if (!path.isAbsolute(installedFrom)) {
    throw pluginError(plugin, 'has a non-absolute live marketplace root')
  }
  const marketplaceRoot = await regularDirectory(installedFrom)
  if (!marketplaceRoot) {
    throw pluginError(plugin, 'has an unsafe or missing live marketplace root')
  }
  for (const relative of [
    '.claude-plugin/marketplace.json',
    '.plugin/marketplace.json',
    'marketplace.json',
  ]) {
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
    const root = await regularDirectory(path.resolve(marketplaceRoot, source))
    if (!root || !isWithin(marketplaceRoot, root)) {
      throw pluginError(plugin, 'has an unsafe or missing live plugin root')
    }
    return root
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
  const home = copilotHome(environment)
  const installedRoot = await regularDirectory(path.join(home, 'installed-plugins'))
  const enabled = result.plugins.filter((plugin) =>
    plugin.enabled && plugin.source !== 'builtin')
  if (!enabled.length) return []
  if (!installedRoot) {
    throw new Error('Copilot installed-plugin root is missing or unsafe')
  }
  const stored = await readStoredPlugins(path.join(home, 'config.json'))
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
    if (!name || marketplace === undefined) {
      throw new Error('Copilot SDK returned a malformed enabled plugin')
    }
    const normalized = { ...plugin, name, marketplace }
    const key = pluginKey(normalized)
    if (seen.has(key)) {
      throw new Error(`Copilot SDK returned ${pluginLabel(normalized)} twice`)
    }
    seen.add(key)
    const record = stored.get(key)
    const installedFrom = requiredString(plugin.installedFrom)
    if (!installedFrom && (!record || record.enabled === false)) {
      throw pluginError(normalized, 'is enabled at runtime but missing from managed install state')
    }
    const cachePath = installedFrom
      ? await resolveLivePluginRoot(normalized, installedFrom)
      : record?.cache_path
    if (!cachePath) {
      throw pluginError(normalized, 'has no managed cache path')
    }
    directories.push(
      ...await validatePluginRoot(
        normalized,
        cachePath,
        installedRoot,
        installedFrom,
      ),
    )
  }
  return [...new Set(directories)]
}
