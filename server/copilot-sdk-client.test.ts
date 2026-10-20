import { describe, expect, it } from 'vitest'
import { copilotSdkClientOptions } from './copilot-sdk-client.js'

describe('copilotSdkClientOptions', () => {
  it('uses the SDK-bundled runtime by default', () => {
    const options = copilotSdkClientOptions({ COPILOT_BIN: '/interactive/copilot' })
    expect(options.connection).toBeUndefined()
    expect(options).toMatchObject({
      mode: 'copilot-cli',
      logLevel: 'error',
      useLoggedInUser: true,
    })
  })

  it('uses only the dedicated SDK executable override', () => {
    const options = copilotSdkClientOptions({
      COPILOT_BIN: '/interactive/copilot',
      COPILOT_SDK_BIN: '/sdk/copilot',
    })
    expect(options.connection).toBeDefined()
  })
})
