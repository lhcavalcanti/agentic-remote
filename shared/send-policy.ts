import type { AgentProvider, SessionExecutionMode, SessionStatus } from './contracts.js'

export interface TerminalSendPolicyInput {
  status: SessionStatus
  provider?: AgentProvider
  executionMode?: SessionExecutionMode
  /** Whether the send is queued, either by choice or by the command's rules. */
  enqueue: boolean
  /** Whether the app itself handles the command rather than the session. */
  appLocalCommand: boolean
}

export interface TerminalSendRequestOptions {
  enqueue: boolean
  replaceTerminalDraft?: true
}

/**
 * The delivery options the app sends with a message or command.
 *
 * Only an immediate send to an idle or errored tmux-backed Copilot session
 * asks the terminal to replace a stale draft (docs/app-spec.md §6).
 */
export function terminalSendOptions(
  input: TerminalSendPolicyInput,
): TerminalSendRequestOptions {
  const replaceTerminalDraft =
    !input.enqueue &&
    !input.appLocalCommand &&
    (input.status === 'idle' || input.status === 'error') &&
    input.provider === 'copilot' &&
    input.executionMode === 'tmux'
  return replaceTerminalDraft
    ? { enqueue: input.enqueue, replaceTerminalDraft: true }
    : { enqueue: input.enqueue }
}
