import { execFile, spawn, type ChildProcess } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rmdir, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import Fastify from 'fastify'
import { afterEach, expect, it, vi } from 'vitest'
import {
  findActiveCopilotProcesses,
  stopActiveCopilotSession,
} from './active-sessions.js'
import { AgentService, type CopilotClientLike } from './agent-service.js'
import { ComputerManager } from './computer-manager.js'
import { ComputerRegistry } from './computer-registry.js'
import { registerHubRoutes } from './hub-routes.js'
import { KnowledgeStore } from './knowledge-store.js'
import type { NodeIdentityStore } from './node-identity.js'
import type { SessionService } from './session-service.js'
import { SessionStore } from './session-store.js'
import { TmuxTerminalSessionController } from './terminal-session.js'
import { noTmuxServer } from './tmux-errors.js'
import { eventually } from './tmux-test-helpers.js'

const execFileAsync = promisify(execFile)
const computerId = 'owned-tmux-hub'
const headers = { host: 'localhost' }

afterEach(() => vi.unstubAllEnvs())

it.skipIf(process.platform !== 'linux')(
  'refuses hub suspend and delete after unlinking an owned live tmux server socket',
  async () => {
    const directory = await mkdtemp('.tmux-socket-evidence-')
    // A proc alias keeps sun_path below Linux's length limit in deep worktrees.
    const socket = `/proc/${process.pid}/cwd/${directory}/socket`
    const scriptFile = `${directory}/copilot-socket-fixture.cjs`
    const script = path.resolve(scriptFile)
    const sessionId = randomUUID()
    await writeFile(scriptFile, 'setTimeout(() => {}, 180_000)\n')
    vi.stubEnv('TMUX', `${socket},0,0`)
    vi.stubEnv('COPILOT_HOME', path.resolve(directory, 'copilot-home'))
    const env = { ...process.env, TMUX: '', HOME: path.resolve(directory) }
    const server = spawn('tmux', ['-D', '-f', '/dev/null', '-S', socket], {
      env,
      stdio: 'ignore',
      timeout: 180_000,
    })
    let startupError: Error | undefined
    const exited = new Promise<void>((resolve) => {
      server.once('exit', () => resolve())
      server.once('error', (error) => {
        startupError = error
        resolve()
      })
    })
    let hub: Awaited<ReturnType<typeof createHub>> | undefined
    try {
      expect(
        await eventually(
          () => {
            if (startupError) {
              throw startupError
            }
            if (server.exitCode !== null || server.signalCode !== null) {
              throw new Error('Owned tmux server exited before creating its socket')
            }
            return stat(socket).then(() => true, () => false)
          },
          Boolean,
          30_000,
        ),
      ).toBe(true)
      await execFileAsync(
        'tmux',
        [
          '-S',
          socket,
          'new-session',
          '-d',
          '-s',
          'owned',
          process.execPath,
          script,
          '--session-id',
          sessionId,
        ],
        { env },
      )
      const { stdout } = await execFileAsync(
        'tmux',
        ['-S', socket, 'display-message', '-p', '-t', 'owned', '#{pane_pid}'],
        { env },
      )
      const panePid = Number.parseInt(stdout, 10)
      expect(panePid).toBeGreaterThan(0)
      expect(
        await eventually(
          () => readFile(`/proc/${panePid}/cmdline`, 'utf8'),
          (command) => command.includes(script) && command.includes(sessionId),
          30_000,
        ),
      ).toContain(script)
      expect(await findActiveCopilotProcesses()).toEqual([
        { pid: panePid, sessionId, source: 'argument' },
      ])
      const controller = new TmuxTerminalSessionController()
      expect(await controller.has(sessionId)).toBe(true)
      hub = await createHub(directory, controller)
      await seedSession(hub.store, directory, sessionId)
      const before = hub.store.get(sessionId)
      const persisted = await readFile(`${directory}/state.json`, 'utf8')
      const listed = await hub.app.inject({ url: '/api/sessions', headers })
      expect(listed.statusCode).toBe(200)
      expect(listed.json().sessions).toEqual([
        expect.objectContaining({
          id: sessionId,
          computerId,
          executionMode: 'tmux',
          status: 'idle',
        }),
      ])
      await unlink(`${directory}/socket`)

      const failure = await execFileAsync(
        'tmux',
        ['-S', socket, 'list-panes'],
        { env },
      ).then(() => undefined, (error: unknown) => error)
      expect(failure).toMatchObject({
        stderr: expect.stringContaining('No such file or directory'),
      })
      expect(await readFile('/proc/net/unix', 'utf8')).toContain(socket)
      expect(await readFile(`/proc/${server.pid}/comm`, 'utf8')).toContain('tmux')
      expect(await noTmuxServer(failure)).toBe(false)
      await expect(findActiveCopilotProcesses()).rejects.toThrow(
        'No such file or directory',
      )
      await expect(stopActiveCopilotSession(sessionId)).rejects.toThrow(
        'No such file or directory',
      )
      await expect(controller.stop(sessionId)).rejects.toThrow(
        'No such file or directory',
      )

      const sessionUrl = `/api/computers/${computerId}/sessions/${sessionId}`
      for (const request of [
        { method: 'POST', url: `${sessionUrl}/suspend` },
        { method: 'DELETE', url: sessionUrl },
      ] as const) {
        const response = await hub.app.inject({ ...request, headers })
        expect(response.statusCode).toBe(500)
        expect(response.json().message).toContain('No such file or directory')
        expect(response.json().message).toContain(socket)
        expect(hub.store.get(sessionId)).toEqual(before)
        expect(await readFile(`${directory}/state.json`, 'utf8')).toBe(persisted)
        expect(await readFile(sessionLog(directory, sessionId), 'utf8')).toBe('')
        expect(
          (await hub.app.inject({ url: '/api/sessions', headers })).json(),
        ).toEqual(listed.json())
        expect(await readFile(`/proc/${panePid}/cmdline`, 'utf8')).toContain(script)
        expect(await readFile(`/proc/${server.pid}/comm`, 'utf8')).toContain('tmux')
      }
      expect(hub.terminalStop).toHaveBeenCalledWith(sessionId, expect.any(Function))
      expect(hub.activeStopper).toHaveBeenCalledExactlyOnceWith(sessionId)
      expect(hub.client.createSession).not.toHaveBeenCalled()
      expect(hub.client.resumeSession).not.toHaveBeenCalled()
      expect(hub.client.deleteSession).not.toHaveBeenCalled()
    } finally {
      try {
        await hub?.close()
      } finally {
        await stopOwnedServer(server, exited)
        await removeFixture(directory, sessionId)
      }
    }
  },
  90_000,
)

