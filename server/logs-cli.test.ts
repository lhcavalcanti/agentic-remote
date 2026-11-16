import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'

const exec = promisify(execFile)
const CLI = new URL('../bin/agentic-remote', import.meta.url).pathname
const roots: string[] = []
const epoch = Date.parse('2026-11-13T21:00:00-08:00')
type Log = string | Record<string, unknown>
interface Explanation {
  failure: { kind: string; time: string | null; message: string; line: string; phase?: string } | null
  correlation: Record<string, string>
  before: Array<{ block: string; time: string | null; message: string }>
  after: Array<{ block: string; time: string | null; message: string }>
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

const journalRecord = (MESSAGE: unknown, seconds = 0) => JSON.stringify({
  __REALTIME_TIMESTAMP: String((epoch + seconds * 1000) * 1000), MESSAGE,
})
const journalLine = (message: Log, seconds = 0) =>
  journalRecord(typeof message === 'string' ? message : JSON.stringify(message), seconds)
const oomKill = "agentic-remote.service: Failed with result 'oom-kill'."

async function fixture(lines: string[] = []) {
  const parent = path.join(process.cwd(), '.agentic-remote')
  await mkdir(parent, { recursive: true })
  const root = await mkdtemp(path.join(parent, 'logs-test-'))
  roots.push(root)
  const bin = path.join(root, 'bin')
  const calls = path.join(root, 'calls')
  const journal = path.join(root, 'journal')
  const environment = path.join(root, '.config/agentic-remote/environment')
  await mkdir(bin, { recursive: true })
  await mkdir(path.dirname(environment), { recursive: true })
  for (const command of ['bash', 'readlink', 'dirname', 'cat']) {
    await symlink(`/usr/bin/${command}`, path.join(bin, command))
  }
  await symlink(process.execPath, path.join(bin, 'node'))
  const stub = async (command: string, body: string) => {
    await writeFile(path.join(bin, command), `#!/usr/bin/env bash\nprintf '%s\\n' '${command}'" $*" >>"$TEST_CALLS"\n${body}\n`, { mode: 0o755 })
  }
  await stub('journalctl', [
    'if [[ "$*" == "--user --unit agentic-remote.service --follow" ]]; then echo "following fixture"; exit 0; fi',
    '[[ "$*" == "--user --unit agentic-remote.service -o json --output-fields=MESSAGE --all --since $TEST_SINCE --no-pager" ]] || exit 99',
    'if [[ -n "${TEST_JOURNAL_ERROR:-}" ]]; then printf "%s\\n" "$TEST_JOURNAL_ERROR" >&2; exit "${TEST_JOURNAL_STATUS:-1}"; fi',
    'while IFS= read -r line; do printf "%s\\n" "$line"; done <"$TEST_JOURNAL"',
  ].join('\n'))
  await stub('systemctl', [
    '[[ "$*" == "--user is-active agentic-remote.service" ]] || exit 99',
    'echo "${TEST_ACTIVE:-inactive}"',
    '[[ "${TEST_ACTIVE:-inactive}" == active ]]',
  ].join('\n'))
  await writeFile(journal, lines.length ? lines.join('\n') + '\n' : '')
  await writeFile(calls, '')
  await writeFile(environment, 'TOKEN=environment-must-not-be-printed\n', { mode: 0o600 })
  const run = async (args = ['--why', '--json'], overrides: NodeJS.ProcessEnv = {}) => {
    try {
      const { stdout, stderr } = await exec(CLI, ['logs', ...args], {
        env: {
          HOME: root, PATH: bin, TZ: 'America/Los_Angeles', LANG: 'en_US.UTF-8',
          TEST_CALLS: calls, TEST_JOURNAL: journal, TEST_SINCE: '-6h', ...overrides,
        },
        timeout: 20000,
      })
      return { code: 0, stdout, stderr }
    } catch (error) {
      const failure = error as { code?: number; stdout?: string; stderr?: string }
      return { code: failure.code ?? 1, stdout: failure.stdout ?? '', stderr: failure.stderr ?? '' }
    }
  }
  return { root, bin, calls, journal, environment, run }
}

const explanation = (result: { stdout: string }) => JSON.parse(result.stdout) as Explanation

describe('read-only logs explanation CLI', () => {
  it('explains the latest startup failure with phase context, a two-minute window, and following lines', async () => {
    const context = await fixture([
      journalLine({ startupPhase: 'copilot.sdk', event: 'fail' }, -600),
      journalLine({ startupPhase: 'copilot.sdk', event: 'begin' }, -180),
      journalLine('too old for the window', -121),
      journalLine('inside the window', -120),
      journalLine({ startupPhase: 'copilot.sdk', event: 'fail', error: 'Error', code: 'ECONNREFUSED' }),
      journalLine('service stopped', 1),
    ])
    const result = await context.run()
    expect(result.code).toBe(0)
    expect(result.stderr).toBe('')
    const output = explanation(result)
    expect(Object.keys(output)).toEqual(['failure', 'correlation', 'omittedWindowLines', 'before', 'after'])
    expect(output.failure).toMatchObject({
      kind: 'startup', phase: 'copilot.sdk', time: '2026-11-14T05:00:00.000Z',
      message: 'Failed startup phase: copilot.sdk',
    })
    expect(output.correlation).toEqual({ phase: 'copilot.sdk' })
    expect(output.before.map((line) => [line.block, line.message])).toEqual([
      ['same phase', '{"startupPhase":"copilot.sdk","event":"fail"}'],
      ['same phase', '{"startupPhase":"copilot.sdk","event":"begin"}'],
      ['time window', 'inside the window'],
    ])
    expect(output.after).toEqual([{ block: 'after', time: '2026-11-14T05:00:01.000Z', message: 'service stopped' }])
    const human = await context.run(['--why'])
    expect(human.stdout).toContain('11/13/2026, 9:00:00 PM PST')
    expect(human.stdout).toContain('Correlation: phase=copilot.sdk')
    for (const label of ['[same phase]', '[time window]', '[after]']) expect(human.stdout).toContain(label)
    expect(human.stdout).not.toContain('too old for the window')
    expect(await readFile(context.calls, 'utf8')).not.toContain('systemctl')
  })

  it('finds an error correlated by session with all available identifiers, even outside the time window', async () => {
    const context = await fixture([
      journalLine({ level: 30, sessionId: 'session-a', msg: 'queued' }, -300),
      journalLine({ level: 30, sessionId: 'session-b', msg: 'other session' }, -200),
      journalLine({ level: 50, sessionId: 'session-a', computerId: 'computer-a', reqId: 'req-a', msg: 'Send failed', err: { message: 'offline' } }),
      journalLine({ level: 60, sessionId: 'session-b', msg: 'Newer failure' }, 10),
    ])
    const output = explanation(await context.run())
    expect(output.failure).toMatchObject({ kind: 'error', message: 'Newer failure' })
    expect(output.correlation).toEqual({ sessionId: 'session-b' })
    expect(output.before[0]).toMatchObject({ block: 'same session', message: expect.stringContaining('other session') })
    await writeFile(context.journal, [
      journalLine({ level: 30, sessionId: 'session-a', msg: 'queued' }, -300),
      journalLine({ level: 50, sessionId: 'session-a', computerId: 'computer-a', reqId: 'req-a', msg: 'Send failed' }),
    ].join('\n') + '\n')
    const session = explanation(await context.run())
    expect(session.correlation).toEqual({ sessionId: 'session-a', computerId: 'computer-a', requestId: 'req-a' })
    expect(session.before[0]).toMatchObject({ block: 'same session', message: expect.stringContaining('queued') })
  })

  it.each([
    { err: { message: 'err-only failure' } },
    { level: 'error', msg: 'named level failure' },
    { type: 'error', message: 'event failure' },
  ])('recognizes structured error shapes: %j', async (item) => {
    const context = await fixture([journalLine(item)])
    expect(explanation(await context.run()).failure?.kind).toBe('error')
  })

  it.each([40, '40', 'warn', 'warning', ' WARN ', 30, 'info'])(
    'honors explicit level %j over error-shaped warning fields', async (level) => {
      const message = "agentic-remote.service: Failed with result 'exit-code'."
      const context = await fixture([
        journalLine({ level, msg: 'retrying after a handled error', err: { message: 'handled' }, type: 'error' }),
        journalLine(message, 1),
      ])
      expect(explanation(await context.run()).failure).toMatchObject({ kind: 'unit', message })
    },
  )

  it('ignores a warning after a genuine error and does not invent a failure for warnings alone', async () => {
    const warning = journalLine({ level: 'warning', msg: 'retrying', err: { message: 'handled' } }, 1)
    const context = await fixture([
      journalLine({ level: 'error', msg: 'actual failure' }),
      warning,
    ])
    expect(explanation(await context.run()).failure).toMatchObject({ kind: 'error', message: 'actual failure' })
    await writeFile(context.journal, warning + '\n')
    expect(explanation(await context.run()).failure).toBeNull()
  })

  it('keeps error-shaped records as a fallback for absent or unknown levels', async () => {
    const context = await fixture([
      journalLine({ level: 'custom', err: { message: 'failure with unknown level' } }),
    ])
    expect(explanation(await context.run()).failure).toMatchObject({
      kind: 'error', message: 'failure with unknown level',
    })
  })

  it.each([
    ['reqId', 'req-1', 'same request', 'requestId'],
    ['computerId', 'node-1', 'same computer', 'computerId'],
    ['session_id', 'session-1', 'same session', 'sessionId'],
  ])('correlates %s records without a phase', async (key, value, block, normalized) => {
    const context = await fixture([
      journalLine({ [key]: value, msg: 'before' }, -500),
      journalLine({ level: 50, [key]: value, msg: 'failure' }),
    ])
    const output = explanation(await context.run())
    expect(output.correlation).toEqual({ [normalized]: value })
    expect(output.before[0]?.block).toBe(block)
  })

  it.each([
    'agentic-remote.service: Main process exited, code=exited, status=1/FAILURE',
    'agentic-remote.service: Main process exited, code=killed, status=9/KILL',
    "agentic-remote.service: Failed with result 'exit-code'.",
    'agentic-remote.service: Start request repeated too quickly.',
  ])('explains a unit-only failure: %s', async (message) => {
    const context = await fixture([journalLine('starting', -1), journalLine(message)])
    const output = explanation(await context.run())
    expect(output.failure).toMatchObject({ kind: 'unit', message })
    expect(output.correlation).toEqual({})
    expect(output.before).toEqual([{ block: 'time window', time: '2026-11-14T04:59:59.000Z', message: 'starting' }])
  })

  it('uses the last unfinished nested startup only when the unit is not active', async () => {
    const context = await fixture([
      journalLine({ startupPhase: 'service.start', event: 'begin' }, -5),
      journalLine({ startupPhase: 'copilot.start', event: 'begin' }, -4),
      journalLine({ startupPhase: 'copilot.sdk', event: 'begin' }, -3),
      journalLine({ startupPhase: 'copilot.sdk', event: 'complete' }, -2),
    ])
    expect(explanation(await context.run()).failure).toMatchObject({ kind: 'unfinished-startup', phase: 'copilot.start' })
    expect(await readFile(context.calls, 'utf8')).toContain('systemctl --user is-active agentic-remote.service')
    expect(explanation(await context.run(undefined, { TEST_ACTIVE: 'active' })).failure).toBeNull()
    await rm(path.join(context.bin, 'systemctl'))
    expect(explanation(await context.run()).failure).toBeNull()
  })

  it('clears unfinished phases on a new app.build and prefers a startup failure over a later error within two minutes', async () => {
    const context = await fixture([
      journalLine({ startupPhase: 'copilot.sdk', event: 'begin' }, -600),
      journalLine({ startupPhase: 'app.build', event: 'begin' }, -5),
      journalLine({ startupPhase: 'app.build', event: 'complete' }, -4),
    ])
    expect(explanation(await context.run()).failure).toBeNull()
    await writeFile(context.journal, [
      journalLine({ startupPhase: 'fastify.listen', event: 'fail' }, -2),
      journalLine({ startupPhase: 'app.build', event: 'begin' }, -1),
      journalLine({ level: 50, msg: 'later error' }),
    ].join('\n') + '\n')
    expect(explanation(await context.run(undefined, { TEST_ACTIVE: 'active' })).failure)
      .toMatchObject({ kind: 'startup', phase: 'fastify.listen' })
  })

  it('reports an unfinished startup newer than a recovered startup failure while the unit is not active', async () => {
    const context = await fixture([
      journalLine({ startupPhase: 'fastify.listen', event: 'fail' }, -3 * 3600),
      journalLine({ startupPhase: 'app.build', event: 'begin' }, -60),
      journalLine({ startupPhase: 'app.build', event: 'complete' }, -59),
      journalLine({ startupPhase: 'copilot.start', event: 'begin' }, -58),
    ])
    expect(explanation(await context.run()).failure).toMatchObject({ kind: 'unfinished-startup', phase: 'copilot.start' })
    expect(explanation(await context.run(undefined, { TEST_ACTIVE: 'active' })).failure)
      .toMatchObject({ kind: 'startup', phase: 'fastify.listen' })
  })

  it.each([
    ['a unit failure over a routine error ten minutes earlier', [
      journalLine({ level: 50, statusCode: 409, msg: 'This session is already responding' }, -600),
      journalLine(oomKill),
    ], { kind: 'unit', message: oomKill }],
    ['a structured error ten seconds before a unit failure', [
      journalLine({ level: 50, msg: 'heap allocation failed' }, -10),
      journalLine(oomKill),
    ], { kind: 'error', message: 'heap allocation failed' }],
    ['a newer error over a startup failure three hours earlier', [
      journalLine({ startupPhase: 'fastify.listen', event: 'fail' }, -3 * 3600),
      journalLine({ level: 50, msg: 'route failed' }),
    ], { kind: 'error', message: 'route failed' }],
    ['only the newest candidate when timestamps are missing', [
      JSON.stringify({ MESSAGE: JSON.stringify({ level: 50, msg: 'untimed error' }) }),
      JSON.stringify({ MESSAGE: oomKill }),
    ], { kind: 'unit', message: oomKill }],
  ])('reports %s', async (_case, lines, failure) => {
    const context = await fixture(lines)
    expect(explanation(await context.run()).failure).toMatchObject(failure)
  })

  it('caps same-key context at 20 and following context at 5 without duplicating window lines', async () => {
    const context = await fixture([
      ...Array.from({ length: 25 }, (_, index) => journalLine({ sessionId: 'session', msg: `before-${index}` }, index - 500)),
      journalLine({ level: 50, sessionId: 'session', msg: 'failure' }),
      ...Array.from({ length: 10 }, (_, index) => journalLine(`after-${index}`, index + 1)),
    ])
    const output = explanation(await context.run())
    expect(output.before).toHaveLength(20)
    expect(output.before[0].message).toContain('before-5')
    expect(output.after).toHaveLength(5)
    expect(output.after.at(-1)?.message).toBe('after-4')
    await writeFile(context.journal, [
      journalLine({ sessionId: 'session', msg: 'nearby' }, -1),
      journalLine({ level: 50, sessionId: 'session', msg: 'failure' }),
    ].join('\n') + '\n')
    expect(explanation(await context.run()).before).toHaveLength(1)
  })

  it('redacts credentials in structured fields, raw messages, correlation, and every output block', async () => {
    const secrets = ['before-token', 'basic-value', 'pair-secret', 'auth-secret', 'pass-secret', 'header-secret', 'after-token']
    const context = await fixture([
      journalLine({ sessionId: 'session', token: secrets[0], msg: `Authorization: Basic ${secrets[1]}` }, -300),
      journalLine(`pairing token="${secrets[2]}" Authorization: Bearer ${secrets[3]} password=${secrets[4]}`, -1),
      journalLine({
        level: 50, sessionId: 'session', msg: 'request failed',
        err: { headers: { Authorization: secrets[5] }, pairingToken: secrets[2], password: secrets[4] },
      }),
      journalLine(`access_token=${secrets[6]}`, 1),
    ])
    for (const args of [['--why'], ['--why', '--json']]) {
      const result = await context.run(args)
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('[REDACTED]')
      for (const secret of secrets) expect(result.stdout).not.toContain(secret)
      expect(result.stdout).not.toContain('environment-must-not-be-printed')
    }
    await writeFile(context.journal, journalLine({ level: 50, sessionId: 'Bearer correlation-secret', msg: 'token="failure-secret"' }) + '\n')
    const result = await context.run()
    expect(result.stdout).not.toContain('correlation-secret')
    expect(result.stdout).not.toContain('failure-secret')
  })

  it('redacts URL userinfo and query credentials in every output surface', async () => {
    const url = 'https://url-user:url-pass@fixture.invalid/path?%74oken=query-token&api_key=query-key&sig=query-signature&ok=visible'
    const context = await fixture([
      journalLine({ sessionId: url, details: [{ url }] }, -300),
      journalLine(`Connecting to ${url}`, -1),
      journalLine({ level: 50, sessionId: url, msg: `Request failed at ${url}`, details: { url } }),
      journalLine(`Retry postgresql://db-user:db-pass@fixture.invalid/path?access_token=after-token`, 1),
    ])
    for (const args of [['--why'], ['--why', '--json']]) {
      const result = await context.run(args)
      expect(result.code).toBe(0)
      for (const secret of ['url-user', 'url-pass', 'query-token', 'query-key', 'query-signature', 'db-user', 'db-pass', 'after-token']) {
        expect(result.stdout).not.toContain(secret)
      }
      expect(result.stdout).toContain('fixture.invalid/path')
      expect(result.stdout).toContain('ok=visible')
      expect(result.stdout).toContain('[REDACTED]')
    }
  })

  it('redacts whole Cookie, Set-Cookie, and Authorization header values in human and JSON output', async () => {
    const secrets = ['cookie-one', 'cookie-two', 'cookie-three', 'set-cookie-value', 'digest-user', 'digest-nonce',
      'digest-response', 'negotiate-value', 'msg-cookie', 'aws-signature', 'json-cookie']
    const context = await fixture([
      journalLine('Cookie: session=cookie-one; theme=cookie-two; csrf=cookie-three', -4),
      journalLine('Set-Cookie: sid=set-cookie-value; Path=/; Expires=Wed, 18 Nov 2026 07:28:00 GMT; HttpOnly; Secure', -3),
      journalLine('Authorization: Digest username="digest-user", realm="fixture", nonce="digest-nonce", response="digest-response"', -2),
      journalLine({ level: 50, sessionId: 'session', msg: 'upstream rejected Proxy-Authorization: Negotiate negotiate-value; Cookie: a=msg-cookie' }),
      journalLine('authorization: AWS4-HMAC-SHA256 Credential=fixture/20261116/us-east-1/s3/aws4_request, SignedHeaders=host, Signature=aws-signature', 1),
      journalLine('replaying {"headers":{"cookie":"sid=json-cookie"}}', 2),
    ])
    for (const args of [['--why'], ['--why', '--json']]) {
      const result = await context.run(args)
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('upstream rejected')
      expect(result.stdout).toContain('[REDACTED]')
      for (const secret of secrets) expect(result.stdout).not.toContain(secret)
    }
  })

  it('decodes byte-array messages and strips terminal escapes before detecting failures and redacting', async () => {
    const coloured = (message: string, seconds = 0) => journalRecord([...Buffer.from(message)], seconds)
    const secrets = ['coloured-bearer', 'linked-bearer']
    const context = await fixture([
      journalRecord(null, -3),
      coloured('\x1b[1mAuthorization:\x1b[0m Bearer \x1b[33mcoloured-bearer\x1b[0m', -2),
      coloured('retrying with \x1b]8;;https://fixture.invalid\x07\x1b[1mBearer\x1b[0m\x1b]8;;\x1b\\ linked-bearer', -1),
      coloured(`\x1b[31m${JSON.stringify({ level: 50, msg: 'coloured failure' })}\x1b[0m`),
    ])
    for (const args of [['--why'], ['--why', '--json']]) {
      const result = await context.run(args)
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('coloured failure')
      expect(result.stdout).not.toContain('MESSAGE')
      for (const secret of secrets) {
        expect(result.stdout).not.toContain(secret)
        expect(result.stdout).not.toContain([...Buffer.from(secret)].join(','))
      }
    }
    expect(explanation(await context.run()).failure).toMatchObject({ kind: 'error', message: 'coloured failure' })
    expect(await readFile(context.calls, 'utf8')).toContain(' --output-fields=MESSAGE --all ')
  })

  it.each(['PRIVATE KEY', 'RSA PRIVATE KEY', 'EC PRIVATE KEY', 'OPENSSH PRIVATE KEY', 'ENCRYPTED PRIVATE KEY'])(
    'redacts multiline %s blocks in raw and structured messages', async (label) => {
      const key = `-----BEGIN ${label}-----\nfictional-key-first-line\nfictional-key-second-line\n-----END ${label}-----`
      const context = await fixture([
        journalLine({ sessionId: 'session', details: [key] }, -300),
        journalLine(`Before ${key}`, -1),
        journalLine({ level: 50, sessionId: 'session', msg: `Failure ${key}`, details: { key } }),
        journalLine(`After ${key}`, 1),
      ])
      for (const args of [['--why'], ['--why', '--json']]) {
        const result = await context.run(args)
        expect(result.code).toBe(0)
        expect(result.stdout).not.toContain('fictional-key-')
        expect(result.stdout).not.toContain(`BEGIN ${label}`)
        expect(result.stdout).toContain('[REDACTED]')
      }
    },
  )

  it('redacts private key fragments across journal entries before selecting bounded context', async () => {
    const context = await fixture([
      journalLine('-----BEGIN PRIVATE KEY-----', -300),
      journalLine('fictional-before-key-body', -1),
      journalLine('-----END PRIVATE KEY-----', -1),
      journalLine({ level: 50, msg: 'request failed' }),
      journalLine('-----BEGIN RSA PRIVATE KEY-----', 1),
      journalLine('fictional-after-key-body', 2),
      journalLine('-----END RSA PRIVATE KEY-----', 3),
      journalLine('safe context after the key', 4),
    ])
    for (const args of [['--why'], ['--why', '--json']]) {
      const result = await context.run(args)
      expect(result.code).toBe(0)
      expect(result.stdout).not.toContain('fictional-before-key-body')
      expect(result.stdout).not.toContain('fictional-after-key-body')
      expect(result.stdout).toContain('request failed')
      expect(result.stdout).toContain('safe context after the key')
      expect(result.stdout).toContain('[REDACTED]')
    }
  })

  it('redacts unterminated private keys through the end of the journal', async () => {
    const context = await fixture([
      journalLine({ level: 50, msg: '-----BEGIN PRIVATE KEY-----\nfictional-truncated-key' }),
      journalLine('fictional-key-continuation', 1),
    ])
    for (const args of [['--why'], ['--why', '--json']]) {
      const result = await context.run(args)
      expect(result.code).toBe(0)
      expect(result.stdout).not.toContain('fictional-')
      expect(result.stdout).toContain('[REDACTED]')
    }
  })

  it('does not execute log text, read environment contents, or modify fixture inputs', async () => {
    const context = await fixture()
    const marker = path.join(context.root, 'must-not-exist')
    const journal = journalLine({ level: 50, msg: `$(printf unexpected >"${marker}")` }) + '\n'
    await writeFile(context.journal, journal)
    const result = await context.run()
    expect(result.code).toBe(0)
    expect(await readFile(context.journal, 'utf8')).toBe(journal)
    expect(await readFile(context.environment, 'utf8')).toBe('TOKEN=environment-must-not-be-printed\n')
    await expect(readFile(marker)).rejects.toMatchObject({ code: 'ENOENT' })
    expect((await readFile(context.calls, 'utf8')).trim().split('\n')).toEqual([
      'journalctl --user --unit agentic-remote.service -o json --output-fields=MESSAGE --all --since -6h --no-pager',
    ])
  })

  it('finds a failure older than the last 2,000 lines in more than 1 MB of journal output', async () => {
    const filler = Array.from({ length: 3000 }, (_, index) =>
      journalLine({ level: 30, msg: `request ${index} ${'x'.repeat(400)}` }))
    const context = await fixture([journalLine({ level: 50, msg: 'early failure' }), ...filler])
    const result = await context.run()
    expect(result.code).toBe(0)
    expect(JSON.parse(result.stdout).failure).toMatchObject({ kind: 'error', message: 'early failure' })
  })

  it('keeps only the 20 time-window lines closest to the failure and counts the rest', async () => {
    const busy = Array.from({ length: 60 }, (_, index) => journalLine({ level: 30, msg: `request ${index}` }, index))
    const context = await fixture([...busy, journalLine({ level: 50, msg: 'busy failure' }, 61)])
    const json = JSON.parse((await context.run()).stdout)
    expect(json.before.filter((line: { block: string }) => line.block === 'time window')).toHaveLength(20)
    expect(json.before.at(-1).message).toContain('request 59')
    expect(json.omittedWindowLines).toBe(40)
    expect((await context.run(['--why'])).stdout).toContain('40 earlier lines in the 2-minute window omitted')
  })

  it('reports no failure without an error, including a clean unit exit', async () => {
    const context = await fixture([
      journalLine({ level: 30, msg: 'healthy' }),
      journalLine('agentic-remote.service: Main process exited, code=exited, status=0/SUCCESS'),
    ])
    const human = await context.run(['--why'])
    expect(human).toMatchObject({ code: 0, stdout: 'No failure found in -6h\n', stderr: '' })
    expect(explanation(await context.run())).toEqual({ failure: null, correlation: {}, omittedWindowLines: 0, before: [], after: [] })
  })

  it('supports empty journals and timestamp-free structured lines without inventing wall-clock times', async () => {
    const context = await fixture()
    expect(explanation(await context.run()).failure).toBeNull()
    await writeFile(context.journal, '{"startupPhase":"copilot.sdk","event":"fail","elapsedMs":500}\n')
    expect(explanation(await context.run()).failure?.time).toBeNull()
    expect((await context.run(['--why'])).stdout).toContain('time unavailable')
  })

  it('uses a pino timestamp when journal metadata has no timestamp and prefers an error over a unit failure', async () => {
    const context = await fixture([
      JSON.stringify({ level: 50, time: epoch, reqId: 'request', msg: 'request failed' }),
      journalLine("agentic-remote.service: Failed with result 'exit-code'.", 1),
    ])
    expect(explanation(await context.run()).failure).toMatchObject({
      kind: 'error', time: '2026-11-14T05:00:00.000Z', message: 'request failed',
    })
  })

  it('passes journal time expressions as a single literal argument', async () => {
    const context = await fixture()
    const result = await context.run(['--why', '--since', '1 hour ago'], { TEST_SINCE: '1 hour ago' })
    expect(result).toMatchObject({ code: 0, stdout: 'No failure found in 1 hour ago\n' })
  })

  it.each([
    ['--why', '--unknown'],
    ['--why', 'extra'],
    ['--why', '--since'],
    ['--why', '--since', ''],
    ['--why', '--since', '-x'],
    ['--why', '--since', '--json'],
    ['--json'],
    ['--since', '-1h'],
  ])('rejects invalid arguments without reading the journal: %j', async (...args) => {
    const context = await fixture()
    expect((await context.run(args)).code).toBe(2)
    expect(await readFile(context.calls, 'utf8')).toBe('')
  })

  it('fails with exit 1 if journalctl or Node is missing', async () => {
    const context = await fixture()
    await rm(path.join(context.bin, 'journalctl'))
    const missingJournal = await context.run()
    expect(missingJournal.code).toBe(1)
    expect(missingJournal.stdout).toBe('')
    expect(missingJournal.stderr).toContain('user journal could not be read')
    await rm(path.join(context.bin, 'node'))
    expect((await context.run()).code).toBe(1)
  })

  it.each([1, 0])('fails for an unreadable journal even if journalctl exits %s', async (status) => {
    const context = await fixture()
    const result = await context.run(undefined, {
      TEST_JOURNAL_ERROR: 'No journal files were opened due to insufficient permissions. token=not-for-output',
      TEST_JOURNAL_STATUS: String(status),
    })
    expect(result.code).toBe(1)
    expect(result.stdout).toBe('')
    expect(result.stderr).not.toContain('not-for-output')
  })

  it('preserves no-option journal following and documents read-only options without querying anything', async () => {
    const context = await fixture()
    expect(await context.run([])).toMatchObject({ code: 0, stdout: 'following fixture\n', stderr: '' })
    const help = await context.run(['--help'])
    expect(help.code).toBe(0)
    expect(help.stdout).toContain('--since TIME')
    expect(help.stdout).toContain('--json')
    expect(help.stdout).toContain('No environment files are read')
    expect((await readFile(context.calls, 'utf8')).trim()).toBe('journalctl --user --unit agentic-remote.service --follow')
  })
})
