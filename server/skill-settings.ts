import { constants } from 'node:fs'
import { lstat, mkdir, open, readdir, realpath, rename, rm } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import path from 'node:path'
import { skillFrontmatterNameSchema, type SkillSettingsSnapshot, type SkillToggle } from '../shared/skill-settings.js'
import { isWithin, validateSessionDirectory } from './session-directory.js'
import { parseSkillSettings, replaceDisabledSkills } from './skill-settings-jsonc.js'
import { builtinSkillDirectories } from './skill-builtin-roots.js'

const MAX_FILE_BYTES = 1024 * 1024
const MAX_SKILLS = 1000
type SkillRoot = { location: string; source: SkillSettingsSnapshot['skills'][number]['source']; boundary?: string; plugin?: string; trusted?: boolean; single?: boolean }

export class SkillSettingsError extends Error {
  constructor(message: string, readonly statusCode = 409) { super(message) }
}

async function readBounded(file: string, missing = false): Promise<string> {
  try {
    const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
    try {
      const metadata = await handle.stat()
      if (!metadata.isFile() || metadata.size > MAX_FILE_BYTES) throw new SkillSettingsError('Skill settings contain an invalid or oversized file.')
      const bytes = Buffer.alloc(MAX_FILE_BYTES + 1)
      const { bytesRead } = await handle.read(bytes, 0, bytes.length, 0)
      if (bytesRead > MAX_FILE_BYTES) throw new SkillSettingsError('Skill settings contain an oversized file.')
      try {
        // Keep a leading BOM so a safe edit cannot silently remove its bytes.
        return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes.subarray(0, bytesRead))
      } catch {
        throw new SkillSettingsError('CLI settings could not be read safely: invalid UTF-8. Edit the file manually before changing skills.')
      }
    } finally { await handle.close() }
  } catch (error) {
    if (missing && (error as NodeJS.ErrnoException).code === 'ENOENT') return ''
    throw error
  }
}

