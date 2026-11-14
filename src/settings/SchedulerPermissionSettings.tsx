import { usePreviewFeature } from '../preview-features'

export function SchedulerPermissionSettings({ allowed = false, onChange }: { allowed?: boolean; onChange?: (allowed: boolean) => void }) {
  const enabled = usePreviewFeature('schedulerView')
  if (!enabled) return null
  return (
    <section aria-label="Scheduler" className="app-settings-section">
      <h4>Scheduler</h4>
      <label>
        <input checked={allowed} disabled={!onChange} onChange={(event) => onChange?.(event.target.checked)} type="checkbox" />
        Allow Oracle to propose allow-all schedules
      </label>
      <p className="dialog-message">Off by default. Every proposal still needs your approval; worktrees do not grant permission.</p>
    </section>
  )
}
