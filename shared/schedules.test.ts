import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SCHEDULE_TIMEZONE,
  scheduleRecurrenceSchema,
  scheduleRunSchema,
  scheduleSchema,
  scheduleTargetSchema,
  scheduleTimezoneSchema,
} from './schedules.js'

const timestamp = '2026-11-13T20:00:00.000Z'
const schedule = {
  id: 'schedule-1',
  name: 'Morning review',
  prompt: '  Review the changes.\n',
  target: { computerId: 'computer-1', folder: '/work/repo', provider: 'copilot' },
  workspace: 'checkout',
  recurrence: { type: 'daily', time: '09:00' },
  catchUp: 'skip',
  overlap: 'skip',
  maxRuntimeMin: 30,
  notify: 'attention',
  enabled: true,
  archived: false,
  createdBy: 'user',
  revision: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
}

describe('scheduleSchema', () => {
  it('defaults the timezone and independent launch policies without changing prompt bytes', () => {
    const parsed = scheduleSchema.parse(schedule)
    expect(parsed.timezone).toBe(DEFAULT_SCHEDULE_TIMEZONE)
    expect(parsed.prompt).toBe('  Review the changes.\n')
    expect(parsed.target).toEqual({
      ...schedule.target, mode: 'autopilot', permissionPolicy: 'ask', folderTrust: 'ask',
    })
  })

  it('does not make worktree or Oracle schedules permissive', () => {
    const parsed = scheduleSchema.parse({ ...schedule, workspace: 'worktree', createdBy: 'oracle' })
    expect(parsed.target.permissionPolicy).toBe('ask')
    expect(parsed.target.folderTrust).toBe('ask')
    expect(scheduleTargetSchema.parse({
      ...schedule.target,
      provider: 'claude',
      model: 'model-1',
      effort: 'max',
      context: 'long_context',
      mode: 'plan',
      permissionPolicy: 'allow-all',
      folderTrust: 'auto-approve',
    })).toMatchObject({ provider: 'claude', mode: 'plan', permissionPolicy: 'allow-all', folderTrust: 'auto-approve' })
  })

  it('accepts 20,000 characters, both runtime limits, and offset timestamps', () => {
    for (const maxRuntimeMin of [5, 480]) {
      expect(scheduleSchema.safeParse({
        ...schedule, prompt: 'a'.repeat(20_000), maxRuntimeMin,
        createdAt: '2026-11-13T12:00:00-08:00',
      }).success).toBe(true)
    }
  })

  it.each([
    ['name', ' '],
    ['prompt', ' '],
    ['prompt', 'a'.repeat(20_001)],
    ['workspace', 'temporary'],
    ['catchUp', 'all'],
    ['overlap', 'concurrent'],
    ['maxRuntimeMin', 4],
    ['maxRuntimeMin', 481],
    ['maxRuntimeMin', 5.5],
    ['notify', 'errors'],
    ['enabled', 'true'],
    ['archived', 0],
    ['createdBy', 'system'],
    ['revision', 0],
    ['revision', 1.5],
    ['createdAt', '2026-02-30T12:00:00Z'],
    ['updatedAt', '2026-11-13T12:00:00'],
    ['unexpected', 'not allowed'],
  ])('reports an invalid %s at the relevant field', (field, value) => {
    const result = scheduleSchema.safeParse({ ...schedule, [field]: value })
    expect(result.success).toBe(false)
    if (!result.success && field !== 'unexpected') {
      expect(result.error.issues[0].path[0]).toBe(field)
    }
  })

  it.each([
    { computerId: '' },
    { folder: ' ' },
    { provider: 'unknown' },
    { model: '' },
    { effort: 'extreme' },
    { context: 'large' },
    { mode: 'agent' },
    { permissionPolicy: 'automatic' },
    { folderTrust: 'trusted' },
    { allowAll: true },
  ])('rejects invalid target fields: %j', (target) => {
    expect(scheduleSchema.safeParse({ ...schedule, target: { ...schedule.target, ...target } }).success).toBe(false)
  })
})