function scalar(value: string): string {
  const text = value.trim()
  if (text.startsWith('"')) {
    try { const parsed: unknown = JSON.parse(text); return typeof parsed === 'string' ? parsed : '' } catch { return '' }
  }
  if (text.startsWith("'")) return /^'(?:[^']|'')*'$/.test(text) ? text.slice(1, -1).replaceAll("''", "'") : ''
  if (/^[!&*[{]/.test(text) || /:\s|:$/.test(text) ||
    /^(?:true|false|null|~|[-+]?(?:0[xob][\da-f]+|\d+(?:\.\d*)?(?:e[-+]?\d+)?|\.inf|\.nan))$/i.test(text)) return ''
  return text.replace(/\s+#.*$/, '').trim()
}

/** Deliberately parses only text frontmatter, never YAML tags or executable content. */
function frontmatterFields(markdown: string): Record<string, string> | undefined {
  const lines = markdown.replace(/^\uFEFF/, '').split(/\r?\n/)
  if (lines[0] !== '---') return undefined
  const end = lines.indexOf('---', 1)
  if (end < 0) return undefined
  const fields: Record<string, string> = {}
  for (let index = 1; index < end; index++) {
    const match = /^(name|description):\s*(.*)$/.exec(lines[index])
    if (!match) continue
    if (Object.hasOwn(fields, match[1])) return undefined
    if (/^[>|][-+]?$/.test(match[2])) {
      const block: string[] = []
      while (index + 1 < end && (/^\s/.test(lines[index + 1]) || lines[index + 1] === '')) block.push(lines[++index].trim())
      fields[match[1]] = block.join(match[2][0] === '>' ? ' ' : '\n').trim()
    } else fields[match[1]] = scalar(match[2])
  }
  return fields
}

function frontmatterReason(fields: Record<string, string> | undefined): string | undefined {
  if (!fields) return 'SKILL.md frontmatter is missing or uses unsupported text syntax.'
  if (!skillFrontmatterNameSchema.safeParse(fields.name).success) return 'SKILL.md frontmatter name must start with a letter or number, use only letters, numbers, hyphens, underscores, dots, colons or spaces, and be at most 64 characters.'
  if (!fields.description || fields.description.length > 1024) return 'SKILL.md frontmatter description is required and must be at most 1024 characters.'
}

export function skillFrontmatter(markdown: string): { name: string; description: string } | undefined {
  const fields = frontmatterFields(markdown)
  return !frontmatterReason(fields) && fields ? { name: fields.name, description: fields.description } : undefined
}

function settingsObject(raw: string): Record<string, unknown> {
  if (!raw) return {}
  let value: unknown
  try { value = parseSkillSettings(raw) } catch (error) {
    throw new SkillSettingsError(error instanceof Error ? error.message : 'CLI settings are not valid JSONC. Edit them manually.')
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new SkillSettingsError('CLI settings must be a JSON object.')
  for (const key of ['disabledSkills', 'skillDirectories', 'ignoredSkillsLocations']) {
    const entries = Reflect.get(value, key)
    if (entries !== undefined && (!Array.isArray(entries) || entries.length > 10_000 || entries.some((entry) => typeof entry !== 'string'))) {
      throw new SkillSettingsError(`CLI ${key} must be a list of strings.`)
    }
  }
  return value as Record<string, unknown>
}

const revision = (raw: string) => createHash('sha256').update(raw).digest('hex')

export class SkillSettingsService {
  private readonly home: string
  private readonly copilotHome: string
  private readonly validateFolder: (folder: string) => Promise<string>
  private readonly replace: typeof rename
  private readonly env: NodeJS.ProcessEnv
  private writes: Promise<unknown> = Promise.resolve()

  constructor(private readonly options: {
    folders: () => string[]
    home?: string
    copilotHome?: string
    validateFolder?: (folder: string) => Promise<string>
    replace?: typeof rename
    env?: NodeJS.ProcessEnv
  }) {
    this.home = options.home ?? homedir()
    this.env = options.env ?? process.env
    this.copilotHome = path.resolve(options.copilotHome ?? (this.env.COPILOT_HOME?.trim() || path.join(this.home, '.copilot')))
    this.validateFolder = options.validateFolder ?? validateSessionDirectory
    this.replace = options.replace ?? rename
  }

  private get file() { return path.join(this.copilotHome, 'settings.json') }
  private expand(value: string) {
    return value === '~' ? this.home : value.startsWith('~/') ? path.join(this.home, value.slice(2)) : path.resolve(this.home, value)
  }

  async snapshot(): Promise<SkillSettingsSnapshot> {
    let raw: string
    try { raw = await readBounded(this.file, true) } catch (error) {
      if (error instanceof SkillSettingsError) throw error
      throw new SkillSettingsError('CLI settings could not be read safely.')
    }
    const settings = settingsObject(raw)
    const disabled = new Set(((settings.disabledSkills ?? []) as string[]).map((name) => name.toLowerCase()))
    const repositoryDisabled = new Set<string>()
    const roots: SkillRoot[] = [
      { location: path.join(this.copilotHome, 'skills'), source: 'user' },
      { location: path.join(this.home, '.agents', 'skills'), source: 'user' },
    ]
    const warnings: string[] = []
    const ignoredLocations = [...((settings.ignoredSkillsLocations ?? []) as string[])]
    const configured = [
      ...((settings.skillDirectories ?? []) as string[]),
      ...(this.env.COPILOT_SKILLS_DIRS?.split(',').map((entry) => entry.trim()).filter(Boolean) ?? []),
    ]
    let trustedFolders: string[] = []
    try {
      const state = settingsObject(await readBounded(path.join(this.copilotHome, 'config.json'), true))
      if (Array.isArray(state.trustedFolders)) trustedFolders = state.trustedFolders.filter((folder): folder is string => typeof folder === 'string').map((folder) => this.expand(folder))
    } catch { warnings.push('CLI folder trust could not be read; repository skills cannot be managed.') }
    const repositoryFolders = new Map<string, boolean>()
    for (const value of [...new Set(this.options.folders())].slice(0, 100)) {
      try {
        let folder = await this.validateFolder(this.expand(value))
        const trusted = trustedFolders.some((root) => isWithin(root, folder))
        for (let depth = 0; depth < 32; depth++) {
          repositoryFolders.set(folder, repositoryFolders.get(folder) === true || trusted)
          const git = await lstat(path.join(folder, '.git')).catch(() => undefined)
          if (git?.isDirectory() || git?.isFile()) break
          const parent = path.dirname(folder)
          if (parent === folder) break
          try { folder = await this.validateFolder(parent) } catch { break }
        }
      } catch { warnings.push('A known repository folder is unavailable or outside allowed roots.') }
    }
    for (const [folder, trusted] of repositoryFolders) {
      for (const directory of ['.github', '.agents', '.claude']) roots.push({
        location: path.join(folder, directory, 'skills'), source: 'repository', boundary: folder, trusted,
      })
      if (!trusted) continue
      for (const file of ['settings.json', 'settings.local.json']) {
        try {
          const directory = await realpath(path.join(folder, '.github', 'copilot'))
          if (!isWithin(folder, directory)) throw new Error('Repository settings escape')
          const repositorySettings = settingsObject(await readBounded(path.join(directory, file), true))
          for (const name of (repositorySettings.disabledSkills ?? []) as string[]) repositoryDisabled.add(name.toLowerCase())
          ignoredLocations.push(...((repositorySettings.ignoredSkillsLocations ?? []) as string[]).map((value) => path.isAbsolute(value) || value.startsWith('~') ? value : path.resolve(folder, value)))
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw new SkillSettingsError('Repository CLI settings could not be read safely. Edit them manually before changing skills.')
        }
      }
    }
    for (const value of configured.slice(0, 100)) {
      if (!path.isAbsolute(value) && value !== '~' && !value.startsWith('~/')) {
        warnings.push('A relative configured skill directory is ambiguous in a computer-wide view. Use an absolute path or ~/ in CLI settings.')
        continue
      }
      try { roots.push({ location: await this.validateFolder(this.expand(value)), source: 'configured' }) }
      catch { warnings.push('A configured skill directory is unavailable or outside allowed roots.') }
    }
    const installed = path.join(this.copilotHome, 'installed-plugins')
    const installedBoundary = await realpath(installed).catch(() => installed)
    let pluginDirectories = 0
    const visitPlugins = async (directory: string, depth = 0): Promise<void> => {
      if (depth > 3 || ++pluginDirectories > 1024) return
      try {
        const location = await realpath(directory)
        if (!isWithin(installedBoundary, location)) return
        const rootManifest = await readBounded(path.join(location, 'plugin.json'), true)
        const rootSchema = rootManifest ? settingsObject(rootManifest).$schema : undefined
        const agentPlugin = typeof rootSchema === 'string' && /^https:\/\/agent-plugins\.org\/schemas\/1\.[01]\.0\/plugin\.schema\.json$/.test(rootSchema)
        if (typeof rootSchema === 'string' && rootSchema.startsWith('https://agent-plugins.org/') && !agentPlugin) {
          warnings.push('An installed plugin uses an unsupported manifest schema and was skipped.')
          return
        }
        for (const manifest of agentPlugin ? ['plugin.json'] : ['.plugin/plugin.json', 'plugin.json', '.github/plugin/plugin.json', '.claude-plugin/plugin.json']) {
          const raw = await readBounded(path.join(location, manifest), true)
          if (!raw) continue
          const plugin = settingsObject(raw)
          if (!skillFrontmatterNameSchema.safeParse(plugin.name).success) {
            warnings.push('An installed plugin has an invalid name and was skipped.')
            return
          }
          const name = plugin.name as string
          const enabled = settings.enabledPlugins
          if (enabled && typeof enabled === 'object' && Object.entries(enabled).some(([key, value]) => value === false && (key === name || key.startsWith(`${name}@`)))) return
          const locations = agentPlugin || plugin.skills === undefined ? ['skills'] : typeof plugin.skills === 'string' ? [plugin.skills] : plugin.skills
          if (!Array.isArray(locations) || locations.some((value) => typeof value !== 'string')) {
            warnings.push('An installed plugin has unsupported skill directories and was skipped.')
            return
          }
          for (const value of locations.slice(0, 100)) roots.push({ location: path.resolve(location, value as string), source: 'plugin', plugin: name, boundary: location })
          if (!agentPlugin && plugin.skills === undefined && !(await lstat(path.join(location, 'skills')).catch(() => undefined))) {
            roots.push({ location, source: 'plugin', plugin: name, boundary: location, single: true })
          }
          return
        }
        for (const entry of (await readdir(location, { withFileTypes: true })).slice(0, 1024)) {
          if (entry.isDirectory() && !entry.name.startsWith('.')) await visitPlugins(path.join(location, entry.name), depth + 1)
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') warnings.push('An installed plugin could not be read safely.')
      }
    }
    await visitPlugins(installed)
    for (const location of await builtinSkillDirectories(this.home, this.env)) roots.push({ location, source: 'builtin' })
    const ignored = new Set<string>()
    for (const value of ignoredLocations.slice(0, 1000)) {
      if (!path.isAbsolute(value) && value !== '~' && !value.startsWith('~/')) {
        throw new SkillSettingsError('A relative ignoredSkillsLocations path is ambiguous in a computer-wide view. Edit it manually to an absolute path or ~/.')
      }
      const location = this.expand(value)
      ignored.add(location)
      ignored.add(await realpath(location).catch(() => location))
    }
    const excluded = (location: string) => [...ignored].some((root) => isWithin(root, location))
    const skills: SkillSettingsSnapshot['skills'] = []
    const seen = new Set<string>()
    const skillLocations = new Set<string>()
    let examined = 0
    const discoverSkill = async (directory: string, root: SkillRoot) => {
      if (excluded(directory) || skillLocations.has(directory) || skills.length >= MAX_SKILLS) return
      try {
        const fields = frontmatterFields(await readBounded(path.join(directory, 'SKILL.md')))
        const invalid = frontmatterReason(fields)
        const parsedName = skillFrontmatterNameSchema.safeParse(fields?.name)
        const bare = parsedName.success ? parsedName.data : `invalid-${createHash('sha256').update(directory).digest('hex').slice(0, 16)}`
        const name = root.plugin ? `${root.plugin}:${bare}` : bare
        const fromRepository = repositoryDisabled.has(name.toLowerCase()) || repositoryDisabled.has(bare.toLowerCase())
        const blanketDisabled = Boolean(root.plugin && disabled.has(bare.toLowerCase()))
        const reason = invalid ?? (root.trusted === false ? 'The repository is not permanently trusted by Copilot CLI; trust it in the CLI before managing its skills.'
          : fromRepository ? 'A trusted repository disables this skill. Edit its CLI settings manually to enable it.'
          : blanketDisabled ? 'The bare skill name is disabled for every plugin. Enable that name in the CLI before managing this plugin-qualified skill.' : undefined)
        skills.push({
          name, description: (fields?.description ?? '').slice(0, 4096), location: directory, source: root.source,
          enabled: !reason && !disabled.has(name.toLowerCase()), manageable: !reason, ...(reason ? { reason } : {}),
        })
        skillLocations.add(directory)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') warnings.push('A skill could not be read safely and was skipped.')
      }
    }
    if (roots.length > 1024) warnings.push('Skill discovery reached the skill-directory limit.')
    discovery: for (const root of roots.slice(0, 1024)) {
      try {
        const location = await realpath(root.location)
        if (root.boundary && !isWithin(root.boundary, location)) {
          warnings.push('A repository skill directory points outside its folder.')
          continue
        }
        if (seen.has(location) || excluded(location)) continue
        seen.add(location)
        await discoverSkill(location, root)
        if (root.single) continue
        const entries = (await readdir(location, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name)).slice(0, MAX_SKILLS)
        for (const entry of entries) {
          if (++examined > 4096) {
            warnings.push('Skill discovery reached the directory entry limit.')
            break discovery
          }
          if (skills.length >= MAX_SKILLS) break
          if (!entry.isDirectory()) continue
          try {
            const directory = await realpath(path.join(location, entry.name))
            if (!isWithin(location, directory)) continue
            await discoverSkill(directory, root)
          } catch { warnings.push('A skill could not be read safely and was skipped.') }
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') warnings.push('A skill directory could not be read safely.')
      }
    }
    if (skills.length >= MAX_SKILLS) warnings.push('Skill discovery reached the 1,000 skill limit.')
    return { revision: revision(raw), skills, warnings: [...new Set(warnings)].slice(0, 100) }
  }

  update(input: SkillToggle): Promise<SkillSettingsSnapshot> {
    const work = this.writes.catch(() => undefined).then(() => this.write(input))
    this.writes = work
    return work
  }

  private async write(input: SkillToggle): Promise<SkillSettingsSnapshot> {
    if (input.confirmed !== true) throw new SkillSettingsError('Confirm the computer-wide CLI effect before changing skills.', 400)
    const current = await this.snapshot()
    if (current.revision !== input.revision) throw new SkillSettingsError('CLI settings changed. Refresh and confirm again.')
    const matches = current.skills.filter((skill) => skill.name.toLowerCase() === input.name.toLowerCase())
    if (!matches.length) throw new SkillSettingsError('The skill is no longer available. Refresh and try again.')
    const target = matches.find((skill) => skill.manageable !== false)
    if (!target) throw new SkillSettingsError(matches[0].reason ?? 'This skill cannot be managed. Edit its CLI settings manually.')
    const raw = await readBounded(this.file, true)
    if (revision(raw) !== input.revision) throw new SkillSettingsError('CLI settings changed. Refresh and confirm again.')
    const settings = settingsObject(raw)
    const disabled = new Set(((settings.disabledSkills ?? []) as string[]).filter((name) => name.toLowerCase() !== target.name.toLowerCase()))
    if (!input.enabled) disabled.add(target.name)
    let serialized: string
    try { serialized = replaceDisabledSkills(raw, [...disabled].sort()) }
    catch (error) { throw new SkillSettingsError(error instanceof Error ? error.message : 'Edit disabledSkills manually.') }
    await mkdir(this.copilotHome, { recursive: true, mode: 0o700 })
    const staged = path.join(this.copilotHome, `.settings-${randomUUID()}.json`)
    try {
      const handle = await open(staged, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600)
      try { await handle.writeFile(serialized); await handle.sync() }
      finally { await handle.close() }
      if (revision(await readBounded(this.file, true)) !== input.revision) throw new SkillSettingsError('CLI settings changed. Refresh and confirm again.')
      await this.replace(staged, this.file)
    } finally { await rm(staged, { force: true }) }
    return this.snapshot()
  }
}