it.skipIf(process.platform !== 'linux')(
  'keeps empty and cold-start sessions working through the hub without a tmux server',
  async () => {
    const directory = await mkdtemp('.tmux-socket-evidence-')
    const sessionId = randomUUID()
    const socket = `/proc/${process.pid}/cwd/${directory}/socket`
    vi.stubEnv('TMUX', `${socket},0,0`)
    vi.stubEnv('COPILOT_HOME', path.resolve(directory, 'copilot-home'))
    let hub: Awaited<ReturnType<typeof createHub>> | undefined
    try {
      hub = await createHub(directory, new TmuxTerminalSessionController())
      const empty = await hub.app.inject({ url: '/api/sessions', headers })
      expect(empty.statusCode).toBe(200)
      expect(empty.json()).toEqual({
        sessions: [],
        answeredComputerIds: [computerId],
      })
      await expect(findActiveCopilotProcesses()).resolves.toEqual([])
      await seedSession(hub.store, directory, sessionId)
      const sessionUrl = `/api/computers/${computerId}/sessions/${sessionId}`
      const suspended = await hub.app.inject({
        method: 'POST',
        url: `${sessionUrl}/suspend`,
        headers,
      })
      expect(suspended.statusCode).toBe(200)
      expect(suspended.json().session).toMatchObject({
        id: sessionId,
        computerId,
        suspended: true,
        isOpen: true,
      })
      expect(hub.store.get(sessionId)?.suspended).toBe(true)
      const deleted = await hub.app.inject({
        method: 'DELETE',
        url: sessionUrl,
        headers,
      })
      expect(deleted.statusCode).toBe(204)
      expect(hub.store.get(sessionId)).toBeUndefined()
      expect(JSON.parse(await readFile(`${directory}/state.json`, 'utf8')).sessions)
        .toEqual({})
      expect(
        (await hub.app.inject({ url: '/api/sessions', headers })).json(),
      ).toEqual(empty.json())
      expect(hub.client.createSession).not.toHaveBeenCalled()
      expect(hub.client.resumeSession).not.toHaveBeenCalled()
      expect(hub.client.deleteSession).not.toHaveBeenCalled()
    } finally {
      try {
        await hub?.close()
      } finally {
        await removeFixture(directory, sessionId)
      }
    }
  },
  90_000,
)

