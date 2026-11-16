import { useEffect, useMemo, useState } from 'react'
import type { ComputerSummary, RuntimeModelOption } from '../../shared/contracts'
import { nextOccurrences, validateRecurrence } from '../../shared/schedule-recurrence'
import { DEFAULT_SCHEDULE_TIMEZONE, scheduleCreateSchema, type Schedule, type ScheduleRecurrence, type ScheduleTarget } from '../../shared/schedules'
import { getProviderRuntimeOptions } from '../api'
import { contextSizeLabel } from '../session-setup/runtime-presentation'
import { editableSchedule, scheduleError, scheduleTime } from './format'
import { FolderPicker } from './FolderPicker'

export type ScheduleDefinition = ReturnType<typeof editableSchedule>

export function newSchedule(computerId: string): ScheduleDefinition {
  return {
    name: '', prompt: '', timezone: DEFAULT_SCHEDULE_TIMEZONE, recurrence: { type: 'daily', time: '09:00' },
    target: { computerId, folder: '', provider: 'copilot', mode: 'autopilot', permissionPolicy: 'ask', folderTrust: 'ask' },
    workspace: 'checkout', catchUp: 'skip', overlap: 'skip', maxRuntimeMin: 60, notify: 'attention', enabled: true,
  }
}

function recurrencePreset(type: ScheduleRecurrence['type']): ScheduleRecurrence {
  switch (type) {
    case 'once': return { type, at: new Date(Date.now() + 3_600_000).toISOString() }
    case 'hourly': return { type, everyHours: 1, windowStart: '09:00', windowEnd: '18:00' }
    case 'daily': case 'weekdays': return { type, time: '09:00' }
    case 'weekly': return { type, time: '09:00', days: [1] }
    case 'cron': return { type, expression: '0 9 * * 1-5' }
  }
}

