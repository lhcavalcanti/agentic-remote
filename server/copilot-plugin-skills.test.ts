import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  resolveCopilotPluginSkillDirectories,
  type CopilotPluginClient,
} from './copilot-plugin-skills.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })),
  )
})

async function fixture() {
  const home = await mkdtemp(path.join(os.tmpdir(), 'agentic-plugin-skills-'))
  directories.push(home)
  const copilotHome = path.join(home, '.copilot')
  const installed = path.join(copilotHome, 'installed-plugins')
  await mkdir(installed, { recursive: true })
  const plugins: Array<Record<string, unknown>> = []

  const addSkills = async (
    root: string,
    name: string,
    skillRoots: string[] = ['skills'],
  ) => {
    for (const skillRoot of skillRoots) {
      await mkdir(path.join(root, skillRoot, `${name}-skill`), { recursive: true })
      await writeFile(
        path.join(root, skillRoot, `${name}-skill`, 'SKILL.md'),
        `---\nname: ${name}-skill\ndescription: Fixture\n---\nFixture.\n`,
      )
    }
  }

  const writeManifest = async (
    root: string,
    relative: string,
    manifest: unknown,
  ) => {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true })
    await writeFile(path.join(root, relative), JSON.stringify(manifest))
  }

  const add = async (
    marketplace: string,
    name: string,
    options: {
      enabled?: boolean
      skills?: string[]
      manifest?: unknown
      manifestPath?: string
    } = {},
  ) => {
    const root = path.join(installed, marketplace, name)
    await mkdir(root, { recursive: true })
    await addSkills(root, name, options.skills)
    if (options.manifest !== undefined) {
      await writeManifest(
        root,
        options.manifestPath ?? '.claude-plugin/plugin.json',
        options.manifest,
      )
    }
    plugins.push({
      name,
      marketplace,
      enabled: options.enabled ?? true,
    })
    return root
  }

  const addDirect = async (
    name: string,
    directSourceId: string,
    options: { skills?: string[] } = {},
  ) => {
    const root = path.join(installed, '_direct', directSourceId)
    await mkdir(root, { recursive: true })
    await addSkills(root, `${name}-${directSourceId}`, options.skills)
    plugins.push({
      name,
      marketplace: '',
      directSourceId,
      enabled: true,
    })
    return root
  }

  const list = vi.fn(async () => ({ plugins }))
  const client = {
    rpc: { plugins: { list } },
  } as unknown as CopilotPluginClient
  return {
    home,
    copilotHome,
    installed,
    plugins,
    client,
    list,
    add,
    addDirect,
    addSkills,
    writeManifest,
    environment: { HOME: home, COPILOT_HOME: copilotHome },
  }
}

