import React from 'react'
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../../src/App'
import { UserInputFieldControl } from '../../../src/features/prompts/PromptCards'
import * as api from '../../../src/api'
import type { ManagedSession } from '../../../shared/contracts'

vi.mock('../../../src/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/api')>()
  return Object.fromEntries(Object.entries(actual).map(([name, value]) => [
    name,
    typeof value === 'function' && name !== 'SessionKnowledgeRequestError' ? vi.fn() : value,
  ]))
})

class Socket {
  static instances: Socket[] = []
  onmessage?: (event: MessageEvent) => void
  onopen?: () => void
  onclose?: () => void
  constructor() { Socket.instances.push(this) }
  close() {}
}
const now = '2026-09-09T12:00:00.000Z'
let sessions: ManagedSession[]
const key = (session: ManagedSession) => `${session.computerId}:${session.id}`
function makeSession(id: string): ManagedSession {
  return {
    id, computerId: 'synthetic-computer', computerName: 'Synthetic computer',
    cwd: '/home/synthetic/workspace', title: `Synthetic ${id}`, provider: 'copilot',
    executionMode: 'sdk', status: 'idle', isOpen: true, revision: 1,
    updatedAt: now,
    messages: [{ id: `${id}-answer`, role: 'assistant', content: `Readable synthetic answer ${id}.`, createdAt: now }],
  }
}
function event(value: unknown) {
  act(() => Socket.instances.at(-1)?.onmessage?.({ data: JSON.stringify(value) } as MessageEvent))
}
async function open(selected = sessions[0]) {
  window.history.replaceState({}, '', `/?computer=${selected.computerId}&session=${selected.id}`)
  render(<App />)
  await screen.findByRole('textbox', { name: 'Message', exact: true })
  await waitFor(() => expect(api.getSession).toHaveBeenCalled())
  await act(() => new Promise((resolve) => setTimeout(resolve, 25)))
}
beforeEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  Socket.instances = []
  vi.stubGlobal('WebSocket', Socket)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0))
  vi.stubGlobal('cancelAnimationFrame', (id: ReturnType<typeof setTimeout>) => clearTimeout(id))
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })),
  })
  Element.prototype.scrollIntoView = vi.fn()
  sessions = [makeSession('A'), makeSession('B'), makeSession('C')]
  localStorage.setItem('agentic-remote:knowledge-mode', '"hidden"')
  vi.mocked(api.listComputers).mockResolvedValue([{
    id: 'synthetic-computer', name: 'Synthetic computer', isLocal: true, online: true,
    providers: [
      { id: 'copilot', name: 'Copilot', available: true, terminalBacked: true },
      { id: 'claude', name: 'Claude Agent', available: true, terminalBacked: false },
    ],
  }])
  vi.mocked(api.listSessions).mockImplementation(async () => structuredClone(sessions))
  vi.mocked(api.listSessionListing).mockImplementation(async () => ({ sessions: structuredClone(sessions), answeredComputerIds: ['synthetic-computer'] }))
  vi.mocked(api.getSession).mockImplementation(async (_computerId, id) => structuredClone(sessions.find((entry) => entry.id === id)!))
  vi.mocked(api.activateSession).mockImplementation(async (_computerId, id) => structuredClone(sessions.find((entry) => entry.id === id)!))
  vi.mocked(api.listKnowledgeRoots).mockResolvedValue([])
  vi.mocked(api.listCommands).mockResolvedValue([])
  vi.mocked(api.listHistory).mockResolvedValue([])
  vi.mocked(api.getPushSettings).mockResolvedValue({ mutedSessions: [] })
  vi.mocked(api.listBackgroundTasks).mockResolvedValue({ tasks: [], runningCount: 0, supported: false })
  vi.mocked(api.getSessionKnowledgeRoot).mockImplementation(async (computerId, sessionId) => ({
    computerId, sessionId, rootId: null, revision: 0, available: false,
  }))
  vi.mocked(api.getProviderRuntimeOptions).mockResolvedValue({ models: [] })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('current-main audit reproductions (assert current behavior, not desired fixes)', () => {
  it.each(['copilot', 'claude'] as const)('#165: %s queue re-edit restores expanded text without presentation metadata', async (provider) => {
    sessions[0].provider = provider
    sessions[0].status = 'running'
    const text = Array.from({ length: 21 }, (_, index) => `Synthetic paste ${index}`).join('\n')
    vi.mocked(api.sendMessage).mockImplementation(async (_computerId, _id, input) => {
      sessions[0] = { ...sessions[0], queuedCount: 1, queuedPrompts: [{ id: 'synthetic-queued', content: input.content, createdAt: now }] }
      return structuredClone(sessions[0])
    })
    await open()
    const editor = screen.getByRole('textbox', { name: 'Message', exact: true })
    fireEvent.paste(editor, { clipboardData: { getData: () => text } })
    expect(editor).toHaveValue('[Paste #1 - 21 lines]')
    fireEvent.click(screen.getByRole('button', { name: 'Queue message', exact: true }))
    await waitFor(() => expect(api.sendMessage).toHaveBeenCalledWith(
      'synthetic-computer', 'A', { content: text, enqueue: true, acknowledgesFailure: undefined },
    ))
    await waitFor(() => expect(editor).toHaveValue(''))
    fireEvent.click(await screen.findByRole('button', { name: 'Edit queued prompt 1', exact: true }))
    expect(editor).toHaveValue(text)
    expect(JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')[key(sessions[0])].pastes).toEqual([])
  })

  it('#165: ambiguous legacy payload survives migration but normal accepted send drops its unresolved copy', async () => {
    const label = '[Paste #1 - 21 lines]'
    const display = `Literal ${label}\nActual ${label}`
    const payload = Array.from({ length: 21 }, (_, index) => `Synthetic legacy ${index}`).join('\n')
    localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify({ [key(sessions[0])]: display }))
    localStorage.setItem('agentic-remote:composer-pastes', JSON.stringify({
      [key(sessions[0])]: [{ id: 1, content: payload, lineCount: 21 }],
    }))
    vi.mocked(api.sendMessage).mockResolvedValue(sessions[0])
    await open()
    const stored = () => JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')[key(sessions[0])]
    expect(stored().unresolvedPastes).toHaveLength(1)
    expect(localStorage.getItem('agentic-remote:composer-pastes')).toContain('Synthetic legacy')
    fireEvent.click(screen.getByRole('button', { name: 'Send message', exact: true }))
    await waitFor(() => expect(api.sendMessage).toHaveBeenCalled())
    expect(vi.mocked(api.sendMessage).mock.calls[0][2].content).toBe(display)
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue(''))
    expect(stored()?.unresolvedPastes).toBeUndefined()
    expect(localStorage.getItem('agentic-remote:composer-pastes')).toBeNull()
  })

  it.each(['sdk', 'tmux'] as const)('#224: a followed %s answer still scrolls to a new activity; manual pause prevents it', async (executionMode) => {
    sessions[0].executionMode = executionMode
    sessions[0].status = 'running'
    await open()
    const scroll = vi.mocked(Element.prototype.scrollIntoView)
    scroll.mockClear()
    const activity = { id: 'synthetic-tool', role: 'activity', content: 'Bash · Synthetic tool', createdAt: now, activityStatus: 'running' }
    event({ type: 'session.upserted', session: { ...sessions[0], messages: [...sessions[0].messages, activity] } })
    await waitFor(() => expect(scroll).toHaveBeenCalledWith({ block: 'end' }))
    const timeline = document.querySelector('.timeline')!
    Object.defineProperties(timeline, {
      clientHeight: { configurable: true, value: 500 },
      scrollHeight: { configurable: true, value: 1000 },
      scrollTop: { configurable: true, value: 100, writable: true },
    })
    fireEvent.scroll(timeline)
    scroll.mockClear()
    event({ type: 'session.upserted', session: { ...sessions[0], messages: [...sessions[0].messages, activity, { ...activity, id: 'synthetic-tool-2' }] } })
    await act(() => new Promise((resolve) => setTimeout(resolve, 25)))
    expect(scroll).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Scroll to latest', exact: true })).toBeInTheDocument()
  })

  it('#239: clear appends replacement instead of retaining the middle custom position, while preserving the draft', async () => {
    const original = sessions[1]
    const replacement = { ...original, id: 'B-replacement', messages: [] }
    localStorage.setItem('agentic-remote:session-order', JSON.stringify({ 'synthetic-computer': sessions.map(key) }))
    vi.mocked(api.clearConversation).mockImplementation(async () => {
      sessions.splice(1, 1, replacement)
      return replacement
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await open(original)
    fireEvent.change(screen.getByRole('textbox', { name: 'Message', exact: true }), { target: { value: 'Synthetic draft retained' } })
    fireEvent.click(screen.getByRole('button', { name: 'Session actions', exact: true }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear conversation', exact: true }))
    await waitFor(() => expect(window.location.search).toContain('session=B-replacement'))
    expect(screen.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('Synthetic draft retained')
    await waitFor(() => expect(JSON.parse(localStorage.getItem('agentic-remote:session-order') || '{}')['synthetic-computer']).toEqual([
      'synthetic-computer:A', 'synthetic-computer:C', 'synthetic-computer:B-replacement',
    ]))
  })

  it('#239: an external localStorage order change does not update the mounted navigation', async () => {
    const original = sessions.map(key)
    localStorage.setItem('agentic-remote:session-order', JSON.stringify({ 'synthetic-computer': original }))
    await open()
    const titles = () => [...document.querySelectorAll('.session-item__open strong')].map((element) => element.textContent)
    expect(titles()).toEqual(['Synthetic A', 'Synthetic B', 'Synthetic C'])
    const next = JSON.stringify({ 'synthetic-computer': [...original].reverse() })
    localStorage.setItem('agentic-remote:session-order', next)
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'agentic-remote:session-order', newValue: next, storageArea: localStorage })))
    expect(titles()).toEqual(['Synthetic A', 'Synthetic B', 'Synthetic C'])
  })

  it('question listbox keyboard highlight has no programmatic active-option reference', async () => {
    const onChange = vi.fn()
    render(<UserInputFieldControl
      field={{
        name: 'synthetic-choice', title: 'Synthetic choice', type: 'string', required: true,
        options: [{ value: 'first', label: 'First option' }, { value: 'second', label: 'Second option' }],
      }}
      value="first"
      disabled={false}
      onChange={onChange}
    />)
    fireEvent.click(screen.getByRole('button', { name: 'Synthetic choice', exact: true }))
    const list = screen.getByRole('listbox')
    expect(document.activeElement).toBe(list)
    fireEvent.keyDown(list, { key: 'ArrowDown' })
    const second = screen.getByRole('option', { name: 'Second option', exact: true })
    expect(second).toHaveClass('user-input-card__select-option--highlighted')
    expect(document.activeElement).toBe(list)
    expect(list).not.toHaveAttribute('aria-activedescendant')
    expect(second).toHaveAttribute('aria-selected', 'false')
    fireEvent.keyDown(list, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('second')
  })

  it('generic preference failure is visible but has no alert or live-region semantics', async () => {
    await open()
    const original = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, name, value) {
      if (name === 'agentic-remote:session-sort') throw new Error('Synthetic storage refusal')
      original.call(this, name, value)
    })
    fireEvent.change(screen.getByRole('combobox', { name: 'Session order', exact: true }), { target: { value: 'name' } })
    await waitFor(() => expect(document.querySelector('.conversation > .error-banner'))
      .toHaveTextContent('Could not save the session order: Synthetic storage refusal'))
    const banner = document.querySelector('.conversation > .error-banner')
    expect(banner).not.toHaveAttribute('role')
    expect(banner).not.toHaveAttribute('aria-live')
  })

  it('100-message control and scroll-follow request counters', async () => {
    for (const session of sessions.slice(1)) session.messages = []
    sessions[0].status = 'running'
    sessions[0].messages = Array.from({ length: 100 }, (_, index) => ({
      id: `synthetic-control-${index}`, role: index % 2 ? 'assistant' : 'user',
      content: `Synthetic control message ${index}.`, createdAt: now,
    }))
    await open()
    const initialRows = document.querySelectorAll('.message-stack > .message').length
    const initialEarlierControls = document.querySelectorAll('.transcript-earlier').length
    expect(initialRows).toBe(100)
    expect(initialEarlierControls).toBe(0)
    const timeline = document.querySelector<HTMLElement>('.timeline')!
    Object.defineProperties(timeline, {
      clientHeight: { configurable: true, value: 500 },
      scrollHeight: { configurable: true, value: 1000 },
      scrollTop: { configurable: true, value: 500, writable: true },
    })
    const scroll = vi.mocked(Element.prototype.scrollIntoView)
    scroll.mockImplementation(() => {
      timeline.scrollTop = 500
      fireEvent.scroll(timeline)
    })
    const phaseCounts: Record<string, number> = {}
    let live = structuredClone(sessions[0])
    const settle = async () => {
      await act(() => new Promise((resolve) => setTimeout(resolve, 25)))
    }
    const addTool = async (id: string) => {
      live = {
        ...live,
        messages: [...live.messages, {
          id, role: 'activity', content: `Bash · ${id}`, createdAt: now,
          activityStatus: 'running', activityKind: 'tool',
        }],
      }
      event({ type: 'session.upserted', session: live })
      await settle()
    }
    scroll.mockClear()
    await addTool('synthetic-followed-tool')
    phaseCounts.followedToolInsertion = scroll.mock.calls.length
    expect(phaseCounts.followedToolInsertion).toBe(1)

    timeline.scrollTop = 100
    fireEvent.scroll(timeline)
    scroll.mockClear()
    await addTool('synthetic-paused-tool')
    phaseCounts.manuallyPausedToolInsertion = scroll.mock.calls.length
    expect(phaseCounts.manuallyPausedToolInsertion).toBe(0)
    expect(timeline.scrollTop).toBe(100)
    expect(screen.getByRole('button', { name: 'Scroll to latest', exact: true })).toBeInTheDocument()

    live = {
      ...live,
      pendingUserInput: {
        requestId: 'synthetic-counter-question', question: 'Synthetic required action?',
        choices: ['Continue'], allowFreeform: false,
      },
    }
    scroll.mockClear()
    event({ type: 'session.upserted', session: live })
    await settle()
    phaseCounts.requiredActionArrivalWhilePaused = scroll.mock.calls.length
    expect(phaseCounts.requiredActionArrivalWhilePaused).toBe(1)
    expect(timeline.scrollTop).toBe(500)
    expect(screen.getByRole('button', { name: 'Scroll to latest', exact: true })).toBeInTheDocument()

    scroll.mockClear()
    await addTool('synthetic-after-required-action')
    phaseCounts.toolAfterRequiredActionWithoutUserResume = scroll.mock.calls.length
    expect(phaseCounts.toolAfterRequiredActionWithoutUserResume).toBe(0)

    scroll.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Scroll to latest', exact: true }))
    await settle()
    phaseCounts.explicitLatestAction = scroll.mock.calls.length
    expect(phaseCounts.explicitLatestAction).toBe(1)
    expect(screen.queryByRole('button', { name: 'Scroll to latest', exact: true })).not.toBeInTheDocument()

    scroll.mockClear()
    await addTool('synthetic-after-explicit-resume')
    phaseCounts.toolAfterExplicitResume = scroll.mock.calls.length
    expect(phaseCounts.toolAfterExplicitResume).toBe(1)
    console.log('UI_REVIEW_SCROLL_COUNTERS', JSON.stringify({
      environment: 'JSDOM with simulated scroll metrics; no browser paint, pixel-anchor or latency measurement',
      sourceWindowLimit: 250, initialMessages: 100, initialRows, initialEarlierControls,
      finalMessages: live.messages.length, finalRows: document.querySelectorAll('.message-stack > .message').length,
      scrollIntoViewCallsByPhase: phaseCounts,
      existingControllerState: ['autoScrollRef', 'followingLatest', 'previousPendingActionRef', 'requiredActionScrollRef'],
      productionInstrumentationAdded: false,
    }))
  })

  it('bounded DOM and serialization evidence: 1000-message history and 20 other drafts', async () => {
    for (const session of sessions.slice(1)) session.messages = []
    sessions[0].messages = Array.from({ length: 1000 }, (_, index) => ({
      id: `synthetic-message-${index}`, role: index % 2 ? 'assistant' : 'user',
      content: `Synthetic history ${index}.`, createdAt: now,
    }))
    const drafts = Object.fromEntries(Array.from({ length: 20 }, (_, index) => [`synthetic-other:draft-${index}`, 'x'.repeat(2000)]))
    localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify(drafts))
    await open()
    expect(document.querySelectorAll('.message-stack > .message')).toHaveLength(250)
    fireEvent.click(screen.getByRole('button', { name: 'Show 750 earlier messages', exact: true }))
    expect(document.querySelectorAll('.message-stack > .message')).toHaveLength(1000)
    const calls: { key: string; characters: number }[] = []
    const original = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, name, value) {
      if (this === localStorage) calls.push({ key: name, characters: value.length })
      original.call(this, name, value)
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Message', exact: true }), { target: { value: 'a' } })
    expect(screen.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('a')
    console.log('UI_REVIEW_MEASUREMENT', JSON.stringify({
      environment: 'JSDOM; no paint or input-latency measurement',
      initialRows: 250, expandedRows: 1000, otherDraftCharacters: 40000,
      writesForOneCharacter: calls, totalWrittenCharacters: calls.reduce((sum, call) => sum + call.characters, 0),
    }))
    expect(calls.filter((call) => call.key.includes('composer-drafts')).reduce((sum, call) => sum + call.characters, 0)).toBeGreaterThan(80000)
  })
})
