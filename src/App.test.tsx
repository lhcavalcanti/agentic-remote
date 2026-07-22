// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail } from '../shared/contracts'
import App from './App'
import { getSession, listSessions } from './api'

vi.mock('./api', () => ({
  listSessions: vi.fn(),
  getSession: vi.fn(),
  createSession: vi.fn(),
  sendMessage: vi.fn(),
  cancelSession: vi.fn(),
  replyPermission: vi.fn(),
}))

class MockWebSocket {
  onmessage: ((event: MessageEvent) => void) | null = null
  onclose: (() => void) | null = null

  close() {}
}

Object.defineProperty(globalThis, 'WebSocket', {
  configurable: true,
  value: MockWebSocket,
})

const session: SessionDetail = {
  id: 'session-1',
  cwd: '/home/lcavalcanti/src/project',
  title: 'Project chat',
  updatedAt: '2026-07-22T00:00:00.000Z',
  status: 'idle',
  messages: [
    {
      id: 'message-1',
      role: 'user',
      content: 'Hello agent',
      createdAt: '2026-07-22T00:00:00.000Z',
    },
    {
      id: 'message-2',
      role: 'assistant',
      content: '**Ready.**',
      createdAt: '2026-07-22T00:00:01.000Z',
    },
  ],
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)
    Element.prototype.scrollTo = vi.fn()
  })

  it('renders a readable session and markdown response', async () => {
    render(<App />)

    expect((await screen.findAllByText('Project chat')).length).toBeGreaterThan(0)
    expect(screen.getByText('Hello agent')).toBeInTheDocument()
    expect(screen.getByText('Ready.').tagName).toBe('STRONG')
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
  })

  it('opens the folder-first new session dialog', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])

    expect(
      screen.getByRole('heading', { name: 'Choose a folder' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Absolute folder path')).toHaveValue('')
  })
})