describe('Copilot installed-plugin skill roots', () => {
  it('derives enabled managed roots in Copilot order and excludes disabled plugins', async () => {
    const f = await fixture()
    const first = await f.add('market', 'first')
    await f.add('market', 'disabled', { enabled: false })
    const second = await f.add('market', 'second')
    f.plugins.push({
      name: 'builtin',
      marketplace: '',
      enabled: true,
      source: 'builtin',
    })

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).resolves.toEqual([
      path.join(first, 'skills'),
      path.join(second, 'skills'),
    ])
    expect(f.list).toHaveBeenCalledOnce()
  })

  it('honours legacy manifest skill roots without copying plugin content', async () => {
    const f = await fixture()
    const root = await f.add('market', 'custom', {
      skills: ['contributions/skills'],
      manifest: { name: 'custom', skills: 'contributions/skills' },
    })

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).resolves.toEqual([path.join(root, 'contributions/skills')])
  })

  it('uses Copilot manifest precedence and Agent Plugins skill semantics', async () => {
    const f = await fixture()
    const legacy = await f.add('market', 'legacy', {
      skills: ['skills', 'legacy-skills', 'root-skills'],
    })
    await f.writeManifest(
      legacy,
      'plugin.json',
      { name: 'legacy', skills: 'root-skills' },
    )
    await f.writeManifest(
      legacy,
      '.plugin/plugin.json',
      { name: 'legacy', skills: 'legacy-skills' },
    )
    const agent = await f.add('market', 'agent', {
      skills: ['skills', 'legacy-skills'],
    })
    await f.writeManifest(
      agent,
      '.plugin/plugin.json',
      { name: 'agent', skills: 'legacy-skills' },
    )
    await f.writeManifest(agent, 'plugin.json', {
      $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
      name: 'agent',
    })

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).resolves.toEqual([
      path.join(legacy, 'legacy-skills'),
      path.join(agent, 'skills'),
    ])
  })

  it('does not apply the legacy root SKILL fallback to Agent Plugins', async () => {
    const f = await fixture()
    const root = await f.add('market', 'agent-root', { skills: [] })
    await f.writeManifest(root, 'plugin.json', {
      $schema: 'https://agent-plugins.org/schemas/1.1.0/plugin.schema.json',
      name: 'agent-root',
    })
    await writeFile(path.join(root, 'SKILL.md'), 'Agent Plugins ignore this.')

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).resolves.toEqual([])
  })

  it('accepts a live-only home and uses marketplace manifest precedence', async () => {
    const f = await fixture()
    await rm(f.installed, { recursive: true })
    const marketplace = path.join(f.home, 'live-marketplace')
    const preferred = path.join(marketplace, 'plugins', 'preferred')
    const fallback = path.join(marketplace, 'plugins', 'fallback')
    await f.addSkills(preferred, 'preferred')
    await f.addSkills(fallback, 'fallback')
    await f.writeManifest(marketplace, 'marketplace.json', {
      name: 'local',
      plugins: [{ name: 'live', source: './plugins/preferred' }],
    })
    await f.writeManifest(marketplace, '.github/plugin/marketplace.json', {
      name: 'local',
      plugins: [{ name: 'live', source: './plugins/fallback' }],
    })
    f.plugins.push({
      name: 'live',
      marketplace: 'local',
      enabled: true,
      installedFrom: marketplace,
    })

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).resolves.toEqual([path.join(preferred, 'skills')])
  })

  it('resolves live plugins from the supported GitHub marketplace location', async () => {
    const f = await fixture()
    await rm(f.installed, { recursive: true })
    const marketplace = path.join(f.home, 'github-marketplace')
    const root = path.join(marketplace, 'plugins', 'live')
    await f.addSkills(root, 'live')
    await f.writeManifest(marketplace, '.github/plugin/marketplace.json', {
      name: 'local',
      plugins: [{ name: 'live', source: './plugins/live' }],
    })
    f.plugins.push({
      name: 'live',
      marketplace: 'local',
      enabled: true,
      installedFrom: marketplace,
    })

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).resolves.toEqual([path.join(root, 'skills')])
  })

  it('uses direct source identities for same-name direct installs', async () => {
    const f = await fixture()
    const first = await f.addDirect('direct', 'source-a')
    const second = await f.addDirect('direct', 'source-b')

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).resolves.toEqual([
      path.join(first, 'skills'),
      path.join(second, 'skills'),
    ])
  })

  it('fails explicitly when the runtime plugin listing is unavailable', async () => {
    const f = await fixture()
    await expect(
      resolveCopilotPluginSkillDirectories({ rpc: {} }, f.environment),
    ).rejects.toThrow('does not expose installed-plugin discovery')
  })

  it('rejects duplicate runtime plugin identities deterministically', async () => {
    const f = await fixture()
    await f.addDirect('duplicate', 'same-source')
    f.plugins.push({ ...f.plugins[0] })

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('duplicate twice')
  })

  it('rejects a live plugin without a marketplace identity', async () => {
    const f = await fixture()
    f.plugins.push({
      name: 'live',
      marketplace: '',
      enabled: true,
      installedFrom: path.join(f.home, 'marketplace'),
    })

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('malformed enabled plugin')
  })

  it('rejects missing and malformed plugin roots with sanitized errors', async () => {
    const f = await fixture()
    const root = await f.add('market', 'broken', {
      manifest: { name: 'broken', skills: 12 },
    })

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('broken@market has malformed skill contribution paths')

    await rm(root, { recursive: true })
    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('broken@market has an unsafe or missing plugin root')
  })

  it('rejects unsupported Agent Plugins schemas', async () => {
    const f = await fixture()
    await f.add('market', 'future', {
      manifestPath: 'plugin.json',
      manifest: {
        $schema: 'https://agent-plugins.org/schemas/2.0.0/plugin.schema.json',
        name: 'future',
      },
    })

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('future@market uses an unsupported Agent Plugins schema')
  })

  it('rejects symlinks in plugin skill contributions', async () => {
    const f = await fixture()
    const outside = path.join(f.home, 'outside')
    await mkdir(path.join(outside, 'skill'), { recursive: true })
    await writeFile(path.join(outside, 'skill', 'SKILL.md'), 'fixture')

    const symlinked = path.join(f.installed, 'market', 'linked')
    await mkdir(path.dirname(symlinked), { recursive: true })
    await symlink(outside, symlinked)
    f.plugins.push({
      name: 'linked',
      marketplace: 'market',
      enabled: true,
    })

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('linked@market has an unsafe or missing plugin root')

    f.plugins.splice(0)
    const root = await f.add('market', 'escape', {
      skills: [],
      manifest: { name: 'escape', skills: 'skills' },
    })
    await symlink(outside, path.join(root, 'skills'))

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('escape@market has an unsafe or missing skill contribution directory')

    f.plugins.splice(0)
    const nestedRoot = await f.add('market', 'nested-link')
    await symlink(
      outside,
      path.join(nestedRoot, 'skills', 'nested-link-skill', 'reference'),
    )

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('nested-link@market has a symlink in its skill contributions')
  })
})
