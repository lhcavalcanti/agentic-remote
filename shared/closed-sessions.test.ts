import { describe, expect, it } from 'vitest'
import type { ChatMessage } from './contracts.js'
import {
  closedSessionContext,
  closedSessionExpiresAt,
  isClosedSessionContext,
} from './closed-sessions.js'

function message(role: ChatMessage['role'], content: string, index: number): ChatMessage {
  return { id: `m${index}`, role, content, createdAt: `2026-11-01T00:00:0${index}.000Z` }
}

describe('closed session context', () => {
  it('keeps the last three prompts oldest first, each on one line and bounded', () => {
    const context = closedSessionContext({
      title: 'Release review',
      cwd: '/home/tester/src/app',
      messages: [
        message('user', 'First prompt', 0),
        message('user', 'Second\n\n  prompt', 1),
        message('assistant', 'Working on it', 2),
        message('user', 'Third prompt', 3),
        message('user', `Fourth ${'x'.repeat(300)}`, 4),
      ],
    })

    expect(context.title).toBe('Release review')
    expect(context.cwd).toBe('/home/tester/src/app')
    expect(context.prompts).toHaveLength(3)
    expect(context.prompts[0]).toBe('Second prompt')
    expect(context.prompts[1]).toBe('Third prompt')
    expect(context.prompts[2]).toHaveLength(200)
    expect(context.prompts[2]).toMatch(/^Fourth x+…$/)
  })

  it('excerpts the latest non-empty reply and ignores activity and notices', () => {
    const context = closedSessionContext({
      title: 'Docs',
      cwd: '/srv/docs',
      messages: [
        message('assistant', `Reply ${'y'.repeat(500)}`, 0),
        message('activity', 'Ran tests', 1),
        message('assistant', '   ', 2),
        message('notice', 'Session restarted', 3),
      ],
    })

    expect(context.prompts).toEqual([])
    expect(context.reply).toHaveLength(400)
    expect(context.reply).toMatch(/^Reply y+…$/)
  })

  it('omits the reply when the session never answered', () => {
    expect(closedSessionContext({ title: 'New', cwd: '/srv', messages: [] }))
      .toEqual({ title: 'New', cwd: '/srv', prompts: [] })
  })

  it('never splits a character made of two code units', () => {
    const context = closedSessionContext({
      title: 'Emoji',
      cwd: '/srv',
      messages: [message('user', '😀'.repeat(250), 0)],
    })

    expect(Array.from(context.prompts[0]!)).toHaveLength(200)
    expect(context.prompts[0]).not.toMatch(/[\uD800-\uDBFF]…$/)
  })

  describe('read as plain text', () => {
    const replyTo = (content: string) =>
      closedSessionContext({ title: 'Notes', cwd: '/srv', messages: [message('assistant', content, 0)] }).reply

    it.each([
      ['lists', 'Changes:\n- Fixed the header\n- Added tests\n\n1. Install\n2. Run', 'Changes: Fixed the header Added tests Install Run'],
      ['a single task item after prose', 'Still to do\n- [ ] write the notes', 'Still to do write the notes'],
      ['headings', '# Title\nIntro\n\n## Next steps\nRun it\n\nUnderlined\n==========', 'Title Intro Next steps Run it Underlined'],
      ['emphasis and strikethrough', 'went **from 1,024** to *1,224* GiB, ~~not~~ __now__ for my_var_name', 'went from 1,024 to 1,224 GiB, not now for my_var_name'],
      ['links and references', 'See [the docs](https://example.com "Docs"), [the guide][g] and <https://example.com/a_b>.\n\n[g]: https://example.com/guide', 'See the docs, the guide and https://example.com/a_b.'],
      ['images', 'Before ![diagram](https://example.com/d.png) after ![shot][s]\n\n[s]: https://example.com/s.png', 'Before after'],
      ['inline and fenced code', 'Run `pnpm test` first:\n\n```ts\nconst total = 2 * 3\n```', 'Run pnpm test first: const total = 2 * 3'],
      ['HTML, but not a type named in prose', 'A <b>bold</b> word<br>and <kbd>Ctrl</kbd>+<kbd>C</kbd> return Promise<Option>.\n\n<details>\n<summary>Logs</summary>\n</details>\n\n<!-- marker -->', 'A bold word and Ctrl+C return Promise<Option>.'],
      ['paired capital tags, but not a lone type parameter', 'Use <B>bold</B> in Store<S>', 'Use bold in Store<S>'],
      ['a table', '| File | Change |\n| --- | :---: |\n| a.ts | added |', 'File Change a.ts added'],
      ['footnotes', 'It grew[^1].\n\n[^1]: Measured with df.', 'It grew.'],
      ['a quote and a rule', '> Quoted *line*\n\n---\n\nAfter', 'Quoted line After'],
    ])('keeps only the words of %s', (_case, markdown, text) => {
      expect(replyTo(markdown)).toBe(text)
    })

    it('cuts the plain text, so a cut leaves no half of its syntax', () => {
      expect(replyTo(`See [the ${'long '.repeat(100)}guide](https://example.com/guide) **now**`))
        .toBe(`See the ${'long '.repeat(78)}l…`)
    })

    it('skips a prompt with no words, such as one that was only an image', () => {
      const context = closedSessionContext({
        title: 'Shots',
        cwd: '/srv',
        messages: [message('user', 'Look at this', 0), message('user', '![screen](shot.png)', 1)],
      })

      expect(context.prompts).toEqual(['Look at this'])
    })

    it('reads no more than the first 20,000 characters of a message', () => {
      const afterNote = (length: number) => `<!-- ${'x'.repeat(length)} -->\n\nAfter the note`

      expect(replyTo(afterNote(5_000))).toBe('After the note')
      expect(replyTo(afterNote(25_000))).toBeUndefined()
    })

    it('reads a paste crowded with emphasis markers for less, so it cannot hold up the close', () => {
      const started = performance.now()
      expect(replyTo('*a'.repeat(15_000))).toBeDefined()
      expect(performance.now() - started).toBeLessThan(1_000)
    })

    it('reads a deeply nested paste without failing the close or showing its markers', () => {
      expect(replyTo(`${'>'.repeat(30_000)} deep`)).toBeUndefined()
      expect(replyTo(`${'> '.repeat(15_000)}deep`)).toBeUndefined()
    })
  })

  it('validates a stored context and rejects other shapes', () => {
    expect(isClosedSessionContext({ title: 'A', cwd: '/a', prompts: ['p'], reply: 'r' })).toBe(true)
    expect(isClosedSessionContext({ title: 'A', cwd: '/a', prompts: [] })).toBe(true)
    expect(isClosedSessionContext({ title: 'A', cwd: '/a', prompts: [1] })).toBe(false)
    expect(isClosedSessionContext({ title: 'A', prompts: [] })).toBe(false)
    expect(isClosedSessionContext(null)).toBe(false)
  })

  it('expires fourteen days after closing', () => {
    expect(closedSessionExpiresAt('2026-11-01T00:00:00.000Z'))
      .toBe(Date.parse('2026-11-15T00:00:00.000Z'))
    expect(closedSessionExpiresAt('not a date')).toBeNaN()
  })
})
