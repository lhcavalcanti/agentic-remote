import { createHash } from 'node:crypto'
import {
  managerCheckCadences,
  type ManagerProactiveSettings,
} from '../shared/manager.js'
import {
  dreamerLocalParts,
  validateDreamerTimeZone,
} from './dreamer-schedule.js'

const MINUTE_MS = 60_000
const MAX_QUIET_SCAN_MINUTES = 26 * 60

export function managerCheckDefaults(): ManagerProactiveSettings {
  return {
    enabled: false,
    cadenceMinutes: 120,
    timeZone: 'UTC',
    quietStartHour: 22,
    quietEndHour: 7,
  }
}

export function validateManagerProactiveSettings(
  settings: ManagerProactiveSettings,
): ManagerProactiveSettings {
  if (!managerCheckCadences.includes(settings.cadenceMinutes)) {
    throw Object.assign(new Error('Oracle periodic checks require a supported cadence.'), {
      statusCode: 400,
    })
  }
  if (!validateDreamerTimeZone(settings.timeZone)) {
    throw Object.assign(new Error('Oracle periodic checks require a valid IANA timezone.'), {
      statusCode: 400,
    })
  }
  if (
    !Number.isInteger(settings.quietStartHour)
    || !Number.isInteger(settings.quietEndHour)
    || settings.quietStartHour < 0
    || settings.quietStartHour > 23
    || settings.quietEndHour < 0
    || settings.quietEndHour > 23
  ) {
    throw Object.assign(new Error('Oracle periodic check quiet hours must be whole hours from 0 to 23.'), {
      statusCode: 400,
    })
  }
  return { ...settings }
}

export function isManagerCheckQuiet(
  at: Date,
  settings: ManagerProactiveSettings,
): boolean {
  validateManagerProactiveSettings(settings)
  if (!Number.isFinite(at.getTime())) throw new Error('Invalid Oracle periodic check clock.')
  if (settings.quietStartHour === settings.quietEndHour) return false
  const { hour } = dreamerLocalParts(at, settings.timeZone)
  if (settings.quietStartHour < settings.quietEndHour) {
    return hour >= settings.quietStartHour && hour < settings.quietEndHour
  }
  return hour >= settings.quietStartHour || hour < settings.quietEndHour
}

export function nextManagerCheckAt(
  from: Date,
  settings: ManagerProactiveSettings,
): Date {
  validateManagerProactiveSettings(settings)
  if (!Number.isFinite(from.getTime())) throw new Error('Invalid Oracle periodic check clock.')
  return deferManagerCheckUntilAllowed(
    new Date(from.getTime() + settings.cadenceMinutes * MINUTE_MS),
    settings,
  )
}

export function deferManagerCheckUntilAllowed(
  from: Date,
  settings: ManagerProactiveSettings,
): Date {
  validateManagerProactiveSettings(settings)
  if (!Number.isFinite(from.getTime())) throw new Error('Invalid Oracle periodic check clock.')
  let candidate = new Date(from)
  for (let minute = 0; minute <= MAX_QUIET_SCAN_MINUTES; minute += 1) {
    if (!isManagerCheckQuiet(candidate, settings)) return candidate
    candidate = new Date(candidate.getTime() + MINUTE_MS)
  }
  throw new Error('Could not resolve the end of Oracle periodic check quiet hours.')
}

export function managerScheduledMessageId(scheduledFor: string): string {
  return `scheduled-${createHash('sha256').update(scheduledFor).digest('hex')}`
}
