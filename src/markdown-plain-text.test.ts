import { describe, expect, it } from 'vitest'
import { markdownPlainText } from './markdown-plain-text'

describe('markdownPlainText', () => {
  it.each([
    ['bold with asterisks', 'went from **1,024 to 1,224 GiB** of disk', 'went from 1,024 to 1,224 GiB of disk'],
    ['bold with underscores', '__Done__ for now', 'Done for now'],
    ['italic with an asterisk', 'an *italic* word', 'an italic word'],
    ['italic with an underscore', 'an _italic_ word', 'an italic word'],
    ['bold italic', '***both*** at once', 'both at once'],
    ['italic inside bold', '**bold with *italic* inside**', 'bold with italic inside'],
    ['strikethrough', '~~gone~~ kept', 'gone kept'],
    ['bold touching punctuation', 'exactly **+200 GiB**, and more', 'exactly +200 GiB, and more'],
  ])('drops %s markers and keeps their words', (_case, markdown, text) => {
    expect(markdownPlainText(markdown)).toBe(text)
  })

  it.each([
    ['underscores inside a word', 'set my_var_name and other_name', 'set my_var_name and other_name'],
    ['spaced multiplication', 'about 2 * 3 * 4 runs', 'about 2 * 3 * 4 runs'],
    ['an asterisk against a word', 'prices marked* are estimates', 'prices marked* are estimates'],
    ['a spaced double asterisk', 'a ** b', 'a ** b'],
    ['an unpaired marker the excerpt did not cut', 'pass **kwargs through', 'pass **kwargs through'],
    ['a folder under the home directory', 'look in ~/src/app and ~/docs', 'look in ~/src/app and ~/docs'],
  ])('keeps %s as typed', (_case, markdown, text) => {
    expect(markdownPlainText(markdown)).toBe(text)
  })

  it.each([
    ['an inline span', 'Run `pnpm test` now', 'Run pnpm test now'],
    ['a span holding a backtick', 'type ``a ` b`` here', 'type a ` b here'],
    ['Markdown inside a span', 'use `**kwargs`, `snake_case` and `<div>`', 'use **kwargs, snake_case and <div>'],
    ['a fenced block with a language', 'Before\n```ts\nconst x = 1\n```\nAfter', 'Before const x = 1 After'],
    ['a fence collapsed onto one line', 'Before ```ts const x = 1 ``` After', 'Before const x = 1 After'],
    ['a fence without a language', '``` npm i ```', 'npm i'],
    ['a tilde fence', '~~~\nls -la\n~~~', 'ls -la'],
    ['Markdown inside a fence', '```md\n# Title\n- **bold**\n```', '# Title - **bold**'],
    ['a fence the excerpt cut', 'Run ```bash npm install --save-d…', 'Run npm install --save-d…'],
    ['a span the excerpt cut', 'then run `zpool sta…', 'then run zpool sta…'],
  ])('keeps the code text of %s without its backticks', (_case, markdown, text) => {
    expect(markdownPlainText(markdown)).toBe(text)
  })

  it('keeps a backtick that opens no code', () => {
    expect(markdownPlainText('what does ` mean here')).toBe('what does ` mean here')
  })

  it.each([
    ['an inline link', 'see [the docs](https://example.com/docs) first', 'see the docs first'],
    ['a link with a title', 'see [the docs](https://example.com "Docs") first', 'see the docs first'],
    ['a link whose address has parentheses', 'read [Foo](https://en.wikipedia.org/wiki/Foo_(bar)) now', 'read Foo now'],
    ['emphasis and code inside a link', 'open [**the** `guide`](https://example.com)', 'open the guide'],
    ['an autolink', 'at <https://example.com/a_b_c>', 'at https://example.com/a_b_c'],
    ['an email autolink', 'mail <someone@example.com>', 'mail someone@example.com'],
    ['a link to an address in angle brackets', 'open [the notes](<my notes.md>) now', 'open the notes now'],
    ['a link whose text has brackets', 'see [the [draft] notes](https://example.com) now', 'see the [draft] notes now'],
    ['a reference link', 'see [the docs][docs] first', 'see the docs first'],
    ['a collapsed reference link', 'see [the docs][] first', 'see the docs first'],
    ['a shortcut reference and its definition', 'see [docs] first. [docs]: https://example.com/docs', 'see docs first.'],
    ['link definitions', 'Done. [1]: https://example.com/a "A" [2]: ./b.md', 'Done.'],
    ['a link the excerpt cut in its address', 'see [the docs](https://exa…', 'see the docs…'],
    ['a link the excerpt cut in its text', 'see [the do…', 'see the do…'],
  ])('keeps the words of %s', (_case, markdown, text) => {
    expect(markdownPlainText(markdown)).toBe(text)
  })

  it.each([
    ['a bare address with underscores', 'https://example.com/_draft_/a_b', 'https://example.com/_draft_/a_b'],
    ['brackets that are not a link', 'array[0], matrix[i][j] and [note] stay', 'array[0], matrix[i][j] and [note] stay'],
    ['a label that defines no link', '[Update]: the build passed', '[Update]: the build passed'],
  ])('keeps %s as typed', (_case, markdown, text) => {
    expect(markdownPlainText(markdown)).toBe(text)
  })

  it.each([
    ['an image', '![diagram](https://example.com/d.png) Done', 'Done'],
    ['a linked badge', 'Build [![passing](https://ci/badge.svg)](https://ci) ok', 'Build ok'],
    ['a reference image', 'Before ![shot][s] after', 'Before after'],
    ['an image the excerpt cut', 'Before ![shot](https://exa…', 'Before…'],
  ])('removes %s', (_case, markdown, text) => {
    expect(markdownPlainText(markdown)).toBe(text)
  })

  it.each([
    ['an ATX heading', '## Summary', 'Summary'],
    ['a heading with closing hashes', '# Title #', 'Title'],
    ['a heading over a paragraph', '## Summary\nAll good', 'Summary All good'],
    ['a heading collapsed into the middle of a line', 'Done. ## Next steps Run the tests', 'Done. Next steps Run the tests'],
    ['a setext underline', 'Title\n=====\nBody', 'Title Body'],
  ])('drops the markers of %s', (_case, markdown, text) => {
    expect(markdownPlainText(markdown)).toBe(text)
  })

  it('keeps hashes that start no heading', () => {
    expect(markdownPlainText('PR #677 in C# and ####### seven')).toBe('PR #677 in C# and ####### seven')
  })

  it.each([
    ['dash bullets', '- First\n- Second', 'First Second'],
    ['asterisk and plus bullets', '* First\n+ Second', 'First Second'],
    ['numbered items', '1. One\n2) Two', 'One Two'],
    ['task items', '- [x] Done\n- [ ] Todo', 'Done Todo'],
    ['nested quotes', '> Quoted\n> > nested', 'Quoted nested'],
    ['a list inside a quote', '> - quoted item', 'quoted item'],
    ['bullets collapsed into a line', 'Changes: - Fixed the header - Added tests', 'Changes: Fixed the header Added tests'],
    ['asterisk bullets collapsed into a line', 'Notes: * one * two', 'Notes: one two'],
    ['task items collapsed into a line', '- [x] Done - [ ] Todo', 'Done Todo'],
    ['numbered items collapsed into a line', 'Three changes: 1. Spot questions. 2. Group computers. 3) Keep your place.', 'Three changes: Spot questions. Group computers. Keep your place.'],
    ['numbered items after a bold label', '**Steps:** 1. Install 2. Run', 'Steps: Install Run'],
    ['plus bullets collapsed into a line', 'Changes: + Added a test. + Fixed the header', 'Changes: Added a test. Fixed the header'],
    ['a thematic break', 'Above\n---\nBelow', 'Above Below'],
    ['a thematic break collapsed onto one line', 'Above *** Below', 'Above Below'],
    ['a setext underline collapsed into a line', 'Title ===== Body', 'Title Body'],
    ['a table', '| File | Change |\n| --- | :---: |\n| a.ts | added |', 'File Change a.ts added'],
    ['a table collapsed onto one line', 'Results: | File | Change | |---|---| | a.ts | added | Done.', 'Results: File Change a.ts added Done.'],
    ['a footnote', 'It grew[^1]. [^1]: Measured with df.', 'It grew. Measured with df.'],
  ])('drops the markers of %s', (_case, markdown, text) => {
    expect(markdownPlainText(markdown)).toBe(text)
  })

  it('keeps dashes, numbers, pipes and angle brackets that start no list, quote or table', () => {
    expect(markdownPlainText('-1 is fine, --flag too, 3.5 stays')).toBe('-1 is fine, --flag too, 3.5 stays')
    expect(markdownPlainText('>= 5 items when x > 5')).toBe('>= 5 items when x > 5')
    expect(markdownPlainText('Python 3. Then React + Vite, 2 + 2, 5 - 3 and yes | no'))
      .toBe('Python 3. Then React + Vite, 2 + 2, 5 - 3 and yes | no')
    expect(markdownPlainText('use === not == here')).toBe('use === not == here')
  })

  it.each([
    ['inline tags', '<b>bold</b>, <kbd>Ctrl</kbd>+<kbd>C</kbd>', 'bold, Ctrl+C'],
    ['line breaks', 'one<br>two<br/>three', 'one two three'],
    ['block tags', '<details><summary>More</summary><p>Hidden</p></details>', 'More Hidden'],
    ['a tag with quoted attributes', '<a href="https://example.com" title="a > b">link</a> text', 'link text'],
    ['an image tag', '<img src="x.png" alt="x"> after', 'after'],
    ['a script tag', '<script>alert(1)</script>', 'alert(1)'],
    ['a comment', '<!-- supervisor:review:1:abc --> visible', 'visible'],
    ['form controls', '<form><label>Name <input type="text" name="n"></label><button>Save</button></form>', 'Name Save'],
    ['a table and a video', '<table><tr><td>a</td><td>b</td></tr></table><video src="v.mp4"></video>', 'a b'],
    ['a custom element', '<my-widget size="2">Hi</my-widget>', 'Hi'],
  ])('removes the markup of %s', (_case, markdown, text) => {
    expect(markdownPlainText(markdown)).toBe(text)
  })

  it('keeps angle brackets that are no HTML tag, such as generics, components and comparisons', () => {
    expect(markdownPlainText('Promise<void> and Map<K, V> when a < b > c'))
      .toBe('Promise<void> and Map<K, V> when a < b > c')
    expect(markdownPlainText('List<Option> renders <Button>')).toBe('List<Option> renders <Button>')
  })

  it('reads character references as the characters they name, outside code only', () => {
    expect(markdownPlainText('Tom &amp; Jerry &lt;3 &#169; &#x2014; &nbsp;ok')).toBe('Tom & Jerry <3 © — ok')
    expect(markdownPlainText('Wait&hellip; 5 &times; 3 &rarr; 15, while &unknown; and &toString; stay'))
      .toBe('Wait… 5 × 3 → 15, while &unknown; and &toString; stay')
    expect(markdownPlainText('&lt;b&gt;shown&lt;/b&gt; and `&amp;`')).toBe('<b>shown</b> and &amp;')
  })

  it.each([
    ['escaped markers', '\\*not italic\\* and \\_x\\_', '*not italic* and _x_'],
    ['an escaped hash', '\\# not a heading', '# not a heading'],
    ['escaped backticks', '\\`not code\\`', '`not code`'],
    ['backslashes in a path', 'C:\\Users\\me', 'C:\\Users\\me'],
    ['a backslash that breaks a line', 'one\\\ntwo', 'one two'],
  ])('reads %s literally', (_case, markdown, text) => {
    expect(markdownPlainText(markdown)).toBe(text)
  })

  it('reads one line of text, with every run of white space a single space', () => {
    expect(markdownPlainText('')).toBe('')
    expect(markdownPlainText('  The notes\r\nare   ready.  ')).toBe('The notes are ready.')
  })

  it('turns a reply that was cut short into plain text that still says so', () => {
    expect(markdownPlainText('**Result:** the volume grew from **1,024 to 1,2…'))
      .toBe('Result: the volume grew from 1,024 to 1,2…')
    expect(markdownPlainText('this is *important and _the full lo…')).toBe('this is important and the full lo…')
    expect(markdownPlainText('rename my_var to snake_ca…')).toBe('rename my_var to snake_ca…')
    expect(markdownPlainText('Done <deta…')).toBe('Done…')
    expect(markdownPlainText('<!-- marker that the excerpt cu…')).toBe('')
  })

  it('reads a reply like the ones agents write', () => {
    expect(markdownPlainText(
      'Yes—the resize worked. I verified that `Ubuntu-26.04` went from **1,024 to 1,224 GiB** of ' +
      'virtual disk capacity, exactly **+200 GiB**, and that the Linux filesystem grew too. ' +
      '## Next - Run `df -h` - See [the guide](https://example.com/guide).',
    )).toBe(
      'Yes—the resize worked. I verified that Ubuntu-26.04 went from 1,024 to 1,224 GiB of ' +
      'virtual disk capacity, exactly +200 GiB, and that the Linux filesystem grew too. ' +
      'Next Run df -h See the guide.',
    )
  })
})
