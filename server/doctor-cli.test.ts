import { execFile } from 'node:child_process'
import {
  chmod,
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'

const exec = promisify(execFile)
const CLI = new URL('../bin/agentic-remote', import.meta.url).pathname
const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const fixtures: Array<{ root: string; close: () => Promise<void> }> = []

interface Check {
  check: string
  status: 'ok' | 'warn' | 'fail' | 'skip'
  detail: string
}

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map(async ({ root, close }) => {
    await close()
    await rm(root, { recursive: true, force: true })
  }))
})

async function fixture(options: { devtunnel?: boolean; optional?: boolean; health?: string; healthStatus?: number } = {}) {
  const parent = path.join(process.cwd(), '.agentic-remote')
  await mkdir(parent, { recursive: true })
  const root = await mkdtemp(path.join(parent, 'doctor-test-'))
  const bin = path.join(root, 'bin')
  const config = path.join(root, '.config/agentic-remote')
  const unit = path.join(root, '.config/systemd/user/agentic-remote.service')
  const environment = path.join(config, 'environment')
  const calls = path.join(root, 'calls')
  const journal = path.join(root, 'journal')
  const server = createServer((_request, response) => {
    response.writeHead(options.healthStatus ?? 200, { 'Content-Type': 'application/json', Location: 'https://remote.invalid' })
    response.end(options.health ?? JSON.stringify({ ok: true, role: 'hub', node: { name: 'fixture-hub', version: '1.2.3' } }))
  })
  let listening = false
  const close = async () => {
    if (!listening) return
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    listening = false
  }
  fixtures.push({ root, close })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  listening = true
  const port = (server.address() as AddressInfo).port
  await Promise.all([
    mkdir(bin, { recursive: true }),
    mkdir(path.dirname(unit), { recursive: true }),
    mkdir(path.join(config, 'releases/current'), { recursive: true }),
    mkdir(path.join(root, 'data/models/stt'), { recursive: true }),
  ])
  for (const command of ['bash', 'readlink', 'dirname', 'cat']) {
    await symlink(`/usr/bin/${command}`, path.join(bin, command))
  }
  await symlink(process.execPath, path.join(bin, 'node'))
  const stub = async (command: string, body: string) => {
    await writeFile(path.join(bin, command), `#!/usr/bin/env bash\nprintf '%s\\n' '${command}'" $*" >>"$TEST_CALLS"\n${body}\n`, { mode: 0o755 })
  }
  await stub('systemctl', [
    'case "$*" in',
    '  "--user is-enabled agentic-remote.service") echo "${TEST_ENABLED:-enabled}"; [[ "${TEST_ENABLED:-enabled}" == enabled ]] ;;',
    '  "--user is-active agentic-remote.service") echo "${TEST_ACTIVE:-active}"; [[ "${TEST_ACTIVE:-active}" == active ]] ;;',
    '  *) exit 99 ;;',
    'esac',
  ].join('\n'))
  await stub('journalctl', [
    '[[ "$*" == "--user --unit agentic-remote.service -o cat --since -2h --no-pager -n 2000" ]] || exit 99',
    'while IFS= read -r line; do printf "%s\\n" "$line"; done <"$TEST_JOURNAL"',
  ].join('\n'))
  await stub('copilot', '[[ "$*" == --version ]] || exit 99\nprintf "Copilot CLI 1.0.0\\n"')
  await stub('tmux', 'exit 99')
  await stub('claude', '[[ "$*" == "auth status" ]] || exit 99\nprintf "%s\\n" "${TEST_CLAUDE:-{\\"loggedIn\\":true}}"')
  await stub('whisper-cli', 'exit 99')
  await stub('piper', 'exit 99')
  if (options.devtunnel !== false) {
    await stub('devtunnel', [
      'case "$*" in',
      '  "user show --json") printf "%s\\n" "$TEST_USER" ;;',
      '  "access list "*" --port-number "*" --json") printf "%s\\n" "$TEST_PORT_ACL" ;;',
      '  "access list "*" --json") printf "%s\\n" "$TEST_ACL" ;;',
      '  *) exit 99 ;;',
      'esac',
    ].join('\n'))
  }
  const pnpmRoot = path.join(root, 'pnpm')
  await mkdir(path.join(pnpmRoot, 'bin'), { recursive: true })
  await writeFile(path.join(pnpmRoot, 'package.json'), JSON.stringify({
    name: 'pnpm', version: manifest.packageManager.split('@')[1],
  }))
  await writeFile(path.join(pnpmRoot, 'bin/pnpm.cjs'), '#!/usr/bin/env bash\nprintf "pnpm invoked\\n" >>"$TEST_CALLS"\nexit 99\n', { mode: 0o755 })
  await symlink(path.join(pnpmRoot, 'bin/pnpm.cjs'), path.join(bin, 'pnpm'))
  await writeFile(unit, '[Service]\n')
  await writeFile(journal, '')
  await writeFile(calls, '')
  await writeFile(path.join(root, 'whisper.bin'), 'fixture')
  await writeFile(path.join(root, 'data/models/voice.onnx'), 'fixture')
  await writeFile(path.join(root, 'data/models/voice.json'), '{"audio":{"sample_rate":22050}}')
  const configuration: Record<string, string> = {
    HOST: '127.0.0.1',
    PORT: String(port),
    AGENTIC_REMOTE_DATA_DIR: path.join(root, 'data'),
    AGENTIC_REMOTE_ALLOWED_ORIGINS: `http://localhost:${port},https://fixture-${port}.devtunnels.ms`,
    AGENTIC_REMOTE_DEVTUNNEL_ID: 'fixture.usw2',
    ...(options.optional === false ? {} : {
      CLAUDE_BIN: 'claude',
      AGENTIC_REMOTE_WHISPER_BIN: path.join(bin, 'whisper-cli'),
      AGENTIC_REMOTE_WHISPER_MODEL: path.join(root, 'whisper.bin'),
      AGENTIC_REMOTE_ORACLE_VOICE: 'on',
      AGENTIC_REMOTE_VOICE_STT_MODEL_DIR: 'models/stt',
      AGENTIC_REMOTE_VOICE_TTS_BIN: path.join(bin, 'piper'),
      AGENTIC_REMOTE_VOICE_TTS_MODEL: 'models/voice.onnx',
      AGENTIC_REMOTE_VOICE_TTS_CONFIG: 'models/voice.json',
    }),
  }
  const configure = async (overrides: Record<string, string> = {}) => {
    Object.assign(configuration, overrides)
    await writeFile(environment, Object.entries(configuration).map(([key, value]) => `${key}=${value}`).join('\n') + '\n', { mode: 0o600 })
  }
  await configure()
  const env = {
    HOME: root,
    PATH: bin,
    COREPACK_HOME: path.join(root, 'corepack'),
    TEST_CALLS: calls,
    TEST_JOURNAL: journal,
    TEST_USER: '{"status":"Logged in","provider":"GitHub","username":"fixture"}',
    TEST_ACL: '{"accessControlEntries":[{"type":"Anonymous","isDeny":true}]}',
    TEST_PORT_ACL: '{"accessControlEntries":[{"type":"Anonymous","isDeny":true}]}',
  }
  const run = async (args = ['--json'], overrides: NodeJS.ProcessEnv = {}, script = CLI) => {
    try {
      const { stdout, stderr } = await exec(script, ['doctor', ...args], { env: { ...env, ...overrides }, timeout: 20000 })
      return { code: 0, stdout, stderr }
    } catch (error) {
      const failure = error as { code?: number; stdout?: string; stderr?: string }
      return { code: failure.code ?? 1, stdout: failure.stdout ?? '', stderr: failure.stderr ?? '' }
    }
  }
  return { root, bin, environment, unit, calls, journal, port, configure, close, run }
}