async function createHub(
  directory: string,
  controller: TmuxTerminalSessionController,
) {
  const forbidden = async () => {
    throw new Error('The owned tmux fixture must never invoke an SDK provider')
  }
  const client = {
    start: vi.fn(async () => {}),
    stop: vi.fn(async () => []),
    createSession: vi.fn(forbidden),
    resumeSession: vi.fn(forbidden),
    deleteSession: vi.fn(forbidden),
    listSessions: vi.fn(async () => []),
    rpc: {
      commands: { list: vi.fn(async () => ({ commands: [] })) },
      models: { list: vi.fn(async () => ({ models: [] })) },
    },
  } satisfies CopilotClientLike
  const store = new SessionStore(directory)
  await store.initialize()
  const activeStopper = vi.fn(stopActiveCopilotSession)
  const terminalStop = vi.spyOn(controller, 'stop')
  const service = new AgentService(
    store,
    client,
    undefined,
    activeStopper,
    undefined,
    undefined,
    controller,
  )
  // Exercise the real lifecycle methods without starting unrelated discovery
  // timers, SDK runtimes, or provider dispatch. The hub itself never listens.
  const localService = {
    providers: service.providers.bind(service),
    listSessions: service.listSessions.bind(service),
    suspendSession: service.suspendSession.bind(service),
    deleteSession: service.deleteSession.bind(service),
    on: service.on.bind(service),
    off: service.off.bind(service),
  } satisfies Pick<
    SessionService,
    'providers' | 'listSessions' | 'suspendSession' | 'deleteSession' | 'on' | 'off'
  >
  const manager = new ComputerManager(
    localService as SessionService,
    { info: { id: computerId, name: 'Owned tmux fixture', version: 'test' } } as NodeIdentityStore,
    new ComputerRegistry(directory),
  )
  const app = Fastify()
  const knowledge = new KnowledgeStore(directory)
  try {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'http://localhost')
    await manager.initialize()
    await knowledge.initialize()
    await registerHubRoutes(app, manager, knowledge)
    const health = await app.inject({ url: '/api/health', headers })
    expect(health.statusCode).toBe(200)
    expect(health.json()).toEqual({ ok: true })
    const computers = await app.inject({ url: '/api/computers', headers })
    expect(computers.statusCode).toBe(200)
    expect(computers.json().computers).toEqual([
      expect.objectContaining({ id: computerId, isLocal: true, online: true }),
    ])
    return { app, store, client, terminalStop, activeStopper, close }
  } catch (error) {
    await close()
    throw error
  }

  async function close(): Promise<void> {
    try {
      await app.close()
    } finally {
      manager.stop()
      await service.stop()
    }
  }
}

function sessionLog(directory: string, sessionId: string): string {
  return `${directory}/copilot-home/session-state/${sessionId}/events.jsonl`
}

async function seedSession(store: SessionStore, directory: string, sessionId: string) {
  const log = sessionLog(directory, sessionId)
  await mkdir(path.dirname(log), { recursive: true })
  await writeFile(log, '')
  const timestamp = new Date().toISOString()
  await store.create(
    {
      id: sessionId,
      cwd: path.resolve(directory),
      title: 'Owned socket regression',
      updatedAt: timestamp,
      status: 'idle',
      isOpen: true,
      messages: [{
        id: randomUUID(),
        role: 'user',
        content: 'Preserve this owned transcript when the socket is lost',
        createdAt: timestamp,
      }],
    },
    { managedOpen: true, backend: 'terminal' },
  )
}

async function stopOwnedServer(server: ChildProcess, exited: Promise<void>): Promise<void> {
  // Both signals address the foreground ChildProcess created by this test.
  server.kill('SIGTERM')
  const escalation = setTimeout(() => server.kill('SIGKILL'), 15_000)
  let deadline: NodeJS.Timeout | undefined
  try {
    await Promise.race([
      exited,
      new Promise<never>((_, reject) => {
        deadline = setTimeout(
          () => reject(new Error('Owned tmux fixture did not exit')),
          30_000,
        )
      }),
    ])
  } finally {
    clearTimeout(escalation)
    clearTimeout(deadline)
  }
}

async function removeFixture(directory: string, sessionId: string): Promise<void> {
  for (const file of [
    `${directory}/socket`,
    `${directory}/copilot-socket-fixture.cjs`,
    `${directory}/state.json`,
    `${directory}/computers.json`,
    `${directory}/knowledge.json`,
    sessionLog(directory, sessionId),
  ]) {
    await unlink(file).catch(ignoreMissing)
  }
  for (const folder of [
    path.dirname(sessionLog(directory, sessionId)),
    `${directory}/copilot-home/session-state`,
    `${directory}/copilot-home`,
    directory,
  ]) {
    await rmdir(folder).catch(ignoreMissing)
  }
}

function ignoreMissing(error: NodeJS.ErrnoException): void {
  if (error.code !== 'ENOENT') {
    throw error
  }
}
