import { describe, expect, it } from 'vitest'
import { hasClippedTerminalFormFooter } from './terminal-session.js'

describe('bounded clipped form controls', () => {
  it.each([
    ['single line', [' ↑/↓ select · enter accept · ctrl+d decline · esc cancel']],
    ['separator before wrap', [' ↑/↓ select · enter accept ·', ' ctrl+d decline · esc cancel']],
    ['separator after wrap', [' ↑/↓ select · enter accept', ' · ctrl+d decline · esc cancel']],
    ['separator on its own line', [' enter accept', ' ·', ' ctrl+d decline · esc cancel']],
    ['wrapped words', [' ↑/↓ select · enter', ' accept · ctrl+d', ' decline · esc', ' cancel']],
    ['six control lines', [' ↑/↓ select ·', ' space toggle ·', ' enter accept ·', ' tab next ·', ' shift+tab prev · ctrl+d decline ·', ' esc cancel']],
  ])('recognizes %s', (_name, lines) => {
    expect(hasClippedTerminalFormFooter([
      'Clipped question tail', 'Decision:', ' ❯ Default', ' Other', '', ...lines, '─'.repeat(80), '', '',
    ].join('\n'))).toBe(true)
  })

  it.each([
    ['blockquote', [' > enter accept ·', ' > esc cancel']],
    ['quoted string', [' "enter accept ·', ' esc cancel"']],
    ['code fence', [' ```text', ' enter accept ·', ' esc cancel', ' ```']],
    ['arbitrary text', [' enter accept · malicious action ·', ' esc cancel']],
    ['duplicated controls', [' enter accept · enter accept ·', ' esc cancel']],
    ['missing accept', [' ctrl+d decline ·', ' esc cancel']],
    ['missing cancel', [' enter accept ·', ' ctrl+d decline']],
    ['text after controls', [' enter accept ·', ' esc cancel', ' unrelated output']],
    ['disconnected hints', [' enter accept ·', '', ' esc cancel']],
    ['unbounded controls', [' ↑/↓ select ·', ' space toggle ·', ' enter accept ·', ' tab next ·', ' shift+tab prev ·', ' ctrl+d', ' decline ·', ' esc cancel']],
    ['history above composer', [' enter accept ·', ' esc cancel', '╻▄▄▄▄▄▄▄▄', '┃', '╹▀▀▀▀▀▀▀▀', ' / commands']],
    ['history above rounded composer', [' enter accept ·', ' esc cancel', '╭────────╮', '│ >      │', '╰────────╯', ' / commands']],
  ])('refuses %s', (_name, lines) => {
    expect(hasClippedTerminalFormFooter(lines.join('\n'))).toBe(false)
  })
})
