import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('mobile safe areas', () => {
  it('keeps top-level iOS surfaces below the Dynamic Island', async () => {
    const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

    expect(css).toContain(
      '--app-safe-area-top: env(safe-area-inset-top, 0px)',
    )
    expect(css).toContain(
      '--app-safe-area-top: max(env(safe-area-inset-top, 0px), 59px)',
    )
    expect(css).toMatch(
      /\.conversation-header\s*\{[^}]*var\(--app-safe-area-top\)/s,
    )
    expect(css).toMatch(/\.brand\s*\{[^}]*var\(--app-safe-area-top\)/s)
    expect(css).toMatch(
      /\.dialog-backdrop\s*\{[^}]*var\(--app-safe-area-top\)/s,
    )
  })
})
