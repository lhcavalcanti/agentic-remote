import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

async function stylesheet(): Promise<string> {
  return readFile(new URL('../src/index.css', import.meta.url), 'utf8')
}

// Returns the body of the first at-rule whose prelude matches, brace-counted
// so nested rules inside the block are kept.
function atRule(css: string, prelude: RegExp): string {
  const start = css.search(prelude)
  expect(start, `missing at-rule ${prelude}`).toBeGreaterThanOrEqual(0)
  const open = css.indexOf('{', start)
  let depth = 0
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') {
      depth += 1
    } else if (css[index] === '}') {
      depth -= 1
      if (depth === 0) {
        return css.slice(open + 1, index)
      }
    }
  }
  throw new Error(`unterminated at-rule ${prelude}`)
}

// The inline layout lives in a container query nested inside a pointer media
// query, so both levels are unwrapped before a rule is read.
function composerPointerBlock(css: string): string {
  for (const match of css.matchAll(/@media \(hover: hover\)/g)) {
    const block = atRule(css.slice(match.index), /^@media \(hover: hover\)/)
    if (/@container composer \(min-width: 620px\)/.test(block)) {
      return block
    }
  }
  throw new Error('missing pointer media block containing the composer query')
}

// Other features have coarse-pointer blocks of their own; read the one that
// styles the composer hint.
function coarsePointerBlock(css: string, selector: string): string {
  for (const match of css.matchAll(/@media \(pointer: coarse\)/g)) {
    const block = atRule(css.slice(match.index), /^@media \(pointer: coarse\)/)
    if (block.includes(selector)) {
      return block
    }
  }
  throw new Error(`missing coarse pointer block containing ${selector}`)
}

function pointerLayout(css: string): string {
  const pointer = composerPointerBlock(css)
  return atRule(pointer, /@container composer \(min-width: 620px\)/)
}

function declaration(css: string, selector: string, property: string): string {
  const block = new RegExp(
    `${selector.replace(/[.+*>()[\]:-]/g, (character) => `\\${character}`)}\\s*\\{([^}]*)\\}`,
  ).exec(css)
  expect(block, `missing rule ${selector}`).not.toBeNull()
  const value = new RegExp(`(?<![\\w-])${property}\\s*:\\s*([^;]+)`).exec(
    block?.[1] ?? '',
  )
  expect(value, `missing ${property} in ${selector}`).not.toBeNull()
  return (value?.[1] ?? '').trim()
}

// On a pointer device the send, attach and record buttons sit inside the text
// panel. A touch device keeps them in a separate bar, where they stay large
// enough to hit with a thumb.
describe('desktop composer layout', () => {
  // That row is the classic composer's. The refreshed one stays a column,
  // where a full-row attachment or recording would push the text panel and
  // buttons out of the box.
  const classic = '.composer:not(.composer--refresh)'

  it('stacks the actions below the text panel by default', async () => {
    const css = await stylesheet()

    expect(declaration(css, '.composer', 'flex-direction')).toBe('column')
  })

  it('only merges the actions in for a wide pointer-driven composer', async () => {
    const css = await stylesheet()
    const desktop = pointerLayout(css)

    expect(declaration(desktop, classic, 'flex-direction')).toBe('row')
    // Bottom-aligned, so the buttons stay with the last line as the box grows.
    expect(declaration(desktop, classic, 'align-items')).toBe('flex-end')
  })

  // The sidebar is resizable, so a wide window can still leave a narrow
  // conversation column. Keying on the viewport squeezed the text field to
  // about 120px at a 980px window with the sidebar dragged out.
  it('measures the composer, not the window', async () => {
    const css = await stylesheet()

    expect(declaration(css, '.composer-area', 'container')).toBe(
      'composer / inline-size',
    )
    const pointer = composerPointerBlock(css)
    expect(pointer).toContain('@container composer (min-width: 620px)')
    // A viewport gate on the prelude would ignore the sidebar entirely.
    expect(css).toContain('@media (hover: hover) {')
  })

  it('draws one panel rather than two stacked cards', async () => {
    const css = await stylesheet()
    const desktop = pointerLayout(css)

    expect(declaration(desktop, '.composer', 'border')).toContain(
      'var(--border-strong)',
    )
    expect(
      declaration(desktop, '.composer > .composer-actions', 'border'),
    ).toBe('0')
    // The focus ring belongs to the merged panel now.
    expect(declaration(desktop, '.composer:focus-within', 'border-color')).toBe(
      'var(--accent-focus)',
    )
  })

  it('does not push the buttons away from the text', async () => {
    const css = await stylesheet()
    const desktop = pointerLayout(css)

    expect(declaration(desktop, '.composer-actions__spacer', 'display')).toBe(
      'none',
    )
  })

  it('gives the recording panel its own card', async () => {
    const css = await stylesheet()
    const desktop = pointerLayout(css)

    // Full width on its own line rather than beside the text.
    expect(declaration(desktop, `${classic} > .recording-panel`, 'flex')).toBe(
      '1 0 100%',
    )
    // Nested inside the merged border it would read as a panel within a panel.
    expect(
      declaration(desktop, `${classic}:has(.recording-panel)`, 'border-color'),
    ).toBe('transparent')
  })

  // `phoneEnterCreatesNewline` gates on a coarse pointer as well as on width,
  // so a tablet in landscape adds a line on Return while being wider than the
  // breakpoint. Switching the hint on width alone told it the opposite.
  it('reads the Enter hint the same way the composer decides', async () => {
    const css = await stylesheet()
    const coarse = coarsePointerBlock(css, '.composer-hint__desktop')

    expect(declaration(coarse, '.composer-hint__desktop', 'display')).toBe(
      'none',
    )
    expect(declaration(coarse, '.composer-hint__mobile', 'display')).toBe(
      'inline',
    )
  })
})

describe('Oracle Conversation composer layout', () => {
  it('keeps Conversation controls large enough for touch and visibly focusable', async () => {
    const css = await stylesheet()

    expect(declaration(css, '.manager-conversation-toggle', 'min-height')).toBe('44px')
    expect(declaration(css, '.manager-conversation-stop', 'min-height')).toBe('44px')
    expect(declaration(css, '.manager-conversation-toggle:focus-visible', 'outline')).toContain(
      'var(--accent)',
    )
  })

  it('gives the Conversation action its own row at the 390px phone layout', async () => {
    const css = await stylesheet()
    const phone = atRule(css, /@media \(max-width: 420px\)/)

    expect(declaration(phone, '.manager-composer__row--conversation', 'flex-wrap')).toBe('wrap')
    expect(declaration(phone, '.manager-composer__actions--conversation', 'flex')).toBe(
      '1 0 100%',
    )
  })

  it('stops the activity marker under reduced motion', async () => {
    const css = await stylesheet()
    const reduced = atRule(css, /@media \(prefers-reduced-motion: reduce\)/)

    expect(
      declaration(reduced, '.manager-conversation-status__activity', 'animation'),
    ).toBe('none !important')
  })
})
