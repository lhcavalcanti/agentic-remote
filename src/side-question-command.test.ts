import { describe, expect, it } from 'vitest'
import { sideQuestionCommand } from './side-question-command'

describe('side question command', () => {
  it('reads the question after /ask or /btw', () => {
    expect(sideQuestionCommand('/ask What changed?')).toEqual({ question: 'What changed?' })
    expect(sideQuestionCommand('  /BTW   two\nlines  ')).toEqual({ question: 'two\nlines' })
    expect(sideQuestionCommand('/ask')).toEqual({ question: '' })
  })

  it('leaves other text and commands alone', () => {
    expect(sideQuestionCommand('/asking x')).toBeUndefined()
    expect(sideQuestionCommand('ask x')).toBeUndefined()
    expect(sideQuestionCommand('/skills ask')).toBeUndefined()
  })
})
