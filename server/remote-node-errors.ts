export class RemoteNodeRequestError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message)
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
