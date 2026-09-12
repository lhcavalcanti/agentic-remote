import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('phone prompt form layout', () => {
  it('keeps structured checkboxes compact and their labels inside the card', async () => {
    const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

    expect(css).toContain(
      ".user-input-card__field > input:not([type='checkbox']),",
    )
    expect(css).not.toMatch(/\.user-input-card__field input,\s*/)
    expect(css).toMatch(
      /\.user-input-card__option input\s*\{[^}]*width:\s*18px[^}]*height:\s*18px[^}]*flex:\s*0 0 18px[^}]*padding:\s*0/s,
    )
    expect(css).toMatch(
      /\.user-input-card__option > span\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere/s,
    )
    expect(css).toMatch(
      /\.permission-card,\s*\.user-input-card,\s*\.recovery-card\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/s,
    )
    expect(css).toMatch(
      /@media \(max-width:\s*500px\)[\s\S]*?\.user-input-card__shortcut-hint\s*\{[^}]*display:\s*none/s,
    )
  })
})
