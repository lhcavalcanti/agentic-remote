import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { SpeakableSegmenter } from './oracle-voice-segments.js'

describe('SpeakableSegmenter', () => {
  it('emits only completed new prose from replacement snapshots', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('Hello there')).toEqual([])
    expect(segmenter.update('Hello there. I am check')).toEqual(['Hello there.'])
    expect(segmenter.update('Hello there. I am checking now.')).toEqual(['I am checking now.'])
  })

  it('does not speak fenced code, tables, URLs, or a rewritten suffix twice', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('Result:\n```ts\nalert(1)\n```\nVisit https://example.com.\nDone.'))
      .toEqual(['Result:', 'Done.'])
    expect(segmenter.update('Result:\n```ts\nalert(2)\n```\nVisit https://example.com.\nDone.'))
      .toEqual([])
  })

  it('replaces only the unfinished suffix of a snapshot', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('First answer. This draft is wr')).toEqual(['First answer.'])
    expect(segmenter.update('First answer. The corrected ending is ready.')).toEqual([
      'The corrected ending is ready.',
    ])
  })

  it('does not replay an emitted sentence when earlier prose is inserted', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('Second.')).toEqual(['Second.'])
    expect(segmenter.update('First. Second.')).toEqual(['First.'])
  })

  it('speaks new prose inserted before and after an emitted sentence', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('Second.')).toEqual(['Second.'])
    expect(segmenter.update('First. Second. Third.')).toEqual(['First.', 'Third.'])
  })

  it('preserves occurrence identity for repeated identical sentences', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('Echo. Echo.')).toEqual(['Echo.', 'Echo.'])
    expect(segmenter.update('Intro. Echo. Echo. Outro.')).toEqual(['Intro.', 'Outro.'])
  })

  it('preserves a current exact match before matching a deleted tombstone', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('First. Second.')).toEqual(['First.', 'Second.'])
    expect(segmenter.update('Second.')).toEqual([])
    expect(segmenter.update('Second. First.')).toEqual(['First.'])
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

  it('caps long completed prose at word boundaries', () => {
    const segmenter = new SpeakableSegmenter('message-1', 20)
    expect(segmenter.update('Alpha beta gamma delta epsilon.')).toEqual([
      'Alpha beta gamma',
      'delta epsilon.',
    ])
  })

  it('starts fresh when reset to a new source message', () => {
    const segmenter = new SpeakableSegmenter('message-1')
    expect(segmenter.update('Repeat me.')).toEqual(['Repeat me.'])
    segmenter.reset('message-2')
    expect(segmenter.update('Repeat me.')).toEqual(['Repeat me.'])
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
