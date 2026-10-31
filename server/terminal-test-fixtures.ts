// Pane drawings and fake Copilot pieces shared by the real-tmux test files.
// Functions here are embedded into fixture scripts with `toString()`, so they
// must stay self-contained.

export function readyComposer(text = '', working = false): string {
  return [
    '╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄',
    `┃ ${text}`,
    '╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
    working ? ' ◉ Working · esc interrupt' : ' / commands',
  ].join('\n')
}

/** Source for a fixture script's atomic `writeReceipt(value)`. */
export function fixtureReceiptWriter(filename: string): string {
  return `
import { renameSync, writeFileSync } from 'node:fs'
const receiptPath = ${JSON.stringify(filename)}
const writeReceipt = (value) => {
  writeFileSync(receiptPath + '.tmp', JSON.stringify(value))
  renameSync(receiptPath + '.tmp', receiptPath)
}
`
}
