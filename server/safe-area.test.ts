import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('mobile safe areas', () => {
  it('keeps long reader titles out from under document navigation controls', async () => {
    const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
    expect(css).toMatch(
      /\.workspace-preview__header strong,[^{]*\{[^}]*overflow:\s*hidden[^}]*text-overflow:\s*ellipsis[^}]*white-space:\s*nowrap/s,
    )
  })

  it('keeps top-level iOS surfaces below the Dynamic Island', async () => {
    const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

    expect(css).toContain(
      '--app-safe-area-top: env(safe-area-inset-top, 0px)',
    )
    expect(css).toContain(
      '--app-safe-area-top: max(env(safe-area-inset-top, 0px), 59px)',
    )
    expect(css).toContain(
      '--app-content-safe-area-top: var(--app-safe-area-top)',
    )
    expect(css).toMatch(
      /\.app-shell--keyboard-open\s*\{[^}]*--app-content-safe-area-top:\s*0px/s,
    )
    expect(css).toMatch(
      /top:\s*max\(\s*var\(--visual-viewport-top,\s*0px\),\s*var\(--app-safe-area-top\)/s,
    )
    expect(css).toContain('top: var(--visual-viewport-top, 0px);')
    expect(css).toContain('height: var(--visual-viewport-height, 100dvh);')
    expect(css).toMatch(
      /\.conversation-header\s*\{[^}]*var\(--app-content-safe-area-top\)/s,
    )
    expect(css).toMatch(
      /\.brand\s*\{[^}]*var\(--app-content-safe-area-top\)/s,
    )
    expect(css).toMatch(
      /\.dialog-backdrop\s*\{[^}]*var\(--app-content-safe-area-top\)/s,
    )
    expect(css).toMatch(
      /\.new-session-dialog\s*>\s*form\s*\{[^}]*overflow-y:\s*auto/s,
    )
    expect(css).toMatch(
      /\.new-session-dialog\s*>\s*form\s*\{[^}]*touch-action:\s*pan-y/s,
    )
    expect(css).toMatch(
      /\.new-session-dialog\s*\{[^}]*max-height:\s*100%[^}]*overflow:\s*hidden/s,
    )
    expect(css).toMatch(
      /\.new-session-dialog\s+\.dialog__header\s*\{[^}]*flex:\s*0\s+0\s+auto/s,
    )
  })

  it('scrolls the background tasks, not the panel around them', async () => {
    const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

    // The whole panel used to scroll as one, so reaching the older tasks took
    // the heading and the close button off the top with them.
    expect(css).toMatch(
      /\.background-tasks-dialog\s*\{[^}]*flex-direction:\s*column[^}]*overflow:\s*hidden/s,
    )
    expect(css).not.toMatch(
      /\.background-tasks-dialog\s*\{[^}]*overflow-y:\s*auto/s,
    )
    expect(css).toMatch(
      /\.background-tasks-dialog\s+\.dialog__header,[^{]*\{[^}]*flex:\s*0\s+0\s+auto/s,
    )
    expect(css).toMatch(
      /\.background-task-list\s*\{[^}]*min-height:\s*0[^}]*overflow-y:\s*auto/s,
    )
  })
})
