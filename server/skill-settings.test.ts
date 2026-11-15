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
  await mkdir(copilotHome)
  await writeFile(path.join(copilotHome, 'config.json'), JSON.stringify({ trustedFolders: [repository] }))
  service = new SkillSettingsService({ home, copilotHome, env: {}, folders: () => [repository], validateFolder: async (folder) => {
    if (!folder.startsWith(home)) throw new Error('Outside roots')
    return folder
  } })
})
afterEach(async () => { await rm(home, { recursive: true, force: true }) })

describe('read-only skill discovery and settings changes', () => {
  it('scans all three project roots at every level through the repository boundary', async () => {
    const nested = path.join(repository, 'src', 'package')
    await mkdir(path.join(repository, '.git'))
    await mkdir(nested, { recursive: true })
    for (const [level, folder] of [repository, path.dirname(nested), nested].entries()) {
      for (const root of ['.github', '.agents', '.claude']) await skill(path.join(folder, root, 'skills'), `${root.slice(1)}-${level}`)
    }
    const discovery = new SkillSettingsService({ home, copilotHome, env: {}, folders: () => [nested], validateFolder: async (folder) => folder })
    expect((await discovery.snapshot()).skills.map((entry) => entry.name).sort()).toEqual(
      ['github', 'agents', 'claude'].flatMap((root) => [0, 1, 2].map((level) => `${root}-${level}`)).sort(),
    )
  })

  it('uses the custom Copilot home instead of stale default personal skills', async () => {
    await skill(path.join(copilotHome, 'skills'), 'stale-default')
    const custom = path.join(home, 'custom-copilot')
    await skill(path.join(custom, 'skills'), 'custom-personal')
    await skill(path.join(home, '.agents', 'skills'), 'shared-personal')
    await skill(path.join(home, '.claude', 'skills'), 'not-a-cli-source')
    const discovery = new SkillSettingsService({ home, copilotHome: custom, env: {}, folders: () => [] })
    expect((await discovery.snapshot()).skills.map((entry) => entry.name).sort()).toEqual(['custom-personal', 'shared-personal'])
  })

  it('discovers plugin-qualified, environment and packaged built-in skills', async () => {
    for (const [marketplace, plugin] of [['fictional', 'alpha'], ['_direct', 'beta']]) {
      const root = path.join(copilotHome, 'installed-plugins', marketplace, plugin)
      await mkdir(path.join(root, '.claude-plugin'), { recursive: true })
      await writeFile(path.join(root, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: plugin }))
      await skill(path.join(root, 'skills'), 'review')
    }
    await skill(path.join(home, 'environment'), 'environment-skill')
    const cli = path.join(home, 'cli')
    await mkdir(cli)
    await writeFile(path.join(cli, 'copilot'), 'Fixture executable; never run.')
    await skill(path.join(cli, 'builtin-skills'), 'bundled-skill')
    const discovery = new SkillSettingsService({
      home, copilotHome, folders: () => [], env: { COPILOT_SKILLS_DIRS: '~/environment', PATH: cli },
      validateFolder: async (folder) => folder,
    })
    await writeFile(path.join(copilotHome, 'settings.json'), '{"disabledSkills":["ALPHA:REVIEW","unknown-skill"]}')
    const snapshot = await discovery.snapshot()
    expect(snapshot.skills.map((entry) => [entry.name, entry.source, entry.enabled]).sort()).toEqual([
      ['alpha:review', 'plugin', false], ['beta:review', 'plugin', true],
      ['bundled-skill', 'builtin', true], ['environment-skill', 'configured', true],
    ])
    await discovery.update({ name: 'alpha:review', enabled: true, confirmed: true, revision: snapshot.revision })
    expect(JSON.parse(await readFile(path.join(copilotHome, 'settings.json'), 'utf8')).disabledSkills).toEqual(['unknown-skill'])
  })

  it('honors ignored directories and their descendants, including canonical aliases', async () => {
    const ignored = await skill(path.join(copilotHome, 'skills'), 'excluded')
    await skill(path.join(copilotHome, 'skills'), 'visible')
    await skill(path.join(home, 'excluded-container'), 'hidden-child')
    await symlink(path.join(home, 'excluded-container'), path.join(home, 'alias'))
    await writeFile(path.join(copilotHome, 'settings.json'), JSON.stringify({
      skillDirectories: ['~/alias'], ignoredSkillsLocations: [ignored, '~/excluded-container'],
    }))
    const snapshot = await service.snapshot()
    expect(snapshot.skills.map((entry) => entry.name)).toEqual(['visible'])
    await expect(service.update({ name: 'excluded', enabled: false, confirmed: true, revision: snapshot.revision })).rejects.toThrow('no longer available')
  })

  it('matches disabled names in any case and respects trusted repository restrictions', async () => {
    await skill(path.join(copilotHome, 'skills'), 'sample')
    await skill(path.join(repository, '.agents', 'skills'), 'repository-skill')
    await mkdir(path.join(repository, '.github', 'copilot'), { recursive: true })
    await writeFile(path.join(repository, '.github', 'copilot', 'settings.local.json'), '{"disabledSkills":["REPOSITORY-SKILL"]}')
    const file = path.join(copilotHome, 'settings.json')
    await writeFile(file, '{"disabledSkills":["SAMPLE","Sample","unknown"]}')
    const before = await service.snapshot()
    expect(before.skills.find((entry) => entry.name === 'sample')?.enabled).toBe(false)
    expect(before.skills.find((entry) => entry.name === 'repository-skill')).toMatchObject({ enabled: false, manageable: false, reason: expect.stringMatching(/repository/i) })
    await expect(service.update({ name: 'repository-skill', enabled: true, confirmed: true, revision: before.revision })).rejects.toThrow(/repository/i)
    await service.update({ name: 'sample', enabled: true, confirmed: true, revision: before.revision })
    expect(JSON.parse(await readFile(file, 'utf8')).disabledSkills).toEqual(['unknown'])
  })

  it.each([
    ['missing-description', 'name: sample', /description/i],
    ['unsupported-name', 'name: slash/name\ndescription: Valid text', /name/i],
    ['long-name', `name: ${'x'.repeat(65)}\ndescription: Valid text`, /name/i],
    ['long-description', `name: sample\ndescription: ${'x'.repeat(1025)}`, /description/i],
  ])('lists %s frontmatter as unmanageable instead of offering an ineffective toggle', async (folder, fields, reason) => {
    await skill(path.join(copilotHome, 'skills'), folder, `---\n${fields}\n---\nDo not execute.`)
    const snapshot = await service.snapshot()
    expect(snapshot.skills).toHaveLength(1)
    expect(snapshot.skills[0]).toMatchObject({ manageable: false, reason: expect.stringMatching(reason), enabled: false })
    await expect(service.update({ name: snapshot.skills[0].name, enabled: true, confirmed: true, revision: snapshot.revision })).rejects.toThrow(/frontmatter/i)
  })

  it('accepts the CLI name alphabet, including case, namespaces, dots, underscores and spaces', () => {
    expect(skillFrontmatter('---\nname: "My Plugin:review_code.v2"\ndescription: Valid text\n---'))
      .toEqual({ name: 'My Plugin:review_code.v2', description: 'Valid text' })
  })

  it('keeps untrusted repository skills read-only without granting folder trust', async () => {
    await skill(path.join(repository, '.claude', 'skills'), 'project-skill')
    await writeFile(path.join(copilotHome, 'config.json'), '{"trustedFolders":[]}')
    const snapshot = await service.snapshot()
    expect(snapshot.skills[0]).toMatchObject({ manageable: false, enabled: false, reason: expect.stringMatching(/not permanently trusted/) })
    await expect(service.update({ name: 'project-skill', enabled: false, confirmed: true, revision: snapshot.revision })).rejects.toThrow('not permanently trusted')
    expect(await readFile(path.join(copilotHome, 'config.json'), 'utf8')).toBe('{"trustedFolders":[]}')
  })

  it('handles legacy plugin skill paths, disabled plugins and blanket skill restrictions conservatively', async () => {
    const root = path.join(copilotHome, 'installed-plugins', 'fictional', 'plugin')
    await mkdir(path.join(root, '.plugin'), { recursive: true })
    await writeFile(path.join(root, '.plugin', 'plugin.json'), '{"name":"plugin","skills":["custom"]}')
    await skill(path.join(root, 'custom'), 'review')
    const file = path.join(copilotHome, 'settings.json')
    await writeFile(file, '{"disabledSkills":["REVIEW"]}')
    const snapshot = await service.snapshot()
    expect(snapshot.skills[0]).toMatchObject({ name: 'plugin:review', enabled: false, manageable: false, reason: expect.stringMatching(/bare skill name/) })
    await expect(service.update({ name: 'plugin:review', enabled: true, confirmed: true, revision: snapshot.revision })).rejects.toThrow('bare skill name')
    await writeFile(file, '{"enabledPlugins":{"plugin@fictional":false}}')
    expect((await service.snapshot()).skills).toEqual([])
  })

  it.each(['{,}', '{"disabledSkills":[,]}', '{"disabledSkills":[1,,]}', '{"text":"unterminated}', '{/* unterminated'])('rejects invalid JSONC without repairing it: %s', async (raw) => {
    await writeFile(path.join(copilotHome, 'settings.json'), raw)
    await expect(service.snapshot()).rejects.toThrow(/valid JSONC|list of strings/)
    expect(await readFile(path.join(copilotHome, 'settings.json'), 'utf8')).toBe(raw)
  })

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

  it('toggles a skill in a commented array without losing entry explanations', async () => {
    await skill(path.join(copilotHome, 'skills'), 'sample')
    const file = path.join(copilotHome, 'settings.json')
    await writeFile(file, '{"disabledSkills":[/* keep entry explanation */]}')
    const before = await service.snapshot()
    const disabled = await service.update({ name: 'sample', enabled: false, confirmed: true, revision: before.revision })
    expect(disabled.skills[0].enabled).toBe(false)
    const enabled = await service.update({ name: 'sample', enabled: true, confirmed: true, revision: disabled.revision })
    expect(enabled.skills[0].enabled).toBe(true)
    expect(await readFile(file, 'utf8')).toContain('/* keep entry explanation */')
  })

  it('refuses writes with ambiguous duplicate keys', async () => {
    const raw = '{"disabledSkills":[],"disabledSkills":[]}'
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
    expect(JSON.parse(await readFile(path.join(copilotHome, 'settings.json'), 'utf8'))).toEqual({ ...original, disabledSkills: ['uninstalled-skill', 'sample'] })
    expect((await stat(path.join(copilotHome, 'settings.json'))).mode & 0o777).toBe(0o600)
    expect((await readdir(copilotHome)).filter((name) => name.startsWith('.settings-'))).toEqual([])
  })

  it('recognizes a configured skill itself and a repository root above a known subfolder', async () => {
    const configured = await skill(path.join(home, 'configured'), 'direct-skill')
    await mkdir(path.join(repository, '.git'))
    const nested = path.join(repository, 'src', 'nested')
    await mkdir(nested, { recursive: true })
    await skill(path.join(repository, '.github', 'skills'), 'repository-skill')
    await mkdir(copilotHome, { recursive: true })
    await writeFile(path.join(copilotHome, 'settings.json'), JSON.stringify({ skillDirectories: [configured] }))
    const discovery = new SkillSettingsService({ home, copilotHome, env: {}, folders: () => [nested], validateFolder: async (folder) => {
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
    const failing = new SkillSettingsService({ home, copilotHome, env: {}, folders: () => [], replace: vi.fn().mockRejectedValue(new Error('disk refusal')) })
    const snapshot = await failing.snapshot()
    await expect(failing.update({ name: 'sample', enabled: false, confirmed: true, revision: snapshot.revision })).rejects.toThrow('disk refusal')
    expect(await readFile(path.join(copilotHome, 'settings.json'), 'utf8')).toBe('{"retained":true}')
    expect((await readdir(copilotHome)).filter((name) => name.startsWith('.settings-'))).toEqual([])
  })

  it('refuses malformed settings and symlink targets rather than overwriting them', async () => {
    await mkdir(copilotHome, { recursive: true })
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
