import { CopilotClient, RuntimeConnection } from '@github/copilot-sdk'
import type { RuntimeReasoningEffort } from '../shared/contracts.js'
import type { ManagerStructuredMemoryMode } from '../shared/manager-structured-memory.js'
import type { ManagerSdkClient } from './manager-agent.js'

const efforts: RuntimeReasoningEffort[] = ['low', 'medium', 'high', 'xhigh', 'max']

/**
 * A Copilot runtime process of the manager's own, separate from the one that
 * runs your sessions, so a manager failure or restart never touches them.
 */
export function createManagerSdkClient(): ManagerSdkClient {
  const client = new CopilotClient({
    connection: RuntimeConnection.forStdio({
      path: process.env.COPILOT_BIN?.trim() || '/usr/local/bin/copilot',
    }),
    logLevel: 'error',
    useLoggedInUser: true,
  })
  // The manager's narrower types are a structural subset of the SDK's.
  return client as unknown as ManagerSdkClient
}

export interface ManagerRuntimeSettings {
  enabled: boolean
  model?: string
  reasoningEffort?: RuntimeReasoningEffort
  structuredMemory: ManagerStructuredMemoryMode
}

export function managerRuntimeSettings(environment: NodeJS.ProcessEnv = process.env): ManagerRuntimeSettings {
  const switchValue = environment.AGENTIC_REMOTE_MANAGER?.trim().toLowerCase()
  const effort = environment.AGENTIC_REMOTE_MANAGER_REASONING_EFFORT?.trim().toLowerCase()
  const structuredMemoryValue =
    environment.AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY?.trim().toLowerCase() || 'off'
  if (!['off', 'shadow', 'on'].includes(structuredMemoryValue)) {
    throw new Error(
      'AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY must be off, shadow, or on',
    )
  }
  return {
    enabled: !['off', 'false', '0', 'no', 'disabled'].includes(switchValue ?? ''),
    model: environment.AGENTIC_REMOTE_MANAGER_MODEL?.trim() || undefined,
    reasoningEffort: efforts.find((candidate) => candidate === effort),
    structuredMemory: structuredMemoryValue as ManagerStructuredMemoryMode,
  }
}