const checks = (result: { stdout: string }) => JSON.parse(result.stdout) as Check[]
const check = (result: { stdout: string }, name: string) => checks(result).find((item) => item.check === name)

async function tree(root: string): Promise<unknown[]> {
  const entries = await readdir(root)
  return Promise.all(entries.filter((name) => name !== 'calls').sort().map(async (name): Promise<unknown> => {
    const file = path.join(root, name)
    const stat = await lstat(file)
    return [name, stat.mode, stat.isSymbolicLink() ? await readlink(file) :
      stat.isDirectory() ? await tree(file) : await readFile(file, 'utf8')]
  }))
}

describe('read-only doctor CLI', () => {
  it('reports a healthy installation, preserves all files, and runs only read-only queries', async () => {
    const context = await fixture()
    const before = await tree(context.root)
    const result = await context.run()
    expect(result.code).toBe(0)
    expect(result.stderr).toBe('')
    expect(checks(result).every((item) => item.status === 'ok')).toBe(true)
    expect(check(result, 'health')?.detail).toContain('role=hub, name=fixture-hub, version=1.2.3')
    expect(check(result, 'tunnel.auth')?.detail).toContain('provider=GitHub')
    expect(await tree(context.root)).toEqual(before)
    expect((await readFile(context.calls, 'utf8')).trim().split('\n')).toEqual([
      'systemctl --user is-enabled agentic-remote.service',
      'systemctl --user is-active agentic-remote.service',
      'copilot --version',
      'claude auth status',
      'devtunnel user show --json',
      'devtunnel access list fixture.usw2 --json',
      `devtunnel access list fixture.usw2 --port-number ${context.port} --json`,
      'journalctl --user --unit agentic-remote.service -o cat --since -2h --no-pager -n 2000',
    ])
  })

  it('keeps diagnosing when the service and health endpoint are down', async () => {
    const context = await fixture()
    await context.close()
    const result = await context.run(['--json'], { TEST_ACTIVE: 'inactive' })
    expect(result.code).toBe(1)
    expect(check(result, 'service.active')?.status).toBe('fail')
    expect(check(result, 'health')?.status).toBe('fail')
    expect(check(result, 'tunnel.port-acl')?.status).toBe('ok')
    expect(check(result, 'startup')?.status).toBe('ok')
  })

  it.each([
    ['not JSON', 200],
    ['{"ok":false}', 200],
    ['{"ok":true}', 503],
    ['{"ok":true}', 302],
  ])('rejects unhealthy responses without following redirects: %s (%s)', async (health, healthStatus) => {
    const context = await fixture({ health, healthStatus })
    const result = await context.run()
    expect(result.code).toBe(1)
    expect(check(result, 'health')?.status).toBe('fail')
  })

  it.each(['TEST_ACL', 'TEST_PORT_ACL'])('fails for any allow entry in %s without modifying ACLs', async (key) => {
    const context = await fixture()
    const result = await context.run(['--json'], { [key]: '{"accessControlEntries":[{"type":"Anonymous","isDeny":false},{"isDeny":true}]}' })
    expect(result.code).toBe(1)
    expect(check(result, key === 'TEST_ACL' ? 'tunnel.acl' : 'tunnel.port-acl')).toMatchObject({
      status: 'fail', detail: expect.stringContaining('tunnel is reachable by more than its owner'),
    })
    expect(await readFile(context.calls, 'utf8')).not.toMatch(/access (create|reset|delete)/)
  })

  it('accepts empty tunnel and port ACLs', async () => {
    const context = await fixture()
    const result = await context.run(['--json'], {
      TEST_ACL: '{"accessControlEntries":[]}', TEST_PORT_ACL: '{"accessControlEntries":[]}',
    })
    expect(result.code).toBe(0)
    expect(check(result, 'tunnel.acl')?.status).toBe('ok')
    expect(check(result, 'tunnel.port-acl')?.status).toBe('ok')
  })

  it.each(['not JSON', '{}', '[]', 'null', '{"accessControlEntries":null}', '{"accessControlEntries":[{}]}', '{"accessControlEntries":[{"isDeny":"true"}]}'])(
    'fails closed for malformed or unknown ACL JSON: %s', async (acl) => {
      const context = await fixture()
      const result = await context.run(['--json'], { TEST_PORT_ACL: acl })
      expect(result.code).toBe(1)
      expect(check(result, 'tunnel.port-acl')).toMatchObject({ status: 'fail', detail: expect.stringContaining('fail closed') })
    },
  )

  it.each(['not JSON', '{}', '{"status":"Logged out","provider":"Microsoft"}'])('fails closed for invalid tunnel auth: %s', async (user) => {
    const context = await fixture()
    const result = await context.run(['--json'], { TEST_USER: user })
    expect(result.code).toBe(1)
    expect(check(result, 'tunnel.auth')?.status).toBe('fail')
  })

  it('names a logged-out devtunnel CLI and fails ACL checks closed without querying them', async () => {
    const context = await fixture()
    const result = await context.run(['--json'], { TEST_USER: '{"status":"Not logged in"}' })
    expect(result.code).toBe(1)
    expect(check(result, 'tunnel.auth')).toMatchObject({ status: 'fail', detail: expect.stringContaining('not logged in') })
    for (const name of ['tunnel.acl', 'tunnel.port-acl']) {
      expect(check(result, name)).toMatchObject({ status: 'fail', detail: expect.stringContaining('without a devtunnel login') })
    }
    expect(await readFile(context.calls, 'utf8')).not.toContain('devtunnel access list')
  })

  it('skips tunnels when devtunnel is absent from the isolated PATH', async () => {
    const context = await fixture({ devtunnel: false })
    const result = await context.run()
    expect(result.code).toBe(0)
    expect(checks(result).filter((item) => item.check.startsWith('tunnel.')).every((item) => item.status === 'skip')).toBe(true)
  })

  it('skips unconfigured optional providers and assets without invoking Claude', async () => {
    const context = await fixture({ optional: false })
    await context.configure({ AGENTIC_REMOTE_DEVTUNNEL_ID: '' })
    const result = await context.run()
    expect(result.code).toBe(0)
    for (const name of ['providers.claude', 'transcription.whisper', 'transcription.model', 'voice.assets', 'tunnel.auth']) {
      expect(check(result, name)?.status).toBe('skip')
    }
    expect(await readFile(context.calls, 'utf8')).not.toMatch(/claude|devtunnel/)
  })

  it('reports the last failed startup phase, without exposing journal contents', async () => {
    const context = await fixture()
    await writeFile(context.journal, [
      'unstructured private log text',
      '{"startupPhase":"copilot.sdk","event":"begin"}',
      '{"startupPhase":"copilot.sdk","event":"fail","error":"private error"}',
      '{"startupPhase":"service.start","event":"fail"}',
      '',
    ].join('\n'))
    const result = await context.run(['--json'], { TEST_ACTIVE: 'failed' })
    expect(result.code).toBe(1)
    expect(check(result, 'startup')).toMatchObject({ status: 'fail', detail: 'Last failed startup phase: service.start; run agentic-remote logs --why' })
    expect(result.stdout).not.toContain('private')
    const recovered = await context.run()
    expect(recovered.code).toBe(0)
    expect(check(recovered, 'startup')?.status).toBe('warn')
  })

  it('finds an unfinished nested phase only when the service is not active', async () => {
    const context = await fixture()
    await writeFile(context.journal, [
      '{"startupPhase":"service.start","event":"begin"}',
      '{"startupPhase":"copilot.start","event":"begin"}',
      '{"startupPhase":"copilot.sdk","event":"begin"}',
      '{"startupPhase":"copilot.sdk","event":"complete"}',
      '',
    ].join('\n'))
    expect(check(await context.run(['--json'], { TEST_ACTIVE: 'inactive' }), 'startup')).toMatchObject({
      status: 'fail', detail: expect.stringContaining('copilot.start (begin without complete/fail'),
    })
    expect(check(await context.run(['--json'], { TEST_ACTIVE: 'inactive' }), 'startup')?.detail).toContain('agentic-remote logs --why')
    expect(check(await context.run(), 'startup')?.status).toBe('ok')
  })

  it('does not carry an unfinished phase across a new startup', async () => {
    const context = await fixture()
    await writeFile(context.journal, [
      '{"startupPhase":"copilot.sdk","event":"begin"}',
      '{"startupPhase":"app.build","event":"begin"}',
      '{"startupPhase":"app.build","event":"complete"}',
      '',
    ].join('\n'))
    expect(check(await context.run(['--json'], { TEST_ACTIVE: 'inactive' }), 'startup')?.status).toBe('ok')
  })

  it('skips journal diagnostics when journalctl is absent', async () => {
    const context = await fixture()
    await rm(path.join(context.bin, 'journalctl'))
    expect(check(await context.run(), 'startup')?.status).toBe('skip')
  })

  it('rejects missing service files, insecure environment permissions, and missing releases', async () => {
    const context = await fixture()
    await rm(context.unit)
    await chmod(context.environment, 0o644)
    await rm(path.join(context.root, '.config/agentic-remote/releases/current'), { recursive: true })
    const result = await context.run()
    expect(result.code).toBe(1)
    for (const name of ['service.unit', 'service.environment', 'service.release']) {
      expect(check(result, name)?.status).toBe('fail')
    }
  })

  it('honors config overrides and never evaluates environment file values', async () => {
    const context = await fixture()
    const marker = path.join(context.root, 'must-not-be-written')
    await context.configure({ AGENTIC_REMOTE_NODE_NAME: `$(printf unexpected >"${marker}")`, HOST: '0.0.0.0' })
    const result = await context.run(['--json', '--tunnel', 'override.usw2'], {
      AGENTIC_REMOTE_RELEASE_DIR: path.join(context.root, 'data'),
      AGENTIC_REMOTE_WHISPER_MODEL: path.join(context.root, 'missing-model'),
      AGENTIC_REMOTE_ORACLE_VOICE: 'off',
      TEST_USER: '{"status":"Logged in","provider":"Microsoft"}',
    })
    expect(check(result, 'health')?.status).toBe('ok')
    expect(check(result, 'service.release')?.status).toBe('ok')
    expect(check(result, 'transcription.model')?.status).toBe('fail')
    expect(check(result, 'voice.assets')?.status).toBe('skip')
    expect(check(result, 'tunnel.auth')?.detail).toContain('provider=Microsoft')
    expect(await readFile(context.calls, 'utf8')).toContain('access list override.usw2 --json')
    await expect(lstat(marker)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('requires local voice assets only when voice is enabled and local', async () => {
    const context = await fixture()
    await rm(path.join(context.root, 'data/models/voice.onnx'))
    expect(check(await context.run(), 'voice.assets')).toMatchObject({
      status: 'fail', detail: expect.stringContaining('AGENTIC_REMOTE_VOICE_TTS_MODEL'),
    })
    const remote = await context.run(['--json'], { AGENTIC_REMOTE_VOICE_COMPUTER: 'fixture-node' })
    expect(remote.code).toBe(0)
    expect(check(remote, 'voice.assets')?.status).toBe('skip')
  })

  it.each([
    ['not-an-origin', 'fail'],
    ['localhost:1234', 'fail'],
    ['https://fixture.devtunnels.ms', 'fail'],
    ['http://localhost:1234', 'warn'],
    ['http://localhost:1234/path,https://fixture.devtunnels.ms/path', 'ok'],
    ['', 'warn'],
  ])('uses the service origin parser rules for %s', async (origins, status) => {
    const context = await fixture()
    await context.configure({ AGENTIC_REMOTE_ALLOWED_ORIGINS: origins })
    expect(check(await context.run(), 'origins')?.status).toBe(status)
  })

  it('never probes a non-loopback configured host', async () => {
    const context = await fixture()
    await context.configure({ HOST: 'remote.invalid' })
    expect(check(await context.run(), 'health')).toMatchObject({
      status: 'skip', detail: expect.stringContaining('no non-loopback probe'),
    })
  })

  it('requires an authenticated configured Claude CLI', async () => {
    const context = await fixture()
    const result = await context.run(['--json'], { TEST_CLAUDE: '{"loggedIn":false,"token":"not-for-output"}' })
    expect(result.code).toBe(1)
    expect(check(result, 'providers.claude')?.status).toBe('fail')
    expect(result.stdout).not.toContain('not-for-output')
  })

  it('fails when the pinned pnpm version is not already locally available', async () => {
    const context = await fixture()
    await rm(path.join(context.root, 'pnpm/package.json'))
    expect(check(await context.run(), 'pnpm')?.status).toBe('fail')
    expect(await readFile(context.calls, 'utf8')).not.toContain('pnpm')
  })

  it('resolves a cached Corepack pin without executing a package manager', async () => {
    const context = await fixture()
    const cached = path.join(context.root, 'corepack/v1/pnpm', manifest.packageManager.split('@')[1])
    await mkdir(path.dirname(cached), { recursive: true })
    await rm(path.join(context.bin, 'pnpm'))
    await symlink(path.join(context.bin, 'copilot'), path.join(context.bin, 'pnpm'))
    await symlink(path.join(context.root, 'pnpm'), cached)
    expect(check(await context.run(), 'pnpm')?.status).toBe('ok')
    expect(await readFile(context.calls, 'utf8')).not.toContain('pnpm')
  })

  it('reports missing Node as a JSON failure instead of exiting before diagnostics', async () => {
    const context = await fixture()
    await rm(path.join(context.bin, 'node'))
    const result = await context.run()
    expect(result.code).toBe(1)
    expect(check(result, 'node')?.status).toBe('fail')
    expect(await readFile(context.calls, 'utf8')).toBe('')
  })

  it('checks the declared minimum Node engine instead of assuming compatibility', async () => {
    const context = await fixture()
    const repository = path.join(context.root, 'repository')
    await mkdir(path.join(repository, 'bin'), { recursive: true })
    const script = path.join(repository, 'bin/agentic-remote')
    await copyFile(CLI, script)
    await writeFile(path.join(repository, 'package.json'), JSON.stringify({ ...manifest, engines: { node: '>=999.0' } }))
    const result = await context.run(['--json'], {}, script)
    expect(result.code).toBe(1)
    expect(check(result, 'node')).toMatchObject({ status: 'fail', detail: expect.stringContaining('requires >=999.0') })
  })

  it('emits stable JSON records and human markers, and documents options', async () => {
    const context = await fixture({ optional: false })
    const result = await context.run()
    expect(Array.isArray(checks(result))).toBe(true)
    expect(checks(result).length).toBeGreaterThan(10)
    for (const item of checks(result)) {
      expect(Object.keys(item)).toEqual(['check', 'status', 'detail'])
      expect(['ok', 'warn', 'fail', 'skip']).toContain(item.status)
      expect(typeof item.detail).toBe('string')
      expect(item.detail).not.toMatch(/[\r\n]/)
    }
    const human = await context.run([], { TEST_ACL: '{"accessControlEntries":[{"isDeny":false}]}' })
    expect(human.code).toBe(1)
    expect(human.stdout).toContain('✓ node [ok]:')
    expect(human.stdout).toContain('- providers.claude [skip]:')
    expect(human.stdout).toContain('✗ tunnel.acl [fail]: tunnel is reachable by more than its owner')
    const help = await context.run(['--help'])
    expect(help.code).toBe(0)
    expect(help.stdout).toContain('--json')
    expect(help.stdout).toContain('--tunnel ID')
    expect((await context.run(['--tunnel'])).code).toBe(1)
    expect((await context.run(['--unknown'])).code).toBe(1)
  })
})
