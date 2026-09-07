import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { LoaderCircle, RefreshCw, Search } from 'lucide-react'
import type {
  ManagedSession,
  ManagedSessionMcpServersSnapshot,
  ManagedSessionSkillsSnapshot,
  SessionMcpServerSummary,
  SessionResourceSource,
  SessionSkillSummary,
} from '../shared/contracts'
import { listSessionMcpServers, listSessionSkills } from './api'
import { providerName, shortPath } from './session-presentation'
import { sessionResourceOwner, type SessionResourceTab } from './session-resource-commands'

type Catalog =
  | { kind: 'skills'; snapshot: ManagedSessionSkillsSnapshot }
  | { kind: 'mcp'; snapshot: ManagedSessionMcpServersSnapshot }

type CatalogResult = { catalog: Catalog } | { error: string }

const sourceLabels: Record<SessionResourceSource, string> = {
  project: 'Project',
  inherited: 'Parent folder',
  user: 'User',
  plugin: 'Plugin',
  builtin: 'Built-in',
  custom: 'Custom',
  unknown: 'Source not reported',
}

const statusLabels: Record<SessionMcpServerSummary['status'], string> = {
  connected: 'Connected',
  failed: 'Failed',
  'needs-auth': 'Needs sign-in',
  pending: 'Connecting',
  disabled: 'Disabled',
  stopped: 'Stopped',
  not_configured: 'Not configured',
  unknown: 'No live status',
}

function SkillRow({ skill }: { skill: SessionSkillSummary }) {
  return (
    <li className="session-resource">
      <div className="session-resource__heading">
        <h3>{skill.name}</h3>
        {skill.enabled !== undefined ? (
          <span className={`session-resource__status ${skill.enabled ? '' : 'session-resource__status--muted'}`}>
            {skill.enabled ? 'Enabled' : 'Disabled'}
          </span>
        ) : null}
      </div>
      {skill.description ? <p className="session-resource__description">{skill.description}</p> : null}
      <div className="session-resource__metadata">
        {skill.source ? <span>{sourceLabels[skill.source]}</span> : null}
        {skill.pluginName ? <span>Plugin: {skill.pluginName}</span> : null}
        {skill.userInvocable === true ? (
          <code>/{skill.commandName || skill.name}{skill.argumentHint ? ` ${skill.argumentHint}` : ''}</code>
        ) : skill.userInvocable === false ? <span>Agent only</span> : null}
      </div>
    </li>
  )
}

function McpRow({ server, configured, lastKnown }: {
  server: SessionMcpServerSummary
  configured: boolean
  lastKnown: boolean
}) {
  return (
    <li className="session-resource">
      <div className="session-resource__heading">
        <h3>{server.name}</h3>
        <span className={`session-resource__status session-resource__status--${lastKnown ? 'muted' : server.status}`}>
          {lastKnown ? 'Last status: ' : ''}{statusLabels[server.status]}
        </span>
      </div>
      <div className="session-resource__metadata">
        {server.source ? <span>{sourceLabels[server.source]}</span> : null}
        {configured && server.enabled !== undefined ? (
          <span>{server.enabled ? 'Enabled' : 'Disabled'} in configuration</span>
        ) : null}
        {server.pluginName ? <span>Plugin: {server.pluginName}</span> : null}
        {server.transport ? <span>{server.transport === 'memory' ? 'In-process' : server.transport.toUpperCase()}</span> : null}
        {server.toolCount !== undefined ? <span>{server.toolCount} {server.toolCount === 1 ? 'tool' : 'tools'}</span> : null}
      </div>
      {server.status === 'failed' || server.status === 'needs-auth' ? (
        <p className="session-resource__description">
          Check the provider CLI on this computer for {server.status === 'failed' ? 'connection details' : 'sign-in'}.
        </p>
      ) : null}
    </li>
  )
}

