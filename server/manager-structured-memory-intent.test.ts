import { describe, expect, it } from 'vitest'
import {
  hasExplicitStructuredMemoryIntent,
} from './manager-structured-memory-intent.js'

describe('structured memory intent', () => {
  it.each([
    ['Remember that I prefer concise pull request comments.'],
    ['Please save this preference in your memory: use squash merges.'],
    ['Store this decision in long-term memory for later.'],
  ])('recognizes an explicit remember request: %s', (message) => {
    expect(hasExplicitStructuredMemoryIntent(message, 'remember')).toBe(true)
  })

  it.each([
    ['Correct the memory about my pull request style.'],
    ['Update your remembered preference for merge strategy.'],
    ['Replace that memory with the corrected outcome.'],
  ])('recognizes an explicit correction request: %s', (message) => {
    expect(hasExplicitStructuredMemoryIntent(message, 'correct')).toBe(true)
  })

  it.each([
    ['Forget the memory about the old project.'],
    ['Delete that remembered preference.'],
    ['Remove this fact from your memory.'],
  ])('recognizes an explicit forget request: %s', (message) => {
    expect(hasExplicitStructuredMemoryIntent(message, 'forget')).toBe(true)
  })

  it.each([
    ['What do you remember about me?', 'remember'],
    ['Use your memory to answer this.', 'remember'],
    ["Don't remember this token.", 'remember'],
    ['Never store this preference.', 'remember'],
    ["Don't forget to run the tests.", 'forget'],
    ["Don't update the remembered preference.", 'correct'],
    ['Do not delete that memory.', 'forget'],
    ['Which memory is correct?', 'correct'],
    ['The agent said “remember to update docs.”', 'remember'],
  ] as const)('rejects implicit or negated intent: %s', (message, operation) => {
    expect(hasExplicitStructuredMemoryIntent(message, operation)).toBe(false)
  })

  const apostrophes = [
    "'",
    '\u2018',
    '\u2019',
    '\u201B',
    '\u02BC',
    '\u2032',
    '\uFF07',
    '`',
    '\u00B4',
  ]
  const negations = [
    ...apostrophes.flatMap((apostrophe) => [
      `don${apostrophe}t`,
      `Don${apostrophe}t`,
      `DON${apostrophe}T`,
    ]),
    'dont',
    'do not',
    'Do  not',
    'do\u00A0not',
    'never',
    'Never',
    'don\u200Bt',
  ]
  const requests = [
    ['remember', 'remember that my build token is private.'],
    ['remember', 'save this preference in memory.'],
    ['remember', 'store this decision in long-term memory.'],
    ['remember', 'keep this fact in memory.'],
    ['remember', 'ever remember that I like tabs.'],
    ['correct', 'update the remembered preference.'],
    ['forget', 'delete that memory.'],
  ] as const
  it.each(negations.flatMap((negation) =>
    requests.map(([operation, request]) =>
      [`${negation} ${request}`, operation] as const)))(
    'rejects negated intent across apostrophe variants: %s',
    (message, operation) => {
      expect(hasExplicitStructuredMemoryIntent(message, operation)).toBe(false)
    },
  )
})
