// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ManagedSession,
  ManagedSessionMcpServersSnapshot,
  ManagedSessionSkillsSnapshot,
} from '../shared/contracts'
import { listSessionMcpServers, listSessionSkills } from './api'
import { SessionResources } from './SessionResources'

vi.mock('./api', () => ({
  listSessionSkills: vi.fn(),
  listSessionMcpServers: vi.fn(),
}))

const session: ManagedSession = {
  id: 'session', computerId: 'computer', computerName: 'Studio',
  provider: 'copilot', executionMode: 'sdk', cwd: '/home/demo/project',
  title: 'Resource fixture', status: 'idle', isOpen: true,
  updatedAt: '2026-09-05T00:00:00.000Z', messages: [],
}
const skills: ManagedSessionSkillsSnapshot = {
  sessionId: session.id, computerId: session.computerId, provider: 'copilot',
  capturedAt: session.updatedAt, scope: 'session',
  skills: [
    { name: 'code-review', description: 'Review the implementation', source: 'project', enabled: true, userInvocable: true, commandName: 'code-review' },
    { name: 'release-helper', description: 'Prepare a release', source: 'plugin', enabled: false, userInvocable: false, pluginName: 'release-kit' },
  ],
}
const mcp: ManagedSessionMcpServersSnapshot = {
  sessionId: session.id, computerId: session.computerId, provider: 'copilot',
  capturedAt: session.updatedAt, scope: 'session',
  servers: [
    { name: 'github', status: 'connected', source: 'user', toolCount: 5 },
    { name: 'work-items', status: 'needs-auth', source: 'project', transport: 'http' },
  ],
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(listSessionSkills).mockResolvedValue(skills)
  vi.mocked(listSessionMcpServers).mockResolvedValue(mcp)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('session resources', () => {
  it.each([
    ['skills', 0, '0 skills'],
    ['skills', 1, '1 skill'],
    ['skills', 2, '2 skills'],
    ['mcp', 0, '0 MCP servers'],
    ['mcp', 1, '1 MCP server'],
    ['mcp', 2, '2 MCP servers'],
  ] as const)('labels %s counts with %s resources', async (tab, count, expected) => {
    vi.mocked(listSessionSkills).mockResolvedValue({ ...skills, skills: skills.skills.slice(0, count) })
    vi.mocked(listSessionMcpServers).mockResolvedValue({ ...mcp, servers: mcp.servers.slice(0, count) })
    render(<SessionResources session={session} online supported initialTab={tab} />)
    expect(await screen.findByText(expected)).toBeInTheDocument()
  })

  it('loads only the selected resource tab and filters without another request', async () => {
    render(<SessionResources session={session} online supported initialTab="skills" />)
    await screen.findByRole('heading', { name: 'code-review' })
    expect(listSessionSkills).toHaveBeenCalledExactlyOnceWith('computer', 'session', 'copilot', expect.any(AbortSignal))
    expect(listSessionMcpServers).not.toHaveBeenCalled()
    expect(screen.getByText('Agent only')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Filter skills' }), { target: { value: 'release' } })
    expect(screen.queryByRole('heading', { name: 'code-review' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'release-helper' })).toBeInTheDocument()
    expect(screen.getByText('1 matching skill')).toBeInTheDocument()
    expect(listSessionSkills).toHaveBeenCalledOnce()
    expect(screen.getByText(/No prompt is sent/)).toBeInTheDocument()
  })

  it('supports keyboard tabs and reports actual MCP state', async () => {
    render(<SessionResources session={session} online supported initialTab="skills" />)
    await screen.findByRole('heading', { name: 'code-review' })
    const skillsTab = screen.getByRole('tab', { name: 'Skills' })
    skillsTab.focus()
    fireEvent.keyDown(skillsTab, { key: 'ArrowRight' })
    await screen.findByRole('heading', { name: 'github' })
    expect(screen.getByRole('tab', { name: 'MCP servers' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'MCP servers' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText('Needs sign-in')).toBeInTheDocument()
    expect(screen.getByText('5 tools')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Filter MCP servers' }), { target: { value: 'github' } })
    expect(screen.getByText('1 matching MCP server')).toBeInTheDocument()
    expect(listSessionMcpServers).toHaveBeenCalledExactlyOnceWith('computer', 'session', 'copilot', expect.any(AbortSignal))
  })

  it('labels configured defaults without inventing a live connection', async () => {
    vi.mocked(listSessionMcpServers).mockResolvedValue({
      ...mcp, scope: 'workspace',
      servers: [{ name: 'configured-server', source: 'project', enabled: true, status: 'unknown' }],
    })
    render(<SessionResources session={session} online supported initialTab="mcp" />)
    await screen.findByRole('heading', { name: 'configured-server' })
    expect(screen.getByText('Configured for this folder')).toBeInTheDocument()
    expect(screen.getByText('Enabled in configuration')).toBeInTheDocument()
    expect(screen.getByText('No live status')).toBeInTheDocument()
    expect(screen.queryByText('Connected')).not.toBeInTheDocument()
  })

  it('keeps last-known and unavailable reports distinct from a genuine empty list', async () => {
    vi.mocked(listSessionSkills).mockResolvedValue({
      ...skills, scope: 'last-known', provider: 'claude',
    })
    const view = render(<SessionResources session={{ ...session, provider: 'claude' }} online supported initialTab="skills" />)
    await screen.findByText('Last reported by this session')
    expect(screen.getByText(/does not start or resume a turn/)).toBeInTheDocument()
    view.unmount()

    vi.mocked(listSessionSkills).mockResolvedValue({
      ...skills, scope: 'unavailable', skills: [], message: 'This session has not reported its skills yet.',
    })
    render(<SessionResources session={session} online supported initialTab="skills" />)
    await screen.findByText('This session has not reported its skills yet.')
    expect(screen.queryByText('0 skills')).not.toBeInTheDocument()
    expect(screen.getByText('Not available')).toBeInTheDocument()
  })

  it('reports an empty authoritative snapshot without calling it unsupported', async () => {
    vi.mocked(listSessionSkills).mockResolvedValue({ ...skills, skills: [] })
    render(<SessionResources session={session} online supported initialTab="skills" />)
    await screen.findByText('0 skills')
    expect(screen.getByText(/has not reported any skills in this snapshot/)).toBeInTheDocument()
    expect(screen.queryByText('Not available')).not.toBeInTheDocument()
  })

  it('does not present a last-known connection as a current live connection', async () => {
    vi.mocked(listSessionMcpServers).mockResolvedValue({ ...mcp, scope: 'last-known' })
    render(<SessionResources session={session} online supported initialTab="mcp" />)
    await screen.findByText('Last status: Connected')
    expect(screen.queryByText('Connected', { exact: true })).not.toBeInTheDocument()
    expect(screen.getByText('Last reported by this session')).toBeInTheDocument()
  })

  it('shows a fetch failure and retries without losing the filter', async () => {
    vi.mocked(listSessionSkills).mockRejectedValueOnce(new Error('Runtime temporarily unavailable'))
    render(<SessionResources session={session} online supported initialTab="skills" initialFilter="code" />)
    await screen.findByRole('alert')
    expect(screen.getByRole('alert')).toHaveTextContent('Runtime temporarily unavailable')
    fireEvent.click(screen.getByRole('button', { name: 'Refresh skills' }))
    await screen.findByRole('heading', { name: 'code-review' })
    expect(screen.getByRole('searchbox', { name: 'Filter skills' })).toHaveValue('code')
    expect(listSessionSkills).toHaveBeenCalledTimes(2)
  })

  it('does not request resources from an offline or older computer', async () => {
    const view = render(<SessionResources session={session} online={false} supported initialTab="skills" />)
    expect(screen.getByText(/Studio is offline/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refresh skills' })).toBeDisabled()
    expect(listSessionSkills).not.toHaveBeenCalled()
    view.rerender(<SessionResources session={session} online supported={false} initialTab="skills" />)
    expect(screen.getByText(/does not advertise resource inspection/)).toBeInTheDocument()
    expect(listSessionSkills).not.toHaveBeenCalled()
  })

  it('aborts and ignores a late reply after switching computers with the same session ID', async () => {
    let resolveOld: (value: ManagedSessionSkillsSnapshot) => void = () => {}
    vi.mocked(listSessionSkills).mockImplementationOnce(() =>
      new Promise((resolve) => { resolveOld = resolve }),
    )
    const view = render(<SessionResources session={session} online supported initialTab="skills" />)
    await waitFor(() => expect(listSessionSkills).toHaveBeenCalledOnce())
    const oldSignal = vi.mocked(listSessionSkills).mock.calls[0][3]
    const other = { ...session, computerId: 'other', computerName: 'Other' }
    vi.mocked(listSessionSkills).mockResolvedValue({
      ...skills, computerId: 'other', skills: [{ name: 'other-skill' }],
    })
    view.rerender(<SessionResources session={other} online supported initialTab="skills" />)
    await screen.findByRole('heading', { name: 'other-skill' })
    expect(oldSignal?.aborted).toBe(true)
    await act(async () => resolveOld(skills))
    expect(screen.queryByRole('heading', { name: 'code-review' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'other-skill' })).toBeInTheDocument()
  })

  it('does not reuse a stale connected state after reconnecting', async () => {
    const view = render(<SessionResources session={session} online supported initialTab="mcp" />)
    await screen.findByText('Connected')
    view.rerender(<SessionResources session={session} online={false} supported initialTab="mcp" />)
    expect(screen.queryByText('Connected')).not.toBeInTheDocument()
    let resolve: (value: ManagedSessionMcpServersSnapshot) => void = () => {}
    vi.mocked(listSessionMcpServers).mockImplementationOnce(() =>
      new Promise((accept) => { resolve = accept }),
    )
    view.rerender(<SessionResources session={session} online supported initialTab="mcp" />)
    expect(screen.queryByText('Connected')).not.toBeInTheDocument()
    await act(async () => resolve({ ...mcp, servers: [{ name: 'github', status: 'failed' }] }))
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it.each(['executionMode', 'suspended'] as const)('abandons old metadata after %s changes', async (change) => {
    let resolveOld!: (value: ManagedSessionSkillsSnapshot) => void
    vi.mocked(listSessionSkills).mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve }))
    const view = render(<SessionResources session={session} online supported initialTab="skills" />)
    const signal = vi.mocked(listSessionSkills).mock.calls[0][3]
    const changed: ManagedSession = {
      ...session, ...(change === 'executionMode' ? { executionMode: 'tmux' } : { suspended: true }),
    }
    vi.mocked(listSessionSkills).mockResolvedValueOnce({
      ...skills, scope: 'workspace', skills: [{ name: 'configured-new-owner' }],
    })
    view.rerender(<SessionResources session={changed} online supported initialTab="skills" />)
    await screen.findByRole('heading', { name: 'configured-new-owner' })
    expect(signal?.aborted).toBe(true)
    await act(async () => resolveOld(skills))
    expect(screen.queryByRole('heading', { name: 'code-review' })).not.toBeInTheDocument()
  })

  it('aborts a hung browser request and offers a working refresh', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    vi.mocked(listSessionSkills).mockImplementationOnce((_computer, _session, _provider, signal) =>
      new Promise((_resolve, reject) => {
        signal!.addEventListener('abort', () => reject(signal!.reason), { once: true })
      }),
    )
    render(<SessionResources session={session} online supported initialTab="skills" />)
    await act(async () => { await vi.advanceTimersByTimeAsync(15_001) })
    expect(screen.getByRole('alert')).toHaveTextContent('timed out')
    expect(screen.getByRole('button', { name: 'Refresh skills' })).toBeEnabled()
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Refresh skills' })))
    expect(screen.getByRole('heading', { name: 'code-review' })).toBeInTheDocument()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('renders metadata as text and never renders extra configuration fields', async () => {
    const description = '<img src="https://example.invalid/leak" onerror="alert(1)">'
    vi.mocked(listSessionSkills).mockResolvedValue({
      ...skills, skills: [{ name: 'plain-text', description }],
    })
    const view = render(<SessionResources session={session} online supported initialTab="skills" />)
    await screen.findByText(description)
    expect(view.container.querySelector('img')).toBeNull()
    const secretful = {
      ...mcp, host: { fullConfig: { token: 'HIDDEN-CONFIG-TOKEN' } },
      servers: [{ name: 'github', status: 'failed' as const, error: 'HIDDEN-ERROR-TOKEN', config: { headers: { token: 'HIDDEN-HEADER-TOKEN' } } }],
    }
    vi.mocked(listSessionMcpServers).mockResolvedValue(secretful)
    fireEvent.click(screen.getByRole('tab', { name: 'MCP servers' }))
    await screen.findByRole('heading', { name: 'github' })
    expect(view.container.textContent).not.toContain('HIDDEN-')
  })
})
