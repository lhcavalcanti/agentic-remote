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
  const records: Array<Record<string, unknown>> = []
  const plugins: Array<Record<string, unknown>> = []

  const add = async (
    marketplace: string,
    name: string,
    options: {
      enabled?: boolean
      skills?: string[]
      manifest?: unknown
    } = {},
  ) => {
    const root = path.join(installed, marketplace, name)
    await mkdir(root, { recursive: true })
    const skillRoots = options.skills ?? ['skills']
    for (const skillRoot of skillRoots) {
      await mkdir(path.join(root, skillRoot, `${name}-skill`), { recursive: true })
      await writeFile(
        path.join(root, skillRoot, `${name}-skill`, 'SKILL.md'),
        `---\nname: ${name}-skill\ndescription: Fixture\n---\nFixture.\n`,
      )
    }
    if (options.manifest !== undefined) {
      await mkdir(path.join(root, '.claude-plugin'), { recursive: true })
      await writeFile(
        path.join(root, '.claude-plugin', 'plugin.json'),
        JSON.stringify(options.manifest),
      )
    }
    const enabled = options.enabled ?? true
    records.push({
      name, marketplace, cache_path: root, enabled,
      installed_at: '2026-10-23T00:00:00Z',
    })
    plugins.push({
      name, marketplace, enabled,
      installed_at: '2026-10-23T00:00:00Z',
    })
    return root
  }

  const writeConfig = async () =>
    writeFile(
      path.join(copilotHome, 'config.json'),
      `// Managed by Copilot.\n${JSON.stringify({ installedPlugins: records }, null, 2)}\n`,
      { mode: 0o600 },
    )

  const list = vi.fn(async () => ({ plugins }))
  const client = {
    rpc: { plugins: { list } },
  } as unknown as CopilotPluginClient
  return {
    home,
    copilotHome,
    installed,
    records,
    plugins,
    client,
    list,
    add,
    writeConfig,
    environment: { HOME: home, COPILOT_HOME: copilotHome },
  }
}

describe('Copilot installed-plugin skill roots', () => {
  it('returns enabled plugin skill roots in Copilot order and excludes disabled plugins', async () => {
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
    await f.writeConfig()

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).resolves.toEqual([
      path.join(first, 'skills'),
      path.join(second, 'skills'),
    ])
    expect(f.list).toHaveBeenCalledOnce()
  })

  it('honours manifest skill roots without copying plugin content', async () => {
    const f = await fixture()
    const root = await f.add('market', 'custom', {
      skills: ['contributions/skills'],
      manifest: { name: 'custom', skills: 'contributions/skills' },
    })
    await f.writeConfig()

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).resolves.toEqual([path.join(root, 'contributions/skills')])
  })

  it('accepts a live plugin root only when Copilot reports its marketplace boundary', async () => {
    const f = await fixture()
    const marketplace = path.join(f.home, 'live-marketplace')
    const root = path.join(marketplace, 'plugins', 'live')
    await mkdir(path.join(root, 'skills', 'live-skill'), { recursive: true })
    await writeFile(
      path.join(root, 'skills', 'live-skill', 'SKILL.md'),
      '---\nname: live-skill\ndescription: Live fixture\n---\n',
    )
    await mkdir(path.join(marketplace, '.claude-plugin'), { recursive: true })
    await writeFile(
      path.join(marketplace, '.claude-plugin', 'marketplace.json'),
      JSON.stringify({
        name: 'local',
        plugins: [{ name: 'live', source: './plugins/live' }],
      }),
    )
    f.plugins.push({
      name: 'live',
      marketplace: 'local',
      enabled: true,
      installed_at: '2026-10-23T00:00:00Z',
      installedFrom: marketplace,
    })
    await f.writeConfig()

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).resolves.toEqual([path.join(root, 'skills')])
  })

  it('fails explicitly when the runtime plugin listing is unavailable', async () => {
    const f = await fixture()
    await expect(
      resolveCopilotPluginSkillDirectories({ rpc: {} }, f.environment),
    ).rejects.toThrow('does not expose installed-plugin discovery')
  })

  it('rejects an enabled plugin missing from managed install state', async () => {
    const f = await fixture()
    await f.add('market', 'missing')
    f.records.splice(0)
    await f.writeConfig()

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('missing@market is enabled at runtime but missing')
  })

  it('rejects duplicate runtime plugin identities deterministically', async () => {
    const f = await fixture()
    await f.add('market', 'duplicate')
    f.plugins.push({ ...f.plugins[0] })
    await f.writeConfig()

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('duplicate@market twice')
  })

  it('rejects missing and malformed plugin roots with sanitized errors', async () => {
    const f = await fixture()
    const root = await f.add('market', 'broken', {
      manifest: { name: 'broken', skills: 12 },
    })
    await f.writeConfig()

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('broken@market has malformed skill contribution paths')

    await rm(root, { recursive: true })
    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('broken@market has an unsafe or missing cache root')
  })

  it('rejects symlinks in plugin skill contributions', async () => {
    const f = await fixture()
    const outside = path.join(f.home, 'outside')
    await mkdir(path.join(outside, 'skill'), { recursive: true })
    await writeFile(path.join(outside, 'skill', 'SKILL.md'), 'fixture')

    const symlinked = path.join(f.installed, 'market', 'linked')
    await mkdir(path.dirname(symlinked), { recursive: true })
    await symlink(outside, symlinked)
    f.records.push({
      name: 'linked', marketplace: 'market', cache_path: symlinked,
      enabled: true, installed_at: '2026-10-23T00:00:00Z',
    })
    f.plugins.push({
      name: 'linked', marketplace: 'market',
      enabled: true, installed_at: '2026-10-23T00:00:00Z',
    })
    await f.writeConfig()

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('linked@market has an unsafe or missing cache root')

    f.records.splice(0)
    f.plugins.splice(0)
    const root = await f.add('market', 'escape', {
      skills: [],
      manifest: { name: 'escape', skills: 'skills' },
    })
    await symlink(outside, path.join(root, 'skills'))
    await f.writeConfig()

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('escape@market has an unsafe or missing skill contribution directory')

    f.records.splice(0)
    f.plugins.splice(0)
    const nestedRoot = await f.add('market', 'nested-link')
    await symlink(
      outside,
      path.join(nestedRoot, 'skills', 'nested-link-skill', 'reference'),
    )
    await f.writeConfig()

    await expect(
      resolveCopilotPluginSkillDirectories(f.client, f.environment),
    ).rejects.toThrow('nested-link@market has a symlink in its skill contributions')
  })
})
