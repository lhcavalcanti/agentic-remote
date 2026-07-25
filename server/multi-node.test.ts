import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it } from 'vitest'
import WebSocket from 'ws'
import type {
  DirectoryListing,
  HubEvent,
  ServerEvent,
  SessionDetail,
  SlashCommand,
} from '../shared/contracts.js'
import { buildApp } from './app.js'
import type { SessionService } from './session-service.js'

class FakeSessionService extends EventEmitter implements SessionService {
  private readonly sessions = new Map<string, SessionDetail>()
  lastCreateTerminalBacked?: boolean

  constructor(...sessions: SessionDetail[]) {
    super()
    for (const session of sessions) {
      this.sessions.set(session.id, structuredClone(session))
    }
  }

  async start() {}
  async stop() {}

  listSessions(): SessionDetail[] {
    return [...this.sessions.values()]
      .filter((session) => session.isOpen)
      .map((session) => ({
        ...structuredClone(session),
        messages: [],
      }))
  }

  listHistory(): SessionDetail[] {
    return [...this.sessions.values()].map((session) => ({
      ...structuredClone(session),
      messages: [],
    }))
  }

  async listDirectories(path = '~'): Promise<DirectoryListing> {
    return {
      path,
      parent: path === '~' ? undefined : '~',
      directories:
        path === '~'
          ? [{ name: 'src', path: '~/src' }]
          : [],
    }
  }

  getSession(id: string): SessionDetail | undefined {
    const session = this.sessions.get(id)
    return session ? structuredClone(session) : undefined
  }

  async openSession(id: string): Promise<SessionDetail> {
    const session = this.getSession(id)
    if (!session) {
      throw new Error('Session not found')
    }
    return session
  }

  async activateSession(id: string): Promise<SessionDetail> {
    const session = this.sessions.get(id)
    if (!session) {
      throw new Error('Session not found')
    }
    session.isOpen = true
    return structuredClone(session)
  }

  async createSession(
    cwd: string,
    terminalBacked?: boolean,
  ): Promise<SessionDetail> {
    this.lastCreateTerminalBacked = terminalBacked
    const session: SessionDetail = {
      id: randomUUID(),
      cwd,
      title: 'New session',
      updatedAt: new Date().toISOString(),
      status: 'idle',
      isOpen: true,
      messages: [],
    }
    this.sessions.set(session.id, session)
    this.emitEvent({ type: 'session.upserted', session })
    return structuredClone(session)
  }

  async renameSession(id: string, title: string): Promise<SessionDetail> {
    const session = this.sessions.get(id)
    if (!session) {
      throw new Error('Session not found')
    }
    session.title = title
    this.emitEvent({ type: 'session.upserted', session })
    return structuredClone(session)
  }

  async removeQueuedPrompt(sessionId: string, promptId: string) {
    const session = this.sessions.get(sessionId)
    const prompt = session?.queuedPrompts?.find((entry) => entry.id === promptId)
    if (!session || !prompt) {
      throw new Error('Queued prompt not found')
    }
    session.queuedPrompts = session.queuedPrompts?.filter(
      (entry) => entry.id !== promptId,
    )
    session.queuedCount = session.queuedPrompts?.length || 0
    this.emitEvent({ type: 'session.upserted', session })
    return { session: structuredClone(session), prompt }
  }

