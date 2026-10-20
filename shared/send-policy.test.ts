import { describe, expect, it } from 'vitest'
import type { AgentProvider, SessionExecutionMode, SessionStatus } from './contracts.js'
import { terminalSendOptions } from './send-policy.js'

const statuses: SessionStatus[] = ['idle', 'running', 'waiting', 'error']
const providers: Array<AgentProvider | undefined> = ['copilot', 'claude', undefined]
const executionModes: Array<SessionExecutionMode | undefined> = ['tmux', 'sdk', undefined]
const booleans = [false, true]

const combinations = statuses.flatMap((status) =>
  providers.flatMap((provider) =>
    executionModes.flatMap((executionMode) =>
      booleans.flatMap((enqueue) =>
        booleans.map((appLocalCommand) => ({
          status, provider, executionMode, enqueue, appLocalCommand,
        })),
      ),
    ),
  ),
)

// The only sends that ask the terminal to replace its draft (docs/app-spec.md
// §6): immediate, not handled by the app itself, to an idle or errored
// tmux-backed Copilot session.
const replacing = new Set([
  'idle copilot tmux false false',
  'error copilot tmux false false',
])

describe('terminalSendOptions', () => {
  it('covers every status, provider, execution mode, enqueue and app-local combination', () => {
    expect(combinations).toHaveLength(4 * 3 * 3 * 2 * 2)
  })

  it.each(combinations)(
    '$status $provider $executionMode enqueue=$enqueue appLocal=$appLocalCommand',
    (input) => {
      const key = [
        input.status, input.provider, input.executionMode, input.enqueue, input.appLocalCommand,
      ].join(' ')
      expect(terminalSendOptions(input)).toStrictEqual(
        replacing.has(key)
          ? { enqueue: false, replaceTerminalDraft: true }
          : { enqueue: input.enqueue },
      )
    },
  )
})