describe('scheduleTimezoneSchema', () => {
  it.each(['America/Los_Angeles', 'Europe/London', 'Asia/Kolkata', 'UTC', 'Etc/UTC'])('accepts IANA timezone %s', (timezone) => {
    expect(scheduleTimezoneSchema.parse(timezone)).toBe(timezone)
  })

  it.each(['', 'Mars/Olympus', ' America/Los_Angeles', 'Europe/London ', '+05:30', '-0800'])('rejects timezone %j', (timezone) => {
    const result = scheduleTimezoneSchema.safeParse(timezone)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toContain('IANA')
  })
})

describe('scheduleRecurrenceSchema', () => {
  it('represents past one-off schedules without a clock-dependent schema', () => {
    expect(scheduleRecurrenceSchema.parse({ type: 'once', at: '2020-01-01T00:00:00Z' })).toEqual({
      type: 'once', at: '2020-01-01T00:00:00Z',
    })
  })

  it.each([
    { type: 'once', at: 'not a timestamp' },
    { type: 'hourly', everyHours: 0 },
    { type: 'hourly', everyHours: 25 },
    { type: 'hourly', everyHours: 1 / 7 },
    { type: 'hourly', everyHours: 1, windowStart: '24:00' },
    { type: 'hourly', everyHours: 1, windowEnd: '24:01' },
    { type: 'daily', time: '9:30' },
    { type: 'weekdays', time: '24:00' },
    { type: 'weekly', days: [], time: '09:00' },
    { type: 'weekly', days: [1, 1], time: '09:00' },
    { type: 'weekly', days: [7], time: '09:00' },
    { type: 'daily', time: '09:00', days: [1] },
    { type: 'cron', expression: '60 * * * *' },
    { type: 'after', minutes: 5 },
  ])('rejects malformed recurrence %j', (recurrence) => {
    expect(scheduleRecurrenceSchema.safeParse(recurrence).success).toBe(false)
  })
})

describe('scheduleRunSchema', () => {
  const run = {
    id: 'run-1',
    scheduleId: 'schedule-1',
    occurrenceAt: timestamp,
    trigger: 'schedule',
    status: 'pending',
    launchId: 'launch-1',
    computerId: 'computer-1',
  }

  it.each(['launchId', 'rootPromptReceipt'])('uses launch API identity validation for %s without trimming tokens', (field) => {
    for (const token of ['has space', ' padded ', 'a/b', 'x'.repeat(129), 'x'.repeat(200)]) {
      expect(scheduleRunSchema.safeParse({ ...run, [field]: token }).success).toBe(false)
    }
    for (const token of ['run:root-1_ok.v2', 'x'.repeat(128)]) {
      expect(scheduleRunSchema.parse({ ...run, [field]: token })[field as 'launchId' | 'rootPromptReceipt']).toBe(token)
    }
  })

  it('represents a persisted launch before acceptance and records an opaque accepted prompt receipt later', () => {
    expect(scheduleRunSchema.parse(run)).toEqual(run)
    const accepted = {
      ...run, status: 'running', rootPromptReceipt: 'prompt-1', sessionId: 'session-1', startedAt: timestamp,
    }
    expect(scheduleRunSchema.parse(accepted)).toEqual(accepted)
    const finished = { ...accepted, status: 'succeeded', endedAt: timestamp, summary: 'Reviewed the changes.' }
    expect(scheduleRunSchema.parse(finished)).toEqual(finished)
  })

  it.each([
    'pending', 'launching', 'running', 'needs-input', 'stopping',
    'succeeded', 'failed', 'stopped', 'missed', 'interrupted',
  ])('accepts lifecycle status %s', (status) => {
    expect(scheduleRunSchema.safeParse({ ...run, status }).success).toBe(true)
  })

  it.each(['schedule', 'manual', 'catch-up'])('accepts trigger %s', (trigger) => {
    expect(scheduleRunSchema.safeParse({ ...run, trigger }).success).toBe(true)
  })

  it.each([
    { scheduleId: '' }, { launchId: '' }, { computerId: '' },
    { rootPromptReceipt: '' }, { rootPromptReceipt: {} }, { sessionId: '' },
    { status: 'done' }, { trigger: 'restart' }, { endedAt: 'yesterday' }, { error: 123 },
    { untrusted: true },
  ])('rejects malformed run fields %j', (fields) => {
    expect(scheduleRunSchema.safeParse({ ...run, ...fields }).success).toBe(false)
  })
})
