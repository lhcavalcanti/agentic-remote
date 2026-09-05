import { describe, expect, it } from 'vitest'
import { isSessionResourceCommandName, sessionResourceCommand } from './session-resource-commands'

describe('read-only session resource commands', () => {
  it.each([
    ['/skill', 'skills', ''],
    ['/skills', 'skills', ''],
    ['/mcp', 'mcp', ''],
    ['  /SKILL release notes  ', 'skills', 'release notes'],
    ['/skills\ncode\nreview', 'skills', 'code review'],
    ['/mcp add example', 'mcp', 'add example'],
  ])('parses %s as a view, never a provider mutation', (content, tab, filter) => {
    expect(sessionResourceCommand(content)).toEqual({ tab, filter })
  })

  it.each(['/mc', '/mcps', '/skillset', '/skills-enable', 'Explain /mcp', ''])(
    'does not capture another command or message: %s',
    (content) => expect(sessionResourceCommand(content)).toBeUndefined(),
  )

  it('reserves the view aliases without capturing unrelated commands', () => {
    expect(['skill', 'skills', 'MCP'].every(isSessionResourceCommandName)).toBe(true)
    expect(isSessionResourceCommandName('mcp-status')).toBe(false)
  })
})
