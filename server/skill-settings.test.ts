import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SkillSettingsService, skillFrontmatter } from './skill-settings.js'

let home: string
let copilotHome: string
let repository: string
let service: SkillSettingsService
async function skill(root: string, name: string, content = `---\nname: ${name}\ndescription: A fictional ${name} skill.\n---\nNever execute this body.\n`) {
  const directory = path.join(root, name)
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, 'SKILL.md'), content)
  return directory
}
beforeEach(async () => {
  home = path.resolve(`.agentic-skills-${randomUUID()}`)
  copilotHome = path.join(home, '.copilot')
  repository = path.join(home, 'repository')
  await mkdir(repository, { recursive: true })
  service = new SkillSettingsService({ home, copilotHome, folders: () => [repository], validateFolder: async (folder) => {
    if (!folder.startsWith(home)) throw new Error('Outside roots')
    return folder
  } })
})
afterEach(async () => { await rm(home, { recursive: true, force: true }) })

describe('read-only skill discovery and settings changes', () => {
  it.each([
    '{\n  // retain this explanation\n  "theme": "https://example.test/a//b",\n  "disabledSkills": [], // retain this too\n}\n',
    '{"nested":{"disabledSkills":["untouched"],},"disabledSkills":[],}',
    '{/* keep */"theme":"dark",}',
    '{}',
  ])('reads JSONC and changes only the disabledSkills value: %s', async (raw) => {
    await skill(path.join(copilotHome, 'skills'), 'sample')
    const file = path.join(copilotHome, 'settings.json')
    await writeFile(file, raw)
    const snapshot = await service.snapshot()
    await service.update({ name: 'sample', enabled: false, confirmed: true, revision: snapshot.revision })
    const written = await readFile(file, 'utf8')
    if (raw.includes('"disabledSkills":[]')) expect(written).toBe(raw.replace(/"disabledSkills":\[\](?=[,}])/, '"disabledSkills":["sample"]'))
    else if (raw.includes('"disabledSkills": []')) expect(written).toBe(raw.replace('"disabledSkills": []', '"disabledSkills": ["sample"]'))
    else expect(written).toContain(raw.slice(0, -1))
    expect((await service.snapshot()).skills[0].enabled).toBe(false)
  })

  it.each([
    '{"disabledSkills":[/* keep entry explanation */]}',
    '{"disabledSkills":[],"disabledSkills":[]}',
  ])('refuses writes that would lose comments or retain ambiguous keys', async (raw) => {
    await skill(path.join(copilotHome, 'skills'), 'sample')
    const file = path.join(copilotHome, 'settings.json')
    await writeFile(file, raw)
    const snapshot = await service.snapshot()
    await expect(service.update({ name: 'sample', enabled: false, confirmed: true, revision: snapshot.revision })).rejects.toThrow(/manually/)
    expect(await readFile(file, 'utf8')).toBe(raw)
  })

  it('parses quoted and block text frontmatter without executing body, tags or expressions', () => {
    expect(skillFrontmatter('---\nname: sample\ndescription: >-\n  First line\n  second line\n---\n$(touch bad)')).toEqual({ name: 'sample', description: 'First line second line' })
    expect(skillFrontmatter("---\nname: 'sample'\ndescription: 'It''s safe'\n---")).toEqual({ name: 'sample', description: "It's safe" })
    expect(skillFrontmatter('---\nname: !execute command\ndescription: text\n---')).toBeUndefined()
    expect(skillFrontmatter('---\nname: sample\nname: duplicate\n---')).toBeUndefined()
  })

  it('discovers both user roots, configured directories and known repository skills without changing them', async () => {
    await skill(path.join(copilotHome, 'skills'), 'user-skill')
    await skill(path.join(home, '.agents', 'skills'), 'agents-skill')
    await skill(path.join(home, 'configured'), 'configured-skill')
    const directory = await skill(path.join(repository, '.github', 'skills'), 'repository-skill')
    const before = await readFile(path.join(directory, 'SKILL.md'), 'utf8')
    await writeFile(path.join(copilotHome, 'settings.json'), JSON.stringify({ skillDirectories: ['~/configured'], disabledSkills: ['repository-skill'] }))
    const snapshot = await service.snapshot()
    expect(snapshot.skills.map((entry) => entry.name).sort()).toEqual(['agents-skill', 'configured-skill', 'repository-skill', 'user-skill'])
    expect(snapshot.skills.find((entry) => entry.name === 'repository-skill')).toMatchObject({ enabled: false, source: 'repository' })
    await service.update({ name: 'repository-skill', enabled: true, confirmed: true, revision: snapshot.revision })
    expect(await readFile(path.join(directory, 'SKILL.md'), 'utf8')).toBe(before)
  })

  it('atomically preserves unrelated settings, retains unknown disabled skills and uses owner-only mode', async () => {
    await skill(path.join(copilotHome, 'skills'), 'sample')
    const original = { theme: 'dark', nested: { retained: true }, disabledSkills: ['uninstalled-skill'] }
    await writeFile(path.join(copilotHome, 'settings.json'), JSON.stringify(original))
    const before = await service.snapshot()
    const after = await service.update({ name: 'sample', enabled: false, confirmed: true, revision: before.revision })
    expect(after.skills[0].enabled).toBe(false)
    expect(JSON.parse(await readFile(path.join(copilotHome, 'settings.json'), 'utf8'))).toEqual({ ...original, disabledSkills: ['sample', 'uninstalled-skill'] })
    expect((await stat(path.join(copilotHome, 'settings.json'))).mode & 0o777).toBe(0o600)
    expect((await readdir(copilotHome)).filter((name) => name.startsWith('.settings-'))).toEqual([])
  })

  it('recognizes a configured skill itself and a repository root above a known subfolder', async () => {
    const configured = await skill(path.join(home, 'configured'), 'direct-skill')
    await mkdir(path.join(repository, '.git'))
    const nested = path.join(repository, 'src', 'nested')
    await mkdir(nested, { recursive: true })
    await skill(path.join(repository, '.github', 'skills'), 'repository-skill')
    await mkdir(copilotHome)
    await writeFile(path.join(copilotHome, 'settings.json'), JSON.stringify({ skillDirectories: [configured] }))
    const discovery = new SkillSettingsService({ home, copilotHome, folders: () => [nested], validateFolder: async (folder) => {
      if (!folder.startsWith(home)) throw new Error('Outside roots')
      return folder
    } })
    expect((await discovery.snapshot()).skills.map((entry) => entry.name).sort()).toEqual(['direct-skill', 'repository-skill'])
  })

  it('rejects stale and concurrent writes, then permits a refresh without losing keys', async () => {
    await skill(path.join(copilotHome, 'skills'), 'first')
    await skill(path.join(copilotHome, 'skills'), 'second')
    const snapshot = await service.snapshot()
    const writes = await Promise.allSettled(['first', 'second'].map((name) => service.update({ name, enabled: false, confirmed: true, revision: snapshot.revision })))
    expect(writes.map((entry) => entry.status)).toEqual(['fulfilled', 'rejected'])
    const latest = await service.snapshot()
    await service.update({ name: 'second', enabled: false, confirmed: true, revision: latest.revision })
    expect((await service.snapshot()).skills.every((entry) => !entry.enabled)).toBe(true)
    const external = { ...JSON.parse(await readFile(path.join(copilotHome, 'settings.json'), 'utf8')), externallyChanged: true }
    await writeFile(path.join(copilotHome, 'settings.json'), JSON.stringify(external))
    await expect(service.update({ name: 'first', enabled: true, confirmed: true, revision: latest.revision })).rejects.toThrow('changed')
    expect(JSON.parse(await readFile(path.join(copilotHome, 'settings.json'), 'utf8'))).toEqual(external)
  })

  it('leaves the old file intact and cleans staging files when atomic replacement fails', async () => {
    await skill(path.join(copilotHome, 'skills'), 'sample')
    await writeFile(path.join(copilotHome, 'settings.json'), '{"retained":true}')
    const failing = new SkillSettingsService({ home, copilotHome, folders: () => [], replace: vi.fn().mockRejectedValue(new Error('disk refusal')) })
    const snapshot = await failing.snapshot()
    await expect(failing.update({ name: 'sample', enabled: false, confirmed: true, revision: snapshot.revision })).rejects.toThrow('disk refusal')
    expect(await readFile(path.join(copilotHome, 'settings.json'), 'utf8')).toBe('{"retained":true}')
    expect((await readdir(copilotHome)).filter((name) => name.startsWith('.settings-'))).toEqual([])
  })

  it('refuses malformed settings and symlink targets rather than overwriting them', async () => {
    await mkdir(copilotHome)
    const file = path.join(copilotHome, 'settings.json')
    await writeFile(file, '{ invalid')
    await expect(service.snapshot()).rejects.toThrow('valid JSON')
    await rm(file)
    const target = path.join(repository, 'settings.json')
    await writeFile(target, '{"untouched":true}')
    await symlink(target, file)
    await expect(service.snapshot()).rejects.toThrow('safely')
    expect(await readFile(target, 'utf8')).toBe('{"untouched":true}')
  })

  it('skips repository escapes, symlink skill files and denied configured roots', async () => {
    await mkdir(path.join(repository, '.github'), { recursive: true })
    await skill(path.join(home, 'outside'), 'outside-skill')
    await symlink(path.join(home, 'outside'), path.join(repository, '.github', 'skills'))
    const safe = await skill(path.join(copilotHome, 'skills'), 'safe')
    await rm(path.join(safe, 'SKILL.md'))
    await symlink(path.join(home, 'outside', 'outside-skill', 'SKILL.md'), path.join(safe, 'SKILL.md'))
    await writeFile(path.join(copilotHome, 'settings.json'), JSON.stringify({ skillDirectories: ['/denied'] }))
    const snapshot = await service.snapshot()
    expect(snapshot.skills).toEqual([])
    expect(snapshot.warnings).toContain('A repository skill directory points outside its folder.')
    expect(snapshot.warnings).toContain('A configured skill directory is unavailable or outside allowed roots.')
  })
})
