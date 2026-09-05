// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  breadcrumbSegments,
  headingSlug,
  headingText,
  inlineText,
  outlineFromMarkdown,
  resolveDocumentPath,
  isExternalSource,
  pushNavigation,
  rememberScroll,
  type NavigationEntry,
} from './markdown-navigation'

describe('headingSlug', () => {
  it('slugifies heading text', () => {
    expect(headingSlug('Session model')).toBe('session-model')
    expect(headingSlug('  Files and Knowledge  ')).toBe('files-and-knowledge')
    expect(headingSlug('API: routes & limits!')).toBe('api-routes-limits')
    expect(headingSlug('Réponse rapide')).toBe('réponse-rapide')
  })

  it('falls back for text with no slug characters', () => {
    expect(headingSlug('***')).toBe('section')
    expect(headingSlug('')).toBe('section')
  })

  it('suffixes duplicates when tracking used slugs', () => {
    const used = new Map<string, number>()
    expect(headingSlug('Setup', used)).toBe('setup')
    expect(headingSlug('Setup', used)).toBe('setup-1')
    expect(headingSlug('Setup', used)).toBe('setup-2')
  })

  it('is stable when called repeatedly without tracking', () => {
    expect(headingSlug('Setup')).toBe(headingSlug('Setup'))
  })
})

describe('headingText', () => {
  it('flattens nested react children to plain text', () => {
    expect(headingText('Plain')).toBe('Plain')
    expect(headingText(['A ', 'B'])).toBe('A B')
    expect(headingText({ props: { children: ['Nested ', 'text'] } })).toBe(
      'Nested text',
    )
    expect(
      headingText({ props: { children: { props: { children: 'Deep' } } } }),
    ).toBe('Deep')
  })

  it('ignores empty nodes', () => {
    expect(headingText(null)).toBe('')
    expect(headingText(undefined)).toBe('')
    expect(headingText(true)).toBe('')
  })
})

describe('breadcrumbSegments', () => {
  it('returns the root for the workspace root', () => {
    expect(breadcrumbSegments('.', 'project')).toEqual([
      { name: 'project', path: '.' },
    ])
  })

  it('builds a navigable ancestor chain', () => {
    expect(breadcrumbSegments('docs/guides/setup.md', 'project')).toEqual([
      { name: 'project', path: '.' },
      { name: 'docs', path: 'docs' },
      { name: 'guides', path: 'docs/guides' },
      { name: 'setup.md', path: 'docs/guides/setup.md' },
    ])
  })

  it('ignores empty and dot segments', () => {
    expect(breadcrumbSegments('./docs//guides')).toEqual([
      { name: '~', path: '.' },
      { name: 'docs', path: 'docs' },
      { name: 'guides', path: 'docs/guides' },
    ])
  })
})

describe('outlineFromMarkdown', () => {
  it('collects headings in document order with matching slugs', () => {
    expect(
      outlineFromMarkdown('# Title\n\ntext\n\n## First\n\n### Deep\n'),
    ).toEqual([
      { id: 'title', text: 'Title', level: 1, index: 0 },
      { id: 'first', text: 'First', level: 2, index: 1 },
      { id: 'deep', text: 'Deep', level: 3, index: 2 },
    ])
  })

  it('ignores headings inside fenced code blocks', () => {
    const content = [
      '# Real',
      '',
      '```bash',
      '# not a heading',
      '```',
      '',
      '~~~',
      '## also not a heading',
      '~~~',
      '',
      '## Also real',
    ].join('\n')
    expect(outlineFromMarkdown(content).map((h) => h.text)).toEqual([
      'Real',
      'Also real',
    ])
  })

  it('handles closing hashes and ignores non-headings', () => {
    expect(outlineFromMarkdown('## Setup ##\n').map((h) => h.text)).toEqual([
      'Setup',
    ])
    expect(outlineFromMarkdown('#NoSpace\n####### TooDeep\n')).toEqual([])
    expect(outlineFromMarkdown('')).toEqual([])
  })
})

