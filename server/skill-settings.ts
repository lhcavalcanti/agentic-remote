import { constants } from 'node:fs'
import { lstat, mkdir, open, readdir, realpath, rename, rm } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import path from 'node:path'
import { skillNameSchema, type SkillSettingsSnapshot, type SkillToggle } from '../shared/skill-settings.js'
import { isWithin, validateSessionDirectory } from './session-directory.js'

const MAX_FILE_BYTES = 1024 * 1024
const MAX_SKILLS = 1000

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
      return bytes.subarray(0, bytesRead).toString('utf8')
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
  if (text.startsWith("'") && text.endsWith("'")) return text.slice(1, -1).replaceAll("''", "'")
  if (/^[!&*[{]/.test(text)) return ''
  return text.replace(/\s+#.*$/, '').trim()
}

/** Deliberately parses only text frontmatter, never YAML tags or executable content. */
export function skillFrontmatter(markdown: string): { name: string; description: string } | undefined {
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
  if (!skillNameSchema.safeParse(fields.name).success) return undefined
  return { name: fields.name, description: (fields.description ?? '').slice(0, 4096) }
}

function settingsObject(raw: string): Record<string, unknown> {
  if (!raw) return {}
  let value: unknown
  try { value = JSON.parse(raw) } catch { throw new SkillSettingsError('CLI settings are not valid JSON. Repair them before changing skills.') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new SkillSettingsError('CLI settings must be a JSON object.')
  for (const key of ['disabledSkills', 'skillDirectories']) {
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
  private writes: Promise<unknown> = Promise.resolve()

  constructor(private readonly options: {
    folders: () => string[]
    home?: string
    copilotHome?: string
    validateFolder?: (folder: string) => Promise<string>
    replace?: typeof rename
  }) {
    this.home = options.home ?? homedir()
    this.copilotHome = path.resolve(options.copilotHome ?? (process.env.COPILOT_HOME?.trim() || path.join(this.home, '.copilot')))
    this.validateFolder = options.validateFolder ?? validateSessionDirectory
    this.replace = options.replace ?? rename
  }

  private get file() { return path.join(this.copilotHome, 'settings.json') }
  private expand(value: string) {
    return value === '~' ? this.home : value.startsWith('~/') ? path.join(this.home, value.slice(2)) : path.resolve(this.home, value)
  }

  async snapshot(): Promise<SkillSettingsSnapshot> {
    let raw: string
    try { raw = await readBounded(this.file, true) } catch { throw new SkillSettingsError('CLI settings could not be read safely.') }
    const settings = settingsObject(raw)
    const disabled = new Set((settings.disabledSkills ?? []) as string[])
    const roots: Array<{ location: string; source: 'user' | 'configured' | 'repository'; boundary?: string }> = [
      { location: path.join(this.home, '.copilot', 'skills'), source: 'user' },
      { location: path.join(this.home, '.agents', 'skills'), source: 'user' },
    ]
    if (this.copilotHome !== path.join(this.home, '.copilot')) roots.push({ location: path.join(this.copilotHome, 'skills'), source: 'user' })
    const warnings: string[] = []
    for (const value of ((settings.skillDirectories ?? []) as string[]).slice(0, 100)) {
      try { roots.push({ location: await this.validateFolder(this.expand(value)), source: 'configured' }) }
      catch { warnings.push('A configured skill directory is unavailable or outside allowed roots.') }
    }
    for (const value of [...new Set(this.options.folders())].slice(0, 100)) {
      try {
        const folder = await this.validateFolder(this.expand(value))
        roots.push({ location: path.join(folder, '.github', 'skills'), source: 'repository', boundary: folder })
        let ancestor = folder
        for (let depth = 0; depth < 32; depth++) {
          const git = await lstat(path.join(ancestor, '.git')).catch(() => undefined)
          if (git?.isDirectory() || git?.isFile()) {
            if (ancestor !== folder) roots.push({ location: path.join(ancestor, '.github', 'skills'), source: 'repository', boundary: ancestor })
            break
          }
          const parent = path.dirname(ancestor)
          if (parent === ancestor) break
          try { ancestor = await this.validateFolder(parent) } catch { break }
        }
      } catch { warnings.push('A known repository folder is unavailable or outside allowed roots.') }
    }
    const skills: SkillSettingsSnapshot['skills'] = []
    const seen = new Set<string>()
    const skillLocations = new Set<string>()
    let examined = 0
    discovery: for (const root of roots) {
      try {
        const location = await realpath(root.location)
        if (root.boundary && !isWithin(root.boundary, location)) {
          warnings.push('A repository skill directory points outside its folder.')
          continue
        }
        if (seen.has(location)) continue
        seen.add(location)
        const direct = skillFrontmatter(await readBounded(path.join(location, 'SKILL.md'), true))
        if (direct && skills.length < MAX_SKILLS && !skillLocations.has(location)) {
          skills.push({ ...direct, location, source: root.source, enabled: !disabled.has(direct.name) })
          skillLocations.add(location)
        }
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
            const parsed = skillFrontmatter(await readBounded(path.join(directory, 'SKILL.md')))
            if (parsed && !skillLocations.has(directory)) {
              skills.push({ ...parsed, location: directory, source: root.source, enabled: !disabled.has(parsed.name) })
              skillLocations.add(directory)
            }
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
    if (!current.skills.some((skill) => skill.name === input.name)) throw new SkillSettingsError('The skill is no longer available. Refresh and try again.')
    const raw = await readBounded(this.file, true)
    if (revision(raw) !== input.revision) throw new SkillSettingsError('CLI settings changed. Refresh and confirm again.')
    const settings = settingsObject(raw)
    const disabled = new Set((settings.disabledSkills ?? []) as string[])
    if (input.enabled) disabled.delete(input.name)
    else disabled.add(input.name)
    const next = { ...settings, disabledSkills: [...disabled].sort() }
    const serialized = `${JSON.stringify(next, null, 2)}\n`
    await mkdir(this.copilotHome, { recursive: true, mode: 0o700 })
    const staged = path.join(this.copilotHome, `.settings-${randomUUID()}.json`)
    try {
      const handle = await open(staged, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600)
      try { await handle.writeFile(serialized); await handle.sync() }
      finally { await handle.close() }
      if (revision(await readBounded(this.file, true)) !== input.revision) throw new SkillSettingsError('CLI settings changed. Refresh and confirm again.')
      await this.replace(staged, this.file)
    } finally { await rm(staged, { force: true }) }
    return {
      ...current,
      revision: revision(serialized),
      skills: current.skills.map((skill) => skill.name === input.name ? { ...skill, enabled: input.enabled } : skill),
    }
  }
}
