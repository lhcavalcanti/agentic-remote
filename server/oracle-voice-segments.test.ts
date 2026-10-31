import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { SpeakableSegmenter } from './oracle-voice-segments.js'

describe('SpeakableSegmenter', () => {
  it('emits only completed new prose from replacement snapshots', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('Hello there')).toEqual([])
    expect(segmenter.update('Hello there. I am check')).toEqual(['Hello there.'])
    expect(segmenter.update('Hello there. I am checking now. Next')).toEqual([
      'I am checking now.',
    ])
  })

  it('does not speak fenced code, tables, URLs, or a rewritten suffix twice', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.finalize('Result:\n```ts\nalert(1)\n```\nVisit https://example.com.\nDone.'))
      .toEqual(['Result:', 'Done.'])
    expect(segmenter.update('Result:\n```ts\nalert(2)\n```\nVisit https://example.com.\nDone.'))
      .toEqual([])
  })

  it('replaces only the unfinished suffix of a snapshot', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('First answer. This draft is wr')).toEqual(['First answer.'])
    expect(segmenter.update('First answer. The corrected ending is ready. Next')).toEqual([
      'The corrected ending is ready.',
    ])
  })

  it('does not replay an emitted sentence when earlier prose is inserted', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('Second. Pending')).toEqual(['Second.'])
    expect(segmenter.update('First. Second. Pending')).toEqual(['First.'])
  })

  it('speaks new prose inserted before and after an emitted sentence', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('Second. Pending')).toEqual(['Second.'])
    expect(segmenter.update('First. Second. Third. Pending')).toEqual(['First.', 'Third.'])
  })

  it('preserves occurrence identity for repeated identical sentences', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('Echo. Echo. Pending')).toEqual(['Echo.', 'Echo.'])
    expect(segmenter.update('Intro. Echo. Echo. Outro. Pending')).toEqual([
      'Intro.',
      'Outro.',
    ])
  })

  it('preserves a current exact match before matching a deleted tombstone', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('First. Second. Pending')).toEqual(['First.', 'Second.'])
    expect(segmenter.update('Second. Pending')).toEqual([])
    expect(segmenter.update('Second. First. Pending')).toEqual(['First.'])
  })

  it('speaks novel prose after an earlier sentence becomes a tombstone', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('First. Second. Pending')).toEqual(['First.', 'Second.'])
    expect(segmenter.update('Second. Pending')).toEqual([])
    expect(segmenter.update('Third. Pending')).toEqual(['Third.'])
  })

  it('speaks novel prose after a later sentence becomes a tombstone', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('First. Second. Pending')).toEqual(['First.', 'Second.'])
    expect(segmenter.update('First. Pending')).toEqual([])
    expect(segmenter.update('Third. Pending')).toEqual(['Third.'])
  })

  it('strips Markdown controls while retaining speakable prose', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update(
      '# **Summary**\n\nUse [the guide](https://example.com/guide) carefully. '
      + 'Do not say `npm install`.\n\n'
      + '| Item | State |\n| --- | --- |\n| Build | ready |\n',
    )).toEqual([
      'Summary',
      'Use the guide carefully.',
      'Do not say.',
    ])
  })

  it('flushes a final unfinished sentence once', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('The final thought')).toEqual([])
    expect(segmenter.finalize('The final thought')).toEqual(['The final thought'])
    expect(segmenter.finalize('The final thought')).toEqual([])
  })

  it('confirms terminal punctuation at a tool boundary without speaking an unfinished phrase', () => {
    const completed = new SpeakableSegmenter('completed')
    expect(completed.update('I will check that now.')).toEqual([])
    expect(completed.confirmBoundary()).toEqual(['I will check that now.'])
    expect(completed.confirmBoundary()).toEqual([])

    const unfinished = new SpeakableSegmenter('unfinished')
    expect(unfinished.update('I will check that now')).toEqual([])
    expect(unfinished.confirmBoundary()).toEqual([])
  })

  it('caps long completed prose at word boundaries', () => {
    const segmenter = new SpeakableSegmenter('message-1', 20)
    expect(segmenter.update('Alpha beta gamma delta epsilon. Next')).toEqual([
      'Alpha beta gamma',
      'delta epsilon.',
    ])
  })

  it('keeps default synthesis segments within the playable voice budget', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    const segments = segmenter.update(`${'playable words '.repeat(24)}done. Next`)

    expect(segments.length).toBeGreaterThan(1)
    expect(segments.every((segment) => segment.length <= 150)).toBe(true)
  })

  it('treats each Markdown list line as a stable speech segment', () => {
    const segmenter = new SpeakableSegmenter('message-1')

    expect(segmenter.finalize(
      'Steps:\n- Check the service health\n- Verify paired computers\n- Keep sessions open',
    )).toEqual([
      'Steps:',
      'Check the service health',
      'Verify paired computers',
      'Keep sessions open',
    ])
  })

  it('holds ambiguous snapshot endings until later text confirms the boundary', () => {
    const numbered = new SpeakableSegmenter('numbered')
    expect(numbered.update('Items:\n1.')).toEqual([])
    expect(numbered.update('Items:\n1. First item\n2.')).toEqual([
      'Items:',
      'First item',
    ])
    expect(numbered.update('Items:\n1. First item\n2. Second item')).toEqual([])
    expect(numbered.update('Items:\n1. First item\n2. Second item\n3.')).toEqual([
      'Second item',
    ])

    const decimal = new SpeakableSegmenter('decimal')
    expect(decimal.update('Value is 2.')).toEqual([])
    expect(decimal.update('Value is 2.5 now. Next')).toEqual(['Value is 2.5 now.'])

    const filename = new SpeakableSegmenter('filename')
    expect(filename.update('Edit server/app.')).toEqual([])
    expect(filename.update('Edit server/app.ts now. Next')).toEqual([
      'Edit server/app.ts now.',
    ])

    const abbreviation = new SpeakableSegmenter('abbreviation')
    expect(abbreviation.update('Use examples, e.g.')).toEqual([])
    expect(abbreviation.update('Use examples, e.g. tests and docs. Next')).toEqual([
      'Use examples, e.g. tests and docs.',
    ])
  })

  it('starts fresh when reset to a new source message', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('Repeat me. Pending')).toEqual(['Repeat me.'])
    segmenter.reset('message-2')
    expect(segmenter.update('Repeat me. Pending')).toEqual(['Repeat me.'])
  })

  it('aligns sentence-dense rewrites within a bounded heap', () => {
    const script = `
      const { SpeakableSegmenter } = await import('./server/oracle-voice-segments.ts')
      const snapshot = Array.from(
        { length: 2_500 },
        (_, index) => \`Sentence \${index}.\`,
      ).join(' ')
      const segmenter = new SpeakableSegmenter('message-1')
      segmenter.update(snapshot)
      const fresh = segmenter.update(\`Intro. \${snapshot}\`)
      if (JSON.stringify(fresh) !== '["Intro."]') {
        throw new Error(\`unexpected fresh segments: \${JSON.stringify(fresh)}\`)
      }
    `
    const result = spawnSync(
      process.execPath,
      ['--max-old-space-size=64', '--import', 'tsx', '--input-type=module', '--eval', script],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 30_000,
      },
    )

    expect(
      {
        status: result.status,
        signal: result.signal,
        stderr: result.stderr.slice(-2_000),
      },
    ).toEqual({
      status: 0,
      signal: null,
      stderr: '',
    })
  }, 35_000)
})
