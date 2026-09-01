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
  it('stacks the actions below the text panel by default', async () => {
    const css = await stylesheet()

    expect(declaration(css, '.composer', 'flex-direction')).toBe('column')
  })

  it('only merges the actions in for a wide pointer-driven viewport', async () => {
    const css = await stylesheet()
    const desktop = atRule(css, /@media \(min-width: 961px\) and \(hover: hover\)/)

    expect(declaration(desktop, '.composer', 'flex-direction')).toBe('row')
    // Bottom-aligned, so the buttons stay with the last line as the box grows.
    expect(declaration(desktop, '.composer', 'align-items')).toBe('flex-end')
  })

  it('draws one panel rather than two stacked cards', async () => {
    const css = await stylesheet()
    const desktop = atRule(css, /@media \(min-width: 961px\) and \(hover: hover\)/)

    expect(declaration(desktop, '.composer', 'border')).toContain(
      'var(--border-strong)',
    )
    expect(
      declaration(desktop, '.composer > .composer-actions', 'border'),
    ).toBe('0')
    // The focus ring belongs to the merged panel now.
    expect(declaration(desktop, '.composer:focus-within', 'border-color')).toBe(
      '#59634c',
    )
  })

  it('does not push the buttons away from the text', async () => {
    const css = await stylesheet()
    const desktop = atRule(css, /@media \(min-width: 961px\) and \(hover: hover\)/)

    expect(declaration(desktop, '.composer-actions__spacer', 'display')).toBe(
      'none',
    )
  })

  it('gives the recording panel its own card', async () => {
    const css = await stylesheet()
    const desktop = atRule(css, /@media \(min-width: 961px\) and \(hover: hover\)/)

    // Full width on its own line rather than beside the text.
    expect(declaration(desktop, '.composer > .recording-panel', 'flex')).toBe(
      '1 0 100%',
    )
    // Nested inside the merged border it would read as a panel within a panel.
    expect(
      declaration(desktop, '.composer:has(.recording-panel)', 'border-color'),
    ).toBe('transparent')
  })
})