describe('navigation history', () => {
  const file = (path: string): NavigationEntry => ({ path, kind: 'file' })

  it('pushes entries and truncates forward history', () => {
    let state = pushNavigation([], -1, file('a.md'))
    state = pushNavigation(state.history, state.index, file('b.md'))
    state = pushNavigation(state.history, state.index, file('c.md'))
    expect(state.index).toBe(2)

    // Going back then opening something new discards the forward entries.
    const branched = pushNavigation(state.history, 0, file('d.md'))
    expect(branched.history.map((entry) => entry.path)).toEqual([
      'a.md',
      'd.md',
    ])
    expect(branched.index).toBe(1)
  })

  it('collapses a repeat of the current entry', () => {
    const first = pushNavigation([], -1, file('a.md'))
    const again = pushNavigation(first.history, first.index, file('a.md'))
    expect(again.history).toHaveLength(1)
    expect(again.index).toBe(0)
  })

  it('remembers the scroll offset of the current entry', () => {
    const state = pushNavigation([], -1, file('a.md'))
    const remembered = rememberScroll(state.history, state.index, 420)
    expect(remembered[0].scrollTop).toBe(420)

    // The original array is not mutated.
    expect(state.history[0].scrollTop).toBeUndefined()
  })

  it('ignores an out-of-range index', () => {
    const history = [file('a.md')]
    expect(rememberScroll(history, -1, 10)).toBe(history)
    expect(rememberScroll(history, 5, 10)).toBe(history)
  })
})

describe('inlineText', () => {
  it('reduces inline markdown to its rendered text', () => {
    expect(inlineText('[Install](https://example.com/setup)')).toBe('Install')
    expect(inlineText('Use `pnpm check` first')).toBe('Use pnpm check first')
    expect(inlineText('**Bold** and _soft_ and ~~gone~~')).toBe(
      'Bold and soft and gone',
    )
    expect(inlineText('![shot](a.png) after')).toBe('shot after')
  })
})

describe('outlineFromMarkdown edge cases', () => {
  it('matches the text a link heading actually renders', () => {
    const [heading] = outlineFromMarkdown('## [Install](https://x.test/a)\n')
    expect(heading).toMatchObject({ text: 'Install', id: 'install' })
  })

  it('keeps repeated headings addressable by position', () => {
    const outline = outlineFromMarkdown('## Setup\n\n## Setup\n')
    expect(outline.map((entry) => entry.index)).toEqual([0, 1])
  })

  it('does not close a longer fence with a shorter one', () => {
    const content = [
      '````',
      '```',
      '# inside the example',
      '```',
      '````',
      '',
      '# Real',
    ].join('\n')
    expect(outlineFromMarkdown(content).map((h) => h.text)).toEqual(['Real'])
  })

  it('ignores a fence close that has trailing content', () => {
    const content = ['```', '# hidden', '``` still code', '# also hidden'].join(
      '\n',
    )
    expect(outlineFromMarkdown(content)).toEqual([])
  })

  // The outline is matched to the document by position among the rendered
  // headings, so an underlined heading that is rendered but not collected
  // shifts every entry after it onto the heading before the one it names.
  it('counts headings that are underlined rather than hashed', () => {
    const content = [
      'Overview',
      '========',
      '',
      'Some prose.',
      '',
      'Details',
      '-------',
      '',
      '### Deeper',
    ].join('\n')

    expect(
      outlineFromMarkdown(content).map(({ text, level, index }) => ({
        text,
        level,
        index,
      })),
    ).toEqual([
      { text: 'Overview', level: 1, index: 0 },
      { text: 'Details', level: 2, index: 1 },
      { text: 'Deeper', level: 3, index: 2 },
    ])
  })

  it('does not read a rule or a list dash as an underline', () => {
    const content = [
      'Intro paragraph.',
      '',
      '---',
      '',
      '- item',
      '- other',
      '',
      '# Real',
    ].join('\n')

    expect(outlineFromMarkdown(content).map((entry) => entry.text)).toEqual([
      'Real',
    ])
  })

  it('keeps counting a heading that has nothing to show', () => {
    // `#` on its own is still drawn, so an entry after it is one heading
    // further down the document than its position in this list.
    const content = ['#', '', '# Real', '', '## Later'].join('\n')

    expect(
      outlineFromMarkdown(content).map(({ text, index }) => ({ text, index })),
    ).toEqual([
      { text: 'Real', index: 1 },
      { text: 'Later', index: 2 },
    ])
  })

  it('uses reference-style image alt text in heading outlines', () => {
    expect(outlineFromMarkdown(
      '# ![Architecture][diagram]\n\n## Later\n\n[diagram]: diagram.png\n',
    )).toEqual([
      { id: 'architecture', text: 'Architecture', level: 1, index: 0 },
      { id: 'later', text: 'Later', level: 2, index: 1 },
    ])
  })

  it('does not read a rule under a link definition as a heading', () => {
    // A link reference definition is not a paragraph, so the renderer draws a
    // rule here rather than a heading. Reading it as one shifted every later
    // outline entry by a heading.
    const content = ['[ref]: /url', '---', '', '# Real'].join('\n')

    expect(outlineFromMarkdown(content).map((entry) => entry.text)).toEqual([
      'Real',
    ])
  })

  it('reads front matter the way the renderer draws it', () => {
    // remark is used without a front-matter plugin, so this is a rule, a
    // paragraph, and the underline that turns it into a heading. Skipping it
    // here would put every later entry one heading out.
    const content = ['---', 'title: Notes', '---', '', '# Real'].join('\n')

    expect(
      outlineFromMarkdown(content).map(({ text, level }) => ({ text, level })),
    ).toEqual([
      { text: 'title: Notes', level: 2 },
      { text: 'Real', level: 1 },
    ])
  })

  it('does not read an underline inside a fence as a heading', () => {
    const content = ['```', 'Fake', '====', '```', '', '# Real'].join('\n')

    expect(outlineFromMarkdown(content).map((entry) => entry.text)).toEqual([
      'Real',
    ])
  })
})