function ResourceCatalog({
  session,
  tab,
  online,
  supported,
  filter,
  onFilter,
  onRefresh,
}: {
  session: ManagedSession
  tab: SessionResourceTab
  online: boolean
  supported: boolean
  filter: string
  onFilter: (value: string) => void
  onRefresh: () => void
}) {
  const [result, setResult] = useState<CatalogResult>()
  const searchId = useId()
  const { computerId, id: sessionId, provider = 'copilot', cwd } = session
  const label = tab === 'skills' ? 'skills' : 'MCP servers'
  const loading = online && supported && result === undefined

  useEffect(() => {
    if (!online || !supported) return
    let current = true
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      controller.abort(new DOMException('Resource request timed out. Try refreshing.', 'TimeoutError'))
    }, 15_000)
    const load = async (): Promise<Catalog> => tab === 'skills'
      ? { kind: 'skills', snapshot: await listSessionSkills(computerId, sessionId, provider, controller.signal) }
      : { kind: 'mcp', snapshot: await listSessionMcpServers(computerId, sessionId, provider, controller.signal) }
    void load().then(
      (catalog) => {
        if (current) setResult({ catalog })
      },
      (error: unknown) => {
        if (current) {
          setResult({ error: error instanceof Error ? error.message : String(error) })
        }
      },
    ).finally(() => window.clearTimeout(timeout))
    return () => {
      current = false
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [computerId, sessionId, provider, cwd, tab, online, supported])

  const catalog = result && 'catalog' in result ? result.catalog : undefined
  const snapshot = catalog?.snapshot
  const query = filter.trim().toLocaleLowerCase()
  const matches = (values: (string | undefined)[]) =>
    !query || values.some((value) => value?.toLocaleLowerCase().includes(query))
  const skills = catalog?.kind === 'skills'
    ? catalog.snapshot.skills.filter((skill) => matches([
        skill.name, skill.description, skill.commandName, skill.pluginName,
      ]))
    : []
  const servers = catalog?.kind === 'mcp'
    ? catalog.snapshot.servers.filter((server) => matches([
        server.name, server.pluginName, statusLabels[server.status],
      ]))
    : []
  const visibleCount = tab === 'skills' ? skills.length : servers.length
  const countLabel = visibleCount === 1 ? (tab === 'skills' ? 'skill' : 'MCP server') : label
  const scopeLabel = snapshot?.scope === 'session' ? 'Reported by this session'
    : snapshot?.scope === 'workspace' ? 'Configured for this folder'
      : snapshot?.scope === 'last-known' ? 'Last reported by this session'
        : 'Not available'
  const scopeMessage = snapshot?.message ||
    (snapshot?.scope === 'workspace'
      ? 'Configured defaults, not live terminal state. Session overrides and connection status may differ.'
      : snapshot?.scope === 'last-known'
        ? 'This is the last reported snapshot. Viewing it does not start or resume a turn.'
        : undefined)

  return (
    <div className="session-resources__catalog">
      <div className="session-resources__toolbar">
        <label className="session-resources__search" htmlFor={searchId}>
          <Search aria-hidden="true" size={16} />
          <input
            aria-label={`Filter ${label}`}
            autoComplete="off"
            id={searchId}
            onChange={(event) => onFilter(event.target.value)}
            placeholder={`Filter ${label}`}
            type="search"
            value={filter}
          />
        </label>
        <button
          aria-label={`Refresh ${label}`}
          className="session-resources__refresh"
          disabled={!online || !supported || loading}
          onClick={onRefresh}
          type="button"
        >
          <RefreshCw aria-hidden="true" size={16} />
          <span>Refresh</span>
        </button>
      </div>
      <div aria-busy={loading} className="session-resources__body">
        {!online ? (
          <p className="session-resources__empty" role="status">
            {session.computerName} is offline. Reconnect it to inspect this session.
          </p>
        ) : !supported ? (
          <p className="session-resources__empty" role="status">
            This runtime does not advertise resource inspection. Update Agentic Remote on {session.computerName} or use the provider CLI.
          </p>
        ) : loading ? (
          <div className="session-resources__empty" role="status">
            <LoaderCircle aria-hidden="true" className="activity-message__spinner" size={20} />
            <span>Loading {label}...</span>
          </div>
        ) : result && 'error' in result ? (
          <p className="session-resources__error" role="alert">
            Could not load {label}. {result.error}
          </p>
        ) : snapshot ? (
          <>
            {snapshot.scope !== 'unavailable' && scopeMessage ? (
              <details className="session-resources__scope-details">
                <summary>
                  <strong>{scopeLabel}</strong>
                  <time dateTime={snapshot.capturedAt}>{new Date(snapshot.capturedAt).toLocaleString()}</time>
                </summary>
                <p>{scopeMessage}</p>
              </details>
            ) : (
              <div className="session-resources__scope" role={snapshot.scope === 'unavailable' ? 'status' : undefined}>
                <strong>{scopeLabel}</strong>
                {snapshot.scope !== 'unavailable' ? (
                  <time dateTime={snapshot.capturedAt}>{new Date(snapshot.capturedAt).toLocaleString()}</time>
                ) : null}
                {scopeMessage ? <p>{scopeMessage}</p> : null}
              </div>
            )}
            {snapshot.scope === 'unavailable' ? null : (
              <>
                <p className="session-resources__count" role="status">
                  {visibleCount} {query ? 'matching ' : ''}{countLabel}
                  {snapshot.truncated
                    ? ` shown${snapshot.totalCount !== undefined ? ` of ${snapshot.totalCount}` : ''}`
                    : ''}
                </p>
                {visibleCount === 0 ? (
                  <p className="session-resources__empty">
                    {query ? `No ${label} match this filter.`
                      : snapshot.scope === 'workspace' ? `No ${label} were discovered for this folder.`
                        : `The provider has not reported any ${label} in this snapshot.`}
                  </p>
                ) : (
                  <ul aria-label={tab === 'skills' ? 'Available skills' : 'MCP servers'} className="session-resources__list">
                    {catalog?.kind === 'skills'
                      ? skills.map((skill, index) => <SkillRow key={`${skill.name}:${index}`} skill={skill} />)
                      : servers.map((server, index) => (
                          <McpRow
                            configured={snapshot.scope === 'workspace'}
                            key={`${server.name}:${index}`}
                            lastKnown={snapshot.scope === 'last-known'}
                            server={server}
                          />
                        ))}
                  </ul>
                )}
              </>
            )}
          </>
        ) : null}
      </div>
      <p className="session-resources__readonly">Read-only. No prompt is sent and no configuration is changed.</p>
    </div>
  )
}

