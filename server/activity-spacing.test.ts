import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

async function stylesheet(): Promise<string> {
  return readFile(new URL('../src/index.css', import.meta.url), 'utf8')
}

function declaration(css: string, selector: string, property: string): string {
  const block = new RegExp(
    `${selector.replace(/[.+*]/g, (character) => `\\${character}`)}\\s*\\{([^}]*)\\}`,
  ).exec(css)
  expect(block, `missing rule ${selector}`).not.toBeNull()
  // Not anchored on ';' alone: the first declaration in a block follows '{'
  // or a comment. The lookbehind keeps 'max-width' from matching inside
  // '--composer-max-width'.
  const value = new RegExp(`(?<![\\w-])${property}\\s*:\\s*([^;]+)`).exec(
    block?.[1] ?? '',
  )
  expect(value, `missing ${property} in ${selector}`).not.toBeNull()
  return (value?.[1] ?? '').trim()
}

function pixels(value: string): number {
  const match = /(-?\d+(?:\.\d+)?)px/.exec(value)
  expect(match, `not a pixel value: ${value}`).not.toBeNull()
  return Number(match?.[1])
}

// Activity rows are pulled together with negative margins. Flex items do not
// collapse margins, so the stack gap and both adjacent margins add up, and a
// negative total renders as visibly overlapping rows.
describe('activity row spacing', () => {
  it('never lets two consecutive activity rows overlap', async () => {
    const css = await stylesheet()

    const gap = pixels(declaration(css, '.message-stack', 'gap'))
    const margin = pixels(declaration(css, '.message--activity', 'margin'))
    const adjacent = pixels(
      declaration(css, '.message--activity + .message--activity', 'margin-top'),
    )

    // gap + bottom margin of the first row + top margin of the second
    expect(gap + margin + adjacent).toBeGreaterThanOrEqual(0)
  })

  it('keeps an activity row tight against an ordinary message', async () => {
    const css = await stylesheet()

    const gap = pixels(declaration(css, '.message-stack', 'gap'))
    const margin = pixels(declaration(css, '.message--activity', 'margin'))

    const separation = gap + margin
    expect(separation).toBeGreaterThanOrEqual(0)
    expect(separation).toBeLessThan(gap)
  })
})

// The conversation column and the sidebar width are each defined once so they
// can be tuned in a single place rather than in the six rules that previously
// hard-coded them.
describe('layout width variables', () => {
  it('drives every conversation column from one variable', async () => {
    const css = await stylesheet()

    expect(declaration(css, '.app-shell', '--content-max-width')).toMatch(/px$/)
    expect(declaration(css, '.app-shell', '--composer-max-width')).toContain(
      'var(--content-max-width)',
    )
    // A stray literal here would silently stop following the variable.
    expect(css).not.toContain('(100% - 780px)')
    expect(css).not.toContain('(100% - 800px)')
  })

  it('lets the sidebar column be resized', async () => {
    const css = await stylesheet()

    expect(declaration(css, '.app-shell', 'grid-template-columns')).toBe(
      'var(--sidebar-width) minmax(0, 1fr)',
    )
    expect(declaration(css, '.app-shell', '--sidebar-width')).toMatch(/px$/)
    // Taken out of flow, or it would consume the grid column it sits on.
    expect(declaration(css, '.sidebar-resizer', 'position')).toBe('absolute')
  })
})