describe('resolveDocumentPath', () => {
  it('resolves a sibling image against its document', () => {
    expect(resolveDocumentPath('docs/guide.md', './diagram.svg')).toBe(
      'docs/diagram.svg',
    )
    expect(resolveDocumentPath('docs/guide.md', 'img/shot.png')).toBe(
      'docs/img/shot.png',
    )
    expect(resolveDocumentPath('guide.md', 'shot.png')).toBe('shot.png')
  })

  it('walks up without leaving the root', () => {
    expect(resolveDocumentPath('docs/guides/setup.md', '../diagram.svg')).toBe(
      'docs/diagram.svg',
    )
    expect(
      resolveDocumentPath('docs/guides/setup.md', '../../top.png'),
    ).toBe('top.png')
    // One level further would escape the root.
    expect(
      resolveDocumentPath('docs/guides/setup.md', '../../../escape.png'),
    ).toBeUndefined()
    expect(resolveDocumentPath('guide.md', '../escape.png')).toBeUndefined()
  })

  it('refuses absolute paths and bare fragments', () => {
    expect(resolveDocumentPath('docs/guide.md', '/etc/passwd')).toBeUndefined()
    expect(resolveDocumentPath('docs/guide.md', '#section')).toBeUndefined()
    expect(resolveDocumentPath('docs/guide.md', '   ')).toBeUndefined()
  })

  it('drops a query or fragment and decodes escapes', () => {
    expect(resolveDocumentPath('docs/guide.md', 'shot.png?v=2')).toBe(
      'docs/shot.png',
    )
    expect(resolveDocumentPath('docs/guide.md', 'my%20shot.png')).toBe(
      'docs/my shot.png',
    )
  })
})

describe('isExternalSource', () => {
  it('recognises sources the browser should load itself', () => {
    expect(isExternalSource('https://example.com/a.png')).toBe(true)
    expect(isExternalSource('http://example.com/a.png')).toBe(true)
    expect(isExternalSource('data:image/png;base64,AAA')).toBe(true)
    expect(isExternalSource('//example.com/a.png')).toBe(true)
    expect(isExternalSource('./local.png')).toBe(false)
    expect(isExternalSource('img/local.png')).toBe(false)
  })
})
