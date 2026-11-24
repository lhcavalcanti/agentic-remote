import { z } from 'zod'
import { TOOL_CALL_ID_PATTERN } from '../shared/activity-details.js'

export const toolCallIdSchema = z.string().regex(TOOL_CALL_ID_PATTERN, 'Invalid tool call ID')

function refusal(message: string, statusCode: number, reasonCode: string): Error {
  return Object.assign(new Error(message), { statusCode, reasonCode })
}

export function activityNotInLog(): Error {
  return refusal('This tool call is not in the session log.', 404, 'activity-details.not-found')
}

/** Claude Agent keeps no Copilot event log to read a call from. */
export function activityDetailsUnavailable(): Error {
  return refusal('Tool call details are unavailable for this provider.', 501, 'activity-details.unsupported-provider')
}

export function updateComputerForActivityDetails(computerName: string): Error {
  return refusal(`Update ${computerName} to see tool call details.`, 501, 'activity-details.update-computer')
}
