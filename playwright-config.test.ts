import { describe, expect, it } from 'vitest'
import deterministicConfig from './playwright.config'
import realVoiceConfig from './playwright.real-voice.config'

describe('Playwright build isolation', () => {
  it.each([
    ['deterministic', deterministicConfig],
    ['real voice', realVoiceConfig],
  ])('%s E2E server builds and serves an isolated output', (_name, config) => {
    const webServer = config.webServer
    expect(Array.isArray(webServer)).toBe(false)
    if (!webServer || Array.isArray(webServer)) {
      throw new Error('Expected one Playwright web server')
    }
    expect(webServer.command).toContain('dist-e2e')
    expect(webServer.command).not.toContain('AGENTIC_REMOTE_RELEASE_DIR=$PWD/dist ')
  })
})