  async sendMessage(sessionId: string, content: string): Promise<SessionDetail> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }
    session.messages.push({
      id: randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    })

    session.updatedAt = new Date().toISOString()
    this.emitEvent({ type: 'session.upserted', session: structuredClone(session) })
    return structuredClone(session)
  }

  async listCommands(): Promise<SlashCommand[]> {
    return [
      {
        name: 'model',
        description: 'Select model',
        inputHint: 'model',
        allowDuringAgentExecution: false,
      },
    ]
  }

  async executeCommand(
    sessionId: string,
    command: string,
  ): Promise<SessionDetail> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }
    session.messages.push({
      id: randomUUID(),
      role: 'notice',
      content: command,
      createdAt: new Date().toISOString(),
    })
    return structuredClone(session)
  }

  async cancel() {}

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.sessions.delete(sessionId)) {
      throw new Error('Session not found')
    }
    this.emitEvent({ type: 'session.removed', sessionId })
  }

  async replyPermission(
    sessionId: string,
    _requestId: string,
    _optionId: string,
  ): Promise<SessionDetail> {
    return this.openSession(sessionId)
  }

  private emitEvent(event: ServerEvent) {
    this.emit('event', event)
  }
}

function session(id: string, title: string, isOpen = true): SessionDetail {
  return {
    id,
    cwd: `/srv/${id}`,
    title,
    updatedAt: '2026-07-22T00:00:00.000Z',
    status: 'idle',
    isOpen,
    messages: [
      {
        id: `${id}-message`,
        role: 'assistant',
        content: `${title} history`,
        createdAt: '2026-07-22T00:00:00.000Z',
      },
    ],
  }
}

const directories: string[] = []

async function temporaryDirectory(label: string): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), `${label}-`))
  directories.push(directory)
  return directory
}

