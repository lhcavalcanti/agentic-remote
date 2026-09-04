import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('accent themes', () => {
  it('keeps completion and waiting colors independent from the chosen accent', async () => {
    const css = await readFile(
      new URL('../src/index.css', import.meta.url),
      'utf8',
    )

    expect(css).toMatch(
      /\.background-task--completed\s*\{[^}]*var\(--success\)/s,
    )
    expect(css).toMatch(
      /\.background-task--completed \.background-task__status-icon\s*\{[^}]*var\(--success\)/s,
    )
    expect(css).toMatch(
      /\.background-task--completed \.background-task__status\s*\{[^}]*var\(--success\)/s,
    )
    expect(css).toMatch(
      /\.activity-message--completed \.activity-message__glyph\s*\{[^}]*var\(--success\)/s,
    )
    expect(css).toContain(".app-shell[data-accent-theme='teal']")
    expect(css).not.toMatch(
      /\.app-shell\[data-accent-theme='[^']+'\]\s*\{[^}]*--accent:\s*#f2c96d/s,
    )
  })
})