export function ScheduleForm({ initial, computers, editing, pending, saveError, onSave, onCancel }: {
  initial?: ScheduleDefinition
  computers: ComputerSummary[]
  editing?: Schedule
  pending: boolean
  saveError?: string
  onSave(definition: ScheduleDefinition): Promise<void>
  onCancel(): void
}) {
  const [draft, setDraft] = useState(() => initial ?? newSchedule(computers.find((computer) => computer.isLocal)?.id ?? computers[0]?.id ?? ''))
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string>()
  const [runtimeCatalog, setRuntimeCatalog] = useState<{
    computerId: string; provider: ScheduleTarget['provider']; models?: RuntimeModelOption[]; error?: string
  }>()
  const [step, setStep] = useState<'Details' | 'Target' | 'Policies'>('Details')
  const [clock] = useState(() => new Date())
  const { recurrence, target } = draft
  const targetPaired = computers.some((computer) => computer.id === target.computerId)
  const catalog = runtimeCatalog?.computerId === target.computerId && runtimeCatalog.provider === target.provider ? runtimeCatalog : undefined
  const models = catalog?.models ?? []
  const modelsLoaded = catalog?.models !== undefined
  const modelsError = catalog?.error
  useEffect(() => {
    let active = true
    const scope = { computerId: target.computerId, provider: target.provider }
    setRuntimeCatalog(scope)
    if (!targetPaired) return
    void getProviderRuntimeOptions(target.computerId, target.provider).then((options) => {
      if (active) setRuntimeCatalog({ ...scope, models: options.models })
    }).catch((caught) => { if (active) setRuntimeCatalog({ ...scope, error: scheduleError(caught) }) })
    return () => { active = false }
  }, [target.computerId, target.provider, targetPaired])
  const preview = useMemo(() => {
    try { return { dates: nextOccurrences(recurrence, draft.timezone, clock, 5), error: undefined } }
    catch (caught) { return { dates: [], error: caught instanceof Error ? caught.message : 'Invalid recurrence' } }
  }, [recurrence, draft.timezone, clock])
  const update = <K extends keyof ScheduleDefinition>(key: K, value: ScheduleDefinition[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const updateTarget = <K extends keyof ScheduleTarget>(key: K, value: ScheduleTarget[K]) =>
    setDraft((current) => ({ ...current, target: { ...current.target, [key]: value } }))
  const selectedModel = models.find((model) => model.id === target.model)
  const efforts = selectedModel?.reasoningEfforts ?? []
  const contexts: RuntimeModelOption['contextTiers'] = ['default', ...(selectedModel?.contextTiers.filter((context) => context !== 'default') ?? [])]
  return <form noValidate className="schedule-form" onSubmit={async (event) => {
    event.preventDefault()
    setError(undefined)
    if (!targetPaired) { setStep('Target'); setError('Choose a paired computer before saving this schedule.'); return }
    if (!target.model && (target.effort || target.context === 'long_context')) {
      setStep('Target'); setError('Choose an explicit model for effort or long context, or reset those options to defaults.'); return
    }
    if (modelsLoaded && target.model && !selectedModel) {
      setStep('Target'); setError('The selected model is not in the current catalog. Choose an available model or Provider default.'); return
    }
    if (modelsLoaded && selectedModel && ((target.effort && !efforts.includes(target.effort)) || (target.context === 'long_context' && !contexts.includes(target.context)))) {
      setStep('Target'); setError('The selected model does not support the saved effort or context. Choose supported runtime options.'); return
    }
    if (target.permissionPolicy === 'allow-all' && !confirmed) { setError('Confirm Allow-all permissions explicitly before saving.'); return }
    const parsed = scheduleCreateSchema.safeParse({
      ...draft, target: { ...target, context: target.context === 'default' ? undefined : target.context },
    })
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      setError(issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid schedule')
      return
    }
    // A past once occurrence remains editable; only changes to recurrence must be future-valid.
    if (!editing || JSON.stringify(editing.recurrence) !== JSON.stringify(recurrence) || editing.timezone !== draft.timezone) {
      const validity = validateRecurrence(recurrence, draft.timezone)
      if (!validity.valid) { setError(validity.errors.join(' ')); return }
    }
    try { await onSave(parsed.data) } catch (caught) { setError(scheduleError(caught)) }
  }}>
    <div className="schedule-steps" role="group" aria-label="Schedule form sections">
      {(['Details', 'Target', 'Policies'] as const).map((name) =>
        <button type="button" aria-pressed={step === name} key={name} onClick={() => setStep(name)}>{name}</button>)}
    </div>
    {targetPaired && !modelsLoaded && <p role="status" className="schedule-caption">
      {modelsError ? `Runtime options could not be verified: ${modelsError}.` : 'Runtime options could not yet be verified (catalog loading).'} You can still save other edits.
    </p>}
    <fieldset disabled={pending} hidden={step !== 'Details'}>
      <legend>Schedule details</legend>
      <label className="field">Name<input className="dialog-input" maxLength={200} value={draft.name} onChange={(event) => update('name', event.target.value)} /></label>
      <label className="field">Prompt<textarea className="dialog-input" rows={4} maxLength={20_000} value={draft.prompt} onChange={(event) => update('prompt', event.target.value)} /></label>
      <div className="schedule-grid">
        <label className="field">Recurrence<select className="dialog-select" value={recurrence.type} onChange={(event) => update('recurrence', recurrencePreset(event.target.value as ScheduleRecurrence['type']))}>
          <option value="once">Once</option><option value="hourly">Hourly window</option><option value="daily">Daily</option><option value="weekdays">Weekdays</option><option value="weekly">Weekly</option><option value="cron">Cron</option>
        </select></label>
        <label className="field">Timezone<input className="dialog-input" value={draft.timezone} onChange={(event) => update('timezone', event.target.value)} /></label>
        {recurrence.type === 'once' && <label className="field schedule-wide">Once at (ISO timestamp with offset)<input className="dialog-input" value={recurrence.at} onChange={(event) => update('recurrence', { ...recurrence, at: event.target.value })} /></label>}
        {'time' in recurrence && <label className="field">Local time<input className="dialog-input" type="time" value={recurrence.time} onChange={(event) => update('recurrence', { ...recurrence, time: event.target.value })} /></label>}
        {recurrence.type === 'hourly' && <>
          <label className="field">Every N hours<input className="dialog-input" type="number" min={0.25} max={24} step={0.25} value={recurrence.everyHours} onChange={(event) => update('recurrence', { ...recurrence, everyHours: Number(event.target.value) })} /></label>
          <label className="field">Window start<input className="dialog-input" type="time" value={recurrence.windowStart ?? '00:00'} onChange={(event) => update('recurrence', { ...recurrence, windowStart: event.target.value })} /></label>
          <label className="field">Window end<input className="dialog-input" placeholder="24:00" value={recurrence.windowEnd ?? '24:00'} onChange={(event) => update('recurrence', { ...recurrence, windowEnd: event.target.value })} /></label>
        </>}
        {recurrence.type === 'weekly' && <div className="schedule-days schedule-wide" role="group" aria-label="Days of week">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => <label key={day}><input type="checkbox" checked={recurrence.days.includes(index)}
            onChange={(event) => update('recurrence', { ...recurrence, days: event.target.checked ? [...recurrence.days, index].sort() : recurrence.days.filter((value) => value !== index) })} />{day}</label>)}
        </div>}
        {recurrence.type === 'cron' && <label className="field schedule-wide">Cron expression (5 fields)<input className="dialog-input" value={recurrence.expression} onChange={(event) => update('recurrence', { ...recurrence, expression: event.target.value })} /></label>}
      </div>
      <section className="schedule-preview" aria-label="Next five occurrences">
        <h3>Next 5 occurrences</h3><p className="schedule-caption">{draft.timezone} · at least 15 minutes apart. DST gaps shift forward; ambiguous times use the first occurrence.</p>
        {preview.error ? <p role="status">Enter a valid recurrence and IANA timezone.</p> :
          <ol>{preview.dates.map((date) => <li key={date.toISOString()}>{scheduleTime(date, draft.timezone)}</li>)}</ol>}
        {!preview.error && !preview.dates.length && <p>No future occurrences.</p>}
      </section>
    </fieldset>
    <fieldset disabled={pending} hidden={step !== 'Target'}>
      <legend>Session target</legend>
      {!targetPaired && <p role="status" className="schedule-caption">This target computer is not paired. Choose a paired computer before saving.</p>}
      {targetPaired && !target.model && <p className="schedule-caption">Use default effort and context, or select an explicit model for runtime overrides.</p>}
      <div className="schedule-grid">
        <label className="field">Computer<select className="dialog-select" value={target.computerId} onChange={(event) => {
          update('target', { ...target, computerId: event.target.value, worktreeRoot: undefined, model: undefined, effort: undefined, context: undefined })
        }}>
          {!targetPaired && <option value={target.computerId} disabled>{target.computerId ? `${target.computerId} (not paired)` : 'Choose a paired computer'}</option>}
          {computers.map((computer) => <option key={computer.id} value={computer.id}>{computer.name} · {computer.isLocal ? 'Hub' : 'Node'}{computer.online ? '' : ' · Offline'}</option>)}</select></label>
        <label className="field">Provider<select className="dialog-select" value={target.provider} onChange={(event) =>
          update('target', { ...target, provider: event.target.value as ScheduleTarget['provider'], model: undefined, effort: undefined, context: undefined })}>
          <option value="copilot">GitHub Copilot</option><option value="claude">Claude Agent</option></select></label>
        <label className="field schedule-wide">Folder<input className="dialog-input" placeholder="/path/inside/allowed/roots" value={target.folder} onChange={(event) => updateTarget('folder', event.target.value)} /></label>
        {targetPaired && <FolderPicker key={target.computerId} computerId={target.computerId} value={target.folder} onSelect={(path) => updateTarget('folder', path)} />}
        <label className="field">Model<select className="dialog-select" value={target.model ?? ''} onChange={(event) => {
          update('target', { ...target, model: event.target.value || undefined, effort: undefined, context: undefined })
        }}><option value="">Provider default</option>
          {target.model && !selectedModel && <option value={target.model}>{target.model} ({modelsLoaded ? 'not in current catalog' : 'unverified'})</option>}
          {models.map((model) => <option value={model.id} key={model.id}>{model.name}</option>)}
        </select></label>
        <label className="field">Effort<select className="dialog-select" value={target.effort ?? ''} onChange={(event) => updateTarget('effort', event.target.value as ScheduleTarget['effort'] || undefined)}>
          <option value="">Default</option>
          {target.effort && !efforts.includes(target.effort) && <option value={target.effort}>{target.effort} ({!target.model ? 'needs a model' : modelsLoaded ? 'not in current catalog' : 'unverified'})</option>}
          {efforts.map((effort) => <option key={effort} value={effort}>{effort}</option>)}</select></label>
        <label className="field">Context<select className="dialog-select" value={target.context ?? 'default'} onChange={(event) => updateTarget('context', event.target.value === 'default' ? undefined : event.target.value as ScheduleTarget['context'])}>
          {target.context && !contexts.includes(target.context) && <option value={target.context}>{target.context} ({!target.model ? 'needs a model' : modelsLoaded ? 'not in current catalog' : 'unverified'})</option>}
          {contexts.map((context) => <option key={context} value={context}>{selectedModel ? contextSizeLabel(selectedModel, context) : 'Automatic'}</option>)}</select></label>
        <label className="field">Mode<select className="dialog-select" value={target.mode} onChange={(event) => updateTarget('mode', event.target.value as ScheduleTarget['mode'])}>
          <option value="autopilot">Autopilot</option><option value="interactive">Interactive</option><option value="plan">Plan</option></select></label>
      </div>
      <p className="schedule-caption">The owning computer enforces allowed roots and launch capabilities. Older computers must be updated before they can run schedules.</p>
    </fieldset>
    <fieldset disabled={pending} hidden={step !== 'Policies'}>
      <legend>Execution policies</legend>
      <div className="schedule-grid">
        <label className="field">Workspace<select className="dialog-select" value={draft.workspace} onChange={(event) => update('workspace', event.target.value as ScheduleDefinition['workspace'])}><option value="checkout">Current checkout</option><option value="worktree">Isolated worktree</option></select></label>
        <label className="field">Permission policy<select className="dialog-select" value={target.permissionPolicy} onChange={(event) => {
          updateTarget('permissionPolicy', event.target.value as ScheduleTarget['permissionPolicy']); setConfirmed(false)
        }}><option value="ask">Ask</option><option value="allow-all">Allow-all</option></select></label>
        <label className="field">Folder trust<select className="dialog-select" value={target.folderTrust} onChange={(event) => updateTarget('folderTrust', event.target.value as ScheduleTarget['folderTrust'])}><option value="ask">Ask before trusting</option><option value="auto-approve">Automatically trust this folder</option></select></label>
        <label className="field">Catch-up<select className="dialog-select" value={draft.catchUp} onChange={(event) => update('catchUp', event.target.value as ScheduleDefinition['catchUp'])}><option value="skip">Skip missed occurrences</option><option value="once">Catch up once</option></select></label>
        <label className="field">Overlap<select className="dialog-select" value={draft.overlap} onChange={(event) => update('overlap', event.target.value as ScheduleDefinition['overlap'])}><option value="skip">Skip new run</option><option value="queue">Queue</option><option value="replace">Replace after previous work stops</option></select></label>
        <label className="field">Maximum runtime (minutes)<input className="dialog-input" type="number" min={5} max={480} value={draft.maxRuntimeMin} onChange={(event) => update('maxRuntimeMin', Number(event.target.value))} /></label>
        <label className="field">Notify<select className="dialog-select" value={draft.notify} onChange={(event) => update('notify', event.target.value as ScheduleDefinition['notify'])}><option value="attention">When attention is needed</option><option value="always">Always</option><option value="never">Never</option></select></label>
      </div>
      <label className="schedule-check"><input type="checkbox" checked={draft.enabled} onChange={(event) => update('enabled', event.target.checked)} />Enabled after save</label>
      {target.permissionPolicy === 'allow-all' && <label className="schedule-confirm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />I explicitly allow all tool permissions for this schedule. This can change files and run commands unattended.</label>}
      <p className="schedule-caption">Ask and folder trust are independent. Worktree isolation does not grant permissions or broaden allowed roots.</p>
    </fieldset>
    {error && !saveError && <p role="alert" className="error-banner">{error}</p>}
    <div className="schedule-form__actions">
      <button type="button" className="secondary-button" disabled={pending} onClick={onCancel}>Cancel edit</button>
      {step !== 'Policies' ? <button type="button" className="primary-button" onClick={() => setStep(step === 'Details' ? 'Target' : 'Policies')}>Next: {step === 'Details' ? 'Target' : 'Policies'}</button> :
        <button type="submit" className="primary-button" disabled={pending || !targetPaired || (target.permissionPolicy === 'allow-all' && !confirmed)}>{pending ? 'Saving…' : 'Save schedule'}</button>}
    </div>
  </form>
}
