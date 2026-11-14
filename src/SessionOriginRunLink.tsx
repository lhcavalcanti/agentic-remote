import { ExternalLink } from 'lucide-react'
import type { SessionProvenance } from '../shared/contracts'
import { readScheduleLink, type ScheduleLink } from './notifications/schedule-link'
import { usePreviewFeature } from './preview-features'

export function SessionOriginRunLink({ provenance, onOpenRun }: {
  provenance?: SessionProvenance
  onOpenRun?: (target: ScheduleLink) => void
}) {
  const enabled = usePreviewFeature('composerRefresh')
  const scheduler = usePreviewFeature('schedulerView')
  if (!enabled || !scheduler || provenance?.origin !== 'schedule' ||
      !provenance.scheduleId || !provenance.scheduleRunId) return null
  const params = new URLSearchParams(window.location.search)
  params.set('schedule', provenance.scheduleId)
  params.set('run', provenance.scheduleRunId)
  const href = `/?${params}`
  const target = readScheduleLink(href)
  if (!target) return null
  const description = `View run from schedule${provenance.scheduleName ? ` ${provenance.scheduleName}` : ''}`
  return (
    <a
      aria-haspopup="dialog"
      aria-label={description}
      className="session-origin-run-link"
      href={href}
      onClick={(event) => {
        if (!onOpenRun || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
        event.preventDefault()
        onOpenRun(target)
      }}
      title={description}
    ><ExternalLink aria-hidden="true" size={13} /></a>
  )
}
