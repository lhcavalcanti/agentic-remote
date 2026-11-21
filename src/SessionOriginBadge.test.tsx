// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultHubFeatureFlags, effectivePreviewFeatures } from '../shared/feature-flags'
import type { SessionProvenance } from '../shared/contracts'
import { OracleIcon } from './oracle-icon'
import { PreviewFeaturesContext } from './preview-features'
import { readScheduleLink } from './notifications/schedule-link'
import { SessionOriginBadge } from './SessionOriginBadge'
import { SessionOriginRunLink } from './SessionOriginRunLink'

afterEach(() => { cleanup(); vi.clearAllMocks() })
function preview(children: ReactNode, schedulerView = false, scheduler = false) {
  const hubFlags = { ...defaultHubFeatureFlags, scheduler }
  const preferences = { schedulerView }
  return <PreviewFeaturesContext.Provider value={{
    hubFlags, preferences, effective: effectivePreviewFeatures(preferences, hubFlags), set: vi.fn(),
  }}>{children}</PreviewFeaturesContext.Provider>
}

describe('session origin badges', () => {
  it.each([
    ['user', 'Started by you'], ['manager', 'Started by Oracle'],
    ['discovered', 'Found on this computer'], ['schedule', 'Started by schedule Morning review'],
  ] as const)('renders %s with an accessible description distinct from model family', (origin, description) => {
    render(<SessionOriginBadge provenance={{ origin, scheduleName: 'Morning review' }} />)
    expect(screen.getByRole('img', { name: description })).toHaveAttribute('title', description)
    expect(screen.getByRole('img').querySelector('[data-model-family]')).toBeNull()
  })
  it("marks a session Oracle started with Oracle's own icon", () => {
    const { container: mark } = render(<OracleIcon aria-hidden="true" />)
    render(<SessionOriginBadge provenance={{ origin: 'manager' }} />)
    expect(screen.getByRole('img', { name: 'Started by Oracle' }).querySelector('svg')?.getAttribute('class'))
      .toBe(mark.querySelector('svg')?.getAttribute('class'))
  })
  it('removes the previous origin badge for unknown provenance', () => {
    const result = render(<SessionOriginBadge provenance={{ origin: 'user' }} />)
    expect(screen.getByRole('img', { name: 'Started by you' })).toBeVisible()
    result.rerender(<SessionOriginBadge provenance={undefined} />)
    expect(result.container).toBeEmptyDOMElement()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByText('Oracle')).not.toBeInTheDocument()
  })
})

describe('schedule run provenance links', () => {
  const provenance: SessionProvenance = { origin: 'schedule', scheduleName: 'Morning review', scheduleId: 'morning', scheduleRunId: 'run' }
  it.each([[false, true], [true, false]])(
    'does not expose run access unless the scheduler preview and hub are enabled (%s, %s)',
    (schedulerView, hub) => {
      render(preview(<SessionOriginRunLink provenance={provenance} />, schedulerView, hub))
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    },
  )
  it('opens the existing scheduler using the recorded identities and a bookmarkable URL', () => {
    const onOpenRun = vi.fn()
    render(preview(<SessionOriginRunLink provenance={provenance} onOpenRun={onOpenRun} />, true, true))
    const link = screen.getByRole('link', { name: 'View run from schedule Morning review' })
    expect(readScheduleLink(link.getAttribute('href')!)).toEqual({ scheduleId: 'morning', runId: 'run' })
    fireEvent.click(link)
    expect(onOpenRun).toHaveBeenCalledExactlyOnceWith({ scheduleId: 'morning', runId: 'run' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('does not invent a run destination when only a schedule or run identity is known', () => {
    const result = render(preview(<SessionOriginRunLink provenance={{ ...provenance, scheduleId: undefined }} />, true, true))
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    result.rerender(preview(<SessionOriginRunLink provenance={{ ...provenance, scheduleRunId: undefined }} />, true, true))
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
