import {
  httpDeliveryUncertain,
  SubmissionError,
  type SubmissionReceipt,
} from '../shared/submission-error.js'

export class RemoteNodeRequestError extends SubmissionError {
  constructor(
    message: string,
    statusCode: number,
    submission?: SubmissionReceipt,
    uncertainDelivery?: boolean,
  ) {
    super(message, statusCode, submission, {
      uncertainDelivery: httpDeliveryUncertain(
        statusCode,
        uncertainDelivery,
        submission,
      ),
    })
    this.name = 'RemoteNodeRequestError'
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
