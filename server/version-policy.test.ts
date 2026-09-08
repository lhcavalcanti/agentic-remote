import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const root = new URL('../', import.meta.url)

async function text(path: string): Promise<string> {
  return readFile(new URL(path, root), 'utf8')
}

describe('release version policy', () => {
  it('keeps the app and every native shell version synchronized', async () => {
    const [app, shell, tauri, cargo, lock, readme] = await Promise.all([
      text('package.json').then(JSON.parse) as Promise<{ version: string }>,
      text('shell/package.json').then(JSON.parse) as Promise<{ version: string }>,
      text('shell/src-tauri/tauri.conf.json').then(JSON.parse) as Promise<{
        version: string
      }>,
      text('shell/src-tauri/Cargo.toml'),
      text('shell/src-tauri/Cargo.lock'),
      text('shell/README.md'),
    ])

    expect(app.version).toMatch(/^\d+\.\d+\.\d+$/)
    expect(shell.version).toBe(app.version)
    expect(tauri.version).toBe(app.version)
    expect(cargo).toMatch(
      new RegExp(`\\[package\\][\\s\\S]*?^version = "${app.version.replaceAll('.', '\\.')}"$`, 'm'),
    )
    expect(lock).toMatch(
      new RegExp(`\\[\\[package\\]\\]\\nname = "agentic-remote-shell"\\nversion = "${app.version.replaceAll('.', '\\.')}"`),
    )
    expect(readme).toContain(`agentic-remote_${app.version}_amd64.deb`)
    expect(readme).toContain(`Agentic\\ Remote_${app.version}_amd64.AppImage`)
  })

  it('teaches agents the patch, minor, and major release rules', async () => {
    const skill = await text(
      '.github/skills/agentic-remote-navigation/SKILL.md',
    )

    expect(skill).toContain('**PATCH** (`1.0.0` → `1.0.1`) for fixes and hotfixes')
    expect(skill).toContain(
      '**MINOR** (`1.0.0` → `1.1.0`) for features and code refactoring',
    )
    expect(skill).toContain(
      '**MAJOR** (`1.0.0` → `2.0.0`) for redesigns and breaking changes',
    )
    expect(skill).toContain('use the highest applicable')
  })
})