export function SessionResources({
  session,
  online,
  supported,
  initialTab,
  initialFilter = '',
}: {
  session: ManagedSession
  online: boolean
  supported: boolean
  initialTab: SessionResourceTab
  initialFilter?: string
}) {
  const [tab, setTab] = useState(initialTab)
  const [filters, setFilters] = useState({ skills: initialTab === 'skills' ? initialFilter : '', mcp: initialTab === 'mcp' ? initialFilter : '' })
  const [refresh, setRefresh] = useState(0)
  const id = useId()
  const tabs = useRef<Record<SessionResourceTab, HTMLButtonElement | null>>({ skills: null, mcp: null })
  function tabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    event.stopPropagation()
    const next = event.key === 'Home' ? 'skills'
      : event.key === 'End' ? 'mcp'
        : tab === 'skills' ? 'mcp' : 'skills'
    setTab(next)
    tabs.current[next]?.focus()
  }
  const requestKey = JSON.stringify([
    sessionResourceOwner(session), tab, online, supported, refresh,
  ])
  return (
    <div className="session-resources">
      <p className="session-resources__context">
        {providerName(session.provider)} on <strong>{session.computerName}</strong>
        <span title={session.cwd}>{shortPath(session.cwd)}</span>
      </p>
      <div aria-label="Session resource type" className="session-resources__tabs" role="tablist">
        {(['skills', 'mcp'] as const).map((kind) => (
          <button
            aria-controls={`${id}-panel`}
            aria-selected={tab === kind}
            id={`${id}-${kind}`}
            key={kind}
            onClick={() => setTab(kind)}
            onKeyDown={tabKeyDown}
            ref={(element) => { tabs.current[kind] = element }}
            role="tab"
            tabIndex={tab === kind ? 0 : -1}
            type="button"
          >
            {kind === 'skills' ? 'Skills' : 'MCP servers'}
          </button>
        ))}
      </div>
      <div aria-labelledby={`${id}-${tab}`} className="session-resources__panel" id={`${id}-panel`} role="tabpanel">
        <ResourceCatalog
          filter={filters[tab]}
          key={requestKey}
          onFilter={(value) => setFilters((current) => ({ ...current, [tab]: value }))}
          onRefresh={() => setRefresh((current) => current + 1)}
          online={online}
          session={session}
          supported={supported}
          tab={tab}
        />
      </div>
    </div>
  )
}
