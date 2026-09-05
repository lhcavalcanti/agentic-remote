import { describe, expect, it } from 'vitest'
import {
  claudeMcp,
  claudeSkillNames,
  copilotMcp,
  copilotSkills,
  copilotWorkspaceMcp,
  enrichClaudeSkills,
  MAX_SESSION_RESOURCES,
  resourceMessages,
  sanitizeMcpSnapshot,
  sanitizeSkillsSnapshot,
  skillsSnapshot,
} from './session-resources.js'

const capturedAt = '2026-09-05T10:00:00.000Z'
const base = { sessionId: 'session', provider: 'copilot', scope: 'session', capturedAt }

describe('safe session resource summaries', () => {
  it('whitelists all peer metadata and never relays peer messages, config, or errors', () => {
    const secret = 'SYNTHETIC_PRIVATE_METADATA'
    const unexpected = {
      command: secret, args: [secret], env: { SECRET: secret }, headers: { Authorization: secret },
      url: `https://example.invalid/${secret}`, error: secret, config: { secret },
      host: { fullConfig: { secret } }, account: { email: secret }, path: secret,
    }
    const skills = sanitizeSkillsSnapshot({
      ...base, ...unexpected, computerId: secret, message: secret,
      skills: [{ name: 'review', description: 'Review changes', enabled: false, source: 'project', ...unexpected }],
    }, 'session', 'copilot')
    const mcp = sanitizeMcpSnapshot({
      ...base, ...unexpected,
      servers: [{ name: 'docs', status: 'failed', source: 'plugin', pluginName: 'docs-plugin', ...unexpected }],
    }, 'session', 'copilot')
    expect(JSON.stringify({ skills, mcp })).not.toContain(secret)
    expect(skills.skills).toMatchObject([{ name: 'review', enabled: false, source: 'project' }])
    expect(mcp.servers).toMatchObject([{ name: 'docs', status: 'failed', pluginName: 'docs-plugin' }])
    expect(skills.message).toBeUndefined()
  })

  it('normalizes only documented source, enabled, and connection metadata', () => {
    const skills = copilotSkills({
      skills: [
        { name: 'personal', description: '', source: 'personal-copilot', userInvocable: false, enabled: false },
        { name: 'agents', description: '', source: 'personal-agents', userInvocable: true, enabled: true },
        { name: 'parent', description: '', source: 'inherited', userInvocable: true, enabled: true },
      ],
    })
    expect(skills.items).toMatchObject([
      { name: 'personal', source: 'user', enabled: false, userInvocable: false },
      { name: 'agents', source: 'user' }, { name: 'parent', source: 'inherited' },
    ])
    expect(copilotMcp({ servers: [
      { name: 'work', status: 'needs-auth', source: 'workspace' },
      { name: 'stopped', status: 'stopped', source: 'plugin', sourcePlugin: 'plugin' },
      { name: 'missing', status: 'not_configured' },
    ] }).items).toMatchObject([
      { name: 'work', source: 'project', status: 'needs-auth' },
      { name: 'stopped', source: 'plugin', status: 'stopped', pluginName: 'plugin' },
      { name: 'missing', status: 'not_configured' },
    ])
    expect(copilotWorkspaceMcp({ servers: [
      { name: 'configured', enabled: true, type: 'stdio', source: 'user' },
      { name: 'off', enabled: false, type: 'http', source: 'builtin' },
    ] }).items).toMatchObject([
      { name: 'configured', status: 'unknown', enabled: true, transport: 'stdio' },
      { name: 'off', status: 'disabled', enabled: false, transport: 'http' },
    ])
    expect(claudeMcp([{
      name: 'docs', status: 'connected', scope: 'project', tools: [{ name: 'private-tool' }],
      config: { url: 'private-url' }, error: 'private-error',
    }]).items).toMatchObject([{ name: 'docs', status: 'connected', source: 'project', toolCount: 1 }])
    expect(JSON.stringify(claudeMcp([{ name: 'future', status: 'future-secret', scope: 'private-path' }]).items))
      .toBe('[{"name":"future","status":"unknown","source":"unknown"}]')
  })

  it('caps lists with truthful totals and preserves a valid authoritative empty list', () => {
    const entries = Array.from({ length: MAX_SESSION_RESOURCES + 1 }, (_, index) => ({ name: `skill-${index}` }))
    const snapshot = sanitizeSkillsSnapshot({ ...base, skills: entries }, 'session', 'copilot')
    expect(snapshot.skills).toHaveLength(MAX_SESSION_RESOURCES)
    expect(snapshot).toMatchObject({ totalCount: MAX_SESSION_RESOURCES + 1, truncated: true })
    expect(sanitizeSkillsSnapshot(snapshot, 'session', 'copilot')).toEqual(snapshot)
    expect(sanitizeSkillsSnapshot({ ...base, skills: [] }, 'session', 'copilot'))
      .toMatchObject({ scope: 'session', skills: [], totalCount: 0, truncated: false })
    const names = claudeSkillNames(Array.from({ length: MAX_SESSION_RESOURCES + 1 }, (_, i) => `skill-${i}`))
    expect(skillsSnapshot('session', 'claude', 'session', names).totalCount).toBe(MAX_SESSION_RESOURCES + 1)
  })

  it.each([
    { skills: undefined },
    { skills: [null] },
    { skills: [{ name: '' }] },
    { skills: [{ name: 'a'.repeat(257) }] },
    { skills: [{ name: 'skill', enabled: 'false' }] },
    { skills: [{ name: 'skill', description: 'a'.repeat(4_001) }] },
    { skills: [{ name: 'skill\nhidden' }] },
    { skills: [], totalCount: 2 },
    { skills: [], truncated: true },
    { skills: [{ name: 'skill' }], scope: 'unavailable' },
    { skills: [], capturedAt: 'private-invalid-date' },
    { skills: [], scope: 'global-private-value' },
    { skills: [], provider: 'claude' },
    { skills: [], sessionId: 'another-session' },
  ])('rejects malformed or misowned metadata %# without exposing it', (value) => {
    expect(() => sanitizeSkillsSnapshot({ ...base, ...value }, 'session', 'copilot'))
      .toThrow('The runtime returned invalid session resource metadata.')
  })

  it('does not turn discovery diagnostics or missing MCP data into an empty success', () => {
    expect(() => copilotSkills({ skills: [], errors: ['private/path failure'] }))
      .toThrow('Unable to read session resource metadata.')
    expect(() => sanitizeMcpSnapshot({ ...base }, 'session', 'copilot')).toThrow()
    expect(() => sanitizeMcpSnapshot({ ...base, servers: [{ name: 'a' }] }, 'session', 'copilot')).toThrow()
    expect(() => sanitizeMcpSnapshot({ ...base, servers: [{ name: 'a', status: 'connected', toolCount: -1 }] }, 'session', 'copilot')).toThrow()
  })

  it('only enriches skills reported by init, including exact command aliases', () => {
    const enriched = enrichClaudeSkills(claudeSkillNames(['review', 'plugin:lint', 'unlisted']).items, [
      { name: 'review', description: 'Review this change', argumentHint: '[path]' },
      { name: 'lint', description: 'Lint', argumentHint: '', aliases: ['plugin:lint'] },
      { name: 'help', description: 'Not a skill', argumentHint: '' },
    ])
    expect(enriched).toMatchObject([
      { name: 'review', commandName: 'review', description: 'Review this change', argumentHint: '[path]' },
      { name: 'plugin:lint', commandName: 'lint', description: 'Lint' },
      { name: 'unlisted' },
    ])
    expect(enriched.map((skill) => skill.name)).not.toContain('help')
    expect(sanitizeSkillsSnapshot({
      ...base, scope: 'workspace', skills: [], message: 'private peer diagnostics',
    }, 'session', 'copilot').message).toBe(resourceMessages.workspace)
  })
})
