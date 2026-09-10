import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const styles = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

describe('recovery and Markdown question style integration', () => {
  it('keeps recovery headings without applying card headings to nested Markdown', () => {
    expect(styles).toMatch(
      /\.permission-card h3,\s*\.user-input-card > h3,\s*\.recovery-card h3\s*\{[^}]*font-size: 13px;/,
    )
    expect(styles).not.toMatch(/\.user-input-card h3\s*[,{}]/)
  })

  it('preserves question containment and recovery copy and action dimensions', () => {
    expect(styles).toMatch(
      /\.user-input-card__question\s*\{[^}]*min-width: 0;[^}]*max-width: 100%;[^}]*font-size: 13px;[^}]*line-height: 1\.55;[^}]*overflow-wrap: anywhere;/,
    )
    expect(styles).toMatch(
      /\.recovery-card p:not\(\.eyebrow\)\s*\{[^}]*margin: 8px 0 14px;[^}]*color: var\(--text-secondary\);[^}]*font-size: 12px;[^}]*line-height: 1\.5;/,
    )
    expect(styles).toMatch(/\.recovery-card \.primary-button\s*\{[^}]*min-height: 40px;/)
  })
})
