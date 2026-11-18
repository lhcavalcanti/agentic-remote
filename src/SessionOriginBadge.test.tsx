// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultHubFeatureFlags, effectivePreviewFeatures } from '../shared/feature-flags'
import type { BackgroundTask, BackgroundTaskSnapshot, SessionProvenance } from '../shared/contracts'
import { PreviewFeaturesContext } from './preview-features'
import { readScheduleLink } from './notifications/schedule-link'
import { SessionOriginBadge } from './SessionOriginBadge'
import { SessionOriginRunLink } from './SessionOriginRunLink'
import { SubagentCount } from './SubagentCount'

afterEach(() => { cleanup(); vi.clearAllMocks() })
function preview(children: ReactNode, composerRefresh = true, schedulerView = false, scheduler = false) {
  const hubFlags = { ...defaultHubFeatureFlags, scheduler }
  const preferences = { composerRefresh, schedulerView }
  return <PreviewFeaturesContext.Provider value={{
    hubFlags, preferences, effective: effectivePreviewFeatures(preferences, hubFlags), set: vi.fn(),
  }}>{children}</PreviewFeaturesContext.Provider>
}

describe('session origin badges', () => {
  it.each([
    ['user', 'Started by you'], ['manager', 'Started by Oracle'],
    ['discovered', 'Found on this computer'], ['schedule', 'Started by schedule Morning review'],
  ] as const)('renders %s with an accessible description distinct from model family', (origin, description) => {
    render(preview(<SessionOriginBadge provenance={{ origin, scheduleName: 'Morning review' }} />))
    expect(screen.getByRole('img', { name: description })).toHaveAttribute('title', description)
    expect(screen.getByRole('img').querySelector('[data-model-family]')).toBeNull()
  })
  it('preserves the original Oracle badge only when the preview is off', () => {
    const result = render(preview(<SessionOriginBadge provenance={{ origin: 'schedule' }} legacyManaged />, false))
    expect(screen.getByText('Oracle').outerHTML).toBe('<em class="provider-badge manager-badge" title="Started by Oracle">Oracle</em>')
    result.rerender(preview(<SessionOriginBadge legacyManaged />))
    expect(screen.queryByText('Oracle')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
  it('removes the previous origin badge for unknown provenance without guessing from legacy ownership', () => {
    const result = render(preview(<SessionOriginBadge provenance={{ origin: 'user' }} legacyManaged />))
    expect(screen.getByRole('img', { name: 'Started by you' })).toBeVisible()
    result.rerender(preview(<SessionOriginBadge provenance={undefined} legacyManaged />))
    expect(result.container).toBeEmptyDOMElement()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByText('Oracle')).not.toBeInTheDocument()
  })
})

describe('schedule run provenance links', () => {
  const provenance: SessionProvenance = { origin: 'schedule', scheduleName: 'Morning review', scheduleId: 'morning', scheduleRunId: 'run' }
  it.each([[false, true, true], [true, false, true], [true, true, false]])(
    'does not expose run access unless both previews and the hub are enabled (%s, %s, %s)',
    (composer, schedulerView, hub) => {
      render(preview(<SessionOriginRunLink provenance={provenance} />, composer, schedulerView, hub))
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    },
  )
  it('opens the existing scheduler using the recorded identities and a bookmarkable URL', () => {
    const onOpenRun = vi.fn()
    render(preview(<SessionOriginRunLink provenance={provenance} onOpenRun={onOpenRun} />, true, true, true))
    const link = screen.getByRole('link', { name: 'View run from schedule Morning review' })
    expect(readScheduleLink(link.getAttribute('href')!)).toEqual({ scheduleId: 'morning', runId: 'run' })
    fireEvent.click(link)
    expect(onOpenRun).toHaveBeenCalledExactlyOnceWith({ scheduleId: 'morning', runId: 'run' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('does not invent a run destination when only a schedule or run identity is known', () => {
    const result = render(preview(<SessionOriginRunLink provenance={{ ...provenance, scheduleId: undefined }} />, true, true, true))
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    result.rerender(preview(<SessionOriginRunLink provenance={{ ...provenance, scheduleRunId: undefined }} />, true, true, true))
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('runtime-reported subagent count', () => {
  const task = (id: string, type: 'agent' | 'shell', status: BackgroundTask['status'], executionMode: 'sync' | 'background'): BackgroundTask => ({
    id, type, status, executionMode, description: id, startedAt: '2026-11-14T20:00:00Z', canCancel: false,
  })
  const snapshot: BackgroundTaskSnapshot = {
    supported: true, runningCount: 42, tasks: [
      task('sync', 'agent', 'running', 'sync'), task('background', 'agent', 'running', 'background'),
      task('shell', 'shell', 'running', 'background'), task('queued', 'agent', 'queued', 'background'),
      task('done', 'agent', 'completed', 'sync'),
    ],
  }
  it('counts reported running agents, including sync agents, rather than total background work', () => {
    const onOpen = vi.fn()
    render(preview(<SubagentCount snapshot={snapshot} onOpen={onOpen} />))
    fireEvent.click(screen.getByRole('button', { name: '2 subagents running' }))
    expect(onOpen).toHaveBeenCalledOnce()
  })
  it.each([
    { enabled: false, value: snapshot },
    { enabled: true, value: undefined },
    { enabled: true, value: { ...snapshot, supported: false } },
    { enabled: true, value: { ...snapshot, tasks: [] } },
  ])('does not invent a count when hidden, unsupported, or unreported', ({ enabled, value }) => {
    render(preview(<SubagentCount snapshot={value} onOpen={vi.fn()} />, enabled))
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