function waitForEvent(
  socket: WebSocket,
  predicate: (event: HubEvent) => boolean,
): Promise<HubEvent> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off('message', handleMessage)
      reject(new Error('Timed out waiting for hub event'))
    }, 5_000)
    const handleMessage = (raw: WebSocket.RawData) => {
      const event = JSON.parse(raw.toString()) as HubEvent
      if (!predicate(event)) {
        return
      }
      clearTimeout(timer)
      socket.off('message', handleMessage)
      resolve(event)
    }
    socket.on('message', handleMessage)
  })
}

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('multi-node hub', () => {
  it('registers, aggregates, routes, and deletes remote sessions', async () => {
    const remoteSession = session('remote-session', 'Remote')
    remoteSession.queuedCount = 1
    remoteSession.queuedPrompts = [
      {
        id: 'remote-queue',
        content: 'Queued remote prompt',
        createdAt: '2026-07-25T01:00:00.000Z',
      },
    ]
    const remoteService = new FakeSessionService(
      remoteSession,
      session('historical-session', 'Historical', false),
    )
    const remote = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-node'),
      logger: false,
      role: 'node',
      service: remoteService,
    })
    await remoteService.start()
    await remote.app.listen({ host: '127.0.0.1', port: 0 })
    const remoteAddress = remote.app.server.address() as AddressInfo
    const remoteUrl = `http://127.0.0.1:${remoteAddress.port}`

    const localService = new FakeSessionService(session('local-session', 'Local'))
    const hub = await buildApp({
      dataDirectory: await temporaryDirectory('agentic-remote-hub'),
      logger: false,
      role: 'hub',
      service: localService,
    })
    await localService.start()
    await hub.app.listen({ host: '127.0.0.1', port: 0 })
    const hubAddress = hub.app.server.address() as AddressInfo
    let hubSocket: WebSocket | undefined

    try {
      const unauthorized = await remote.app.inject({
        method: 'GET',
        url: '/node-api/info',
      })
      expect(unauthorized.statusCode).toBe(401)

      const registered = await hub.app.inject({
        method: 'POST',
        url: '/api/computers',
        payload: {
          baseUrl: remoteUrl,
          token: remote.identity.token,
          name: 'homelab-prod',
        },
      })
      expect(registered.statusCode).toBe(201)
      const remoteComputerId = registered.json().computer.id as string
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const status = await hub.app.inject({
          method: 'GET',
          url: '/api/computers',
        })
        const online = status
          .json()
          .computers.find(
            (entry: { id: string }) => entry.id === remoteComputerId,
          )?.online
        if (online) {
          break
        }
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      hubSocket = new WebSocket(
        `ws://127.0.0.1:${hubAddress.port}/api/events`,
      )
      await new Promise<void>((resolve, reject) => {
        hubSocket?.once('open', resolve)
        hubSocket?.once('error', reject)
      })

      const computers = await hub.app.inject({
        method: 'GET',
        url: '/api/computers',
      })
      expect(computers.json().computers).toHaveLength(2)

      const directories = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/directories?path=~`,
      })
      expect(directories.json()).toMatchObject({
        path: '~',
        directories: [{ name: 'src', path: '~/src' }],
      })

      const sessions = await hub.app.inject({
        method: 'GET',
        url: '/api/sessions',
      })
      expect(
        sessions
          .json()
          .sessions.map((entry: { computerName: string }) => entry.computerName),
      ).toEqual(expect.arrayContaining(['homelab-prod', hub.identity.info.name]))

      const created = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions`,
        payload: { cwd: '/srv/new-session' },
      })
      expect(created.statusCode, created.body).toBe(201)
      expect(remoteService.lastCreateTerminalBacked).toBe(true)

      const detail = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session`,
      })
      expect(detail.json().session).toMatchObject({
        computerName: 'homelab-prod',
        messages: [{ content: 'Remote history' }],
      })
      const renamed = await hub.app.inject({
        method: 'PATCH',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session`,
        payload: { title: 'Renamed remote' },
      })
      expect(renamed.json().session).toMatchObject({
        title: 'Renamed remote',
        computerName: 'homelab-prod',
      })
      const removedQueue = await hub.app.inject({
        method: 'DELETE',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/queue/remote-queue`,
      })
      expect(removedQueue.json()).toMatchObject({
        session: { queuedCount: 0, computerName: 'homelab-prod' },
        prompt: { content: 'Queued remote prompt' },
      })

      const history = await hub.app.inject({
        method: 'GET',
        url: '/api/history',
      })
      expect(history.json().sessions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'historical-session',
            computerName: 'homelab-prod',
            isOpen: false,
          }),
        ]),
      )
      const opened = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/historical-session/open`,
        payload: {},
      })
      expect(opened.json().session).toMatchObject({
        id: 'historical-session',
        isOpen: true,
      })

      const commands = await hub.app.inject({
        method: 'GET',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/commands`,
      })
      expect(commands.json().commands).toEqual([
        expect.objectContaining({ name: 'model' }),
      ])
      const command = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/commands`,
        payload: { command: '/model gpt-5.6-sol' },
      })
      expect(command.json().session.messages.at(-1)).toMatchObject({
        role: 'notice',
        content: '/model gpt-5.6-sol',
      })

      const upserted = waitForEvent(
        hubSocket,
        (event) =>
          event.type === 'session.upserted' &&
          event.session.computerId === remoteComputerId &&
          event.session.id === 'remote-session',
      )
      const sent = await hub.app.inject({
        method: 'POST',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session/messages`,
        payload: { content: 'hello remote' },
      })
      expect(sent.statusCode, sent.body).toBe(202)
      expect(sent.json().session.messages.at(-1)).toMatchObject({
        role: 'user',
        content: 'hello remote',
      })
      await expect(upserted).resolves.toMatchObject({
        type: 'session.upserted',
        session: { computerName: 'homelab-prod' },
      })

      const removed = waitForEvent(
        hubSocket,
        (event) =>
          event.type === 'session.removed' &&
          event.computerId === remoteComputerId &&
          event.sessionId === 'remote-session',
      )
      const deleted = await hub.app.inject({
        method: 'DELETE',
        url: `/api/computers/${remoteComputerId}/sessions/remote-session`,
      })
      expect(deleted.statusCode, deleted.body).toBe(204)
      expect(remoteService.getSession('remote-session')).toBeUndefined()
      await expect(removed).resolves.toMatchObject({
        type: 'session.removed',
        computerId: remoteComputerId,
      })
    } finally {
      hubSocket?.close()
      await hub.app.close()
      await remote.app.close()
    }
  })
})
