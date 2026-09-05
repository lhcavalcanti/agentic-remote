import {
  SubmissionError,
  type SubmissionReceipt,
} from '../shared/submission-error.js'

export class RemoteNodeRequestError extends SubmissionError {
  constructor(
    message: string,
    statusCode: number,
    submission?: SubmissionReceipt,
  ) {
    super(message, statusCode, submission)
    this.name = 'RemoteNodeRequestError'
  }
}

export class RemoteNodeRedirectError extends RemoteNodeRequestError {
  constructor(computerName: string, status: number) {
    super(
      `${computerName} returned an HTTP ${status} redirect. Configure the final node URL; redirects are not followed.`,
      502,
    )
    this.name = 'RemoteNodeRedirectError'
  }
}
