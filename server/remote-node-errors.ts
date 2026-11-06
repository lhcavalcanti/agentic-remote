import {
  httpDeliveryUncertain,
  SubmissionError,
  type SubmissionReceipt,
} from '../shared/submission-error.js'

export class RemoteNodeRequestError extends SubmissionError {
  /** The node's own reason is not on the wire; only a draft conflict is. */
  readonly reasonCode?: string

  constructor(
    message: string,
    statusCode: number,
    submission?: SubmissionReceipt,
    uncertainDelivery?: boolean,
    terminalDraftConflict?: boolean,
  ) {
    super(message, statusCode, submission, {
      terminalDraftConflict,
      uncertainDelivery: httpDeliveryUncertain(
        statusCode,
        uncertainDelivery,
        submission,
      ),
    })
    this.name = 'RemoteNodeRequestError'
    if (terminalDraftConflict) this.reasonCode = 'remote-node.terminal-draft-conflict'
  }
}

export class RemoteNodeRedirectError extends RemoteNodeRequestError {
  constructor(computerName: string, status: number) {
    super(
      `${computerName} returned an HTTP ${status} redirect. Configure the final node URL; redirects are not followed.`,
      502,
      undefined,
      false,
    )
    this.name = 'RemoteNodeRedirectError'
  }
}

export class RemoteNodeTransportError extends Error {
  readonly statusCode = 503

  constructor(computerName: string, cause: unknown) {
    super(`${computerName} is unavailable. Reconnect it and try again.`, {
      cause,
    })
    this.name = 'RemoteNodeTransportError'
  }
}

export class RemoteNodeCapabilityError extends Error {
  readonly statusCode = 409

  constructor(computerName: string) {
    super(
      `${computerName} does not support confined Knowledge reads yet. Update it to the latest release.`,
    )
    this.name = 'RemoteNodeCapabilityError'
  }
}
