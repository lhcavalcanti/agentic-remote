// The parts of a link or an image after its text: an address, which may hold
// one level of parentheses, and an optional quoted title.
const target = String.raw`\((?:[^()\s]|\([^()\s]*\))*(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)`

/** HTML that reads as its own line, so its words stay apart from their neighbours'. */
const blockTags =
  'address|article|aside|blockquote|br|dd|details|div|dl|dt|figcaption|figure|footer|h[1-6]|header|hr|' +
  'li|main|nav|ol|p|pre|section|summary|table|tbody|td|tfoot|th|thead|tr|ul'
const inlineTags =
  'a|abbr|audio|b|cite|code|del|em|font|i|iframe|img|ins|kbd|mark|picture|q|s|samp|script|small|source|' +
  'span|strike|strong|style|sub|sup|svg|tt|u|var|video'
const tag = (names: string) =>
  new RegExp(String.raw`<\/?(?:${names})(?=[\s/>])(?:[^<>"']|"[^"]*"|'[^']*')*>`, 'gi')

/**
 * Markdown as plain text, for a glance at what a closed session was about.
 *
 * Emphasis, code, link, heading, list and quote syntax goes and its words
 * stay; a code block keeps its code. Images, HTML tags and comments go, while
 * angle brackets that are no HTML tag, such as `Promise<void>`, stay as typed.
 * Every run of white space becomes one space, as it already is in a closed
 * session's excerpts, so a heading marker within a line still goes. An excerpt
 * cut short (it ends in "…") also loses the markers whose pair the cut took,
 * and still ends in "…".
 */
export function markdownPlainText(markdown: string): string {
  // Text the rules below must not touch, such as code, is set aside here and
  // put back at the end.
  const kept: string[] = []
  const keep = (text: string) => `\uE000${kept.push(text) - 1}\uE000`
  const restore = (text: string): string =>
    text.replace(/\uE000(\d+)\uE000/g, (_match, index: string) => restore(kept[Number(index)] ?? ''))
  const cut = markdown.trimEnd().endsWith('…')

  let text = markdown
    .replace(/\uE000/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\\`/g, () => keep('`'))
    // A fence's language is the word against its opening backticks.
    .replace(/(`{3,}|~{3,})(?:[^\s`~]+(?=\s))?([\s\S]*?)(?:\1(?![`~])|$)/g,
      (_match, _fence, code: string) => keep(code.trim()))
    .replace(/(^|[^`])(`{1,2})(?!`)([\s\S]*?[^`])\2(?!`)/g,
      (_match, before: string, _ticks, code: string) => before + keep(code.trim()))
    .replace(/\\([!-/:-@[-`{-~])/g, (_match, character: string) => keep(character))
    .replace(/<!--[\s\S]*?(?:-->|$)/g, '')
    .replace(new RegExp(String.raw`!\[[^\]]*\]${target}`, 'g'), '')
    .replace(new RegExp(String.raw`\[([^\]]*)\]${target}`, 'g'), '$1')
  if (cut) {
    text = text
      .replace(/(!?)\[([^\]]*)\]\([^)]*$/, (_match, image: string, words: string) => (image ? '' : words))
      .replace(/(^|[^\p{L}\p{N}])(!?)\[([^\]]*)$/u,
        (_match, before: string, image: string, words: string) => before + (image ? '' : words))
  }
  text = text
    .replace(/<([a-z][a-z\d+.-]{1,31}:[^\s<>]*|[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)>/gi,
      (_match, address: string) => keep(address))
    .replace(/\bhttps?:\/\/[^\s<>]*[^\s<>.,;:!?'")\]}*_~]/g, (address) => keep(address))
    .replace(tag(blockTags), ' ')
    .replace(tag(inlineTags), '')
    // Markers that start a line: headings, setext underlines, thematic
    // breaks, quotes, and list items with their task boxes.
    .replace(/^[ \t]{0,3}#{1,6}(?=[ \t]|$)[ \t]*(.*?)(?:[ \t]+#+)?[ \t]*$/gm, '$1')
    .replace(/^[ \t]{0,3}=+[ \t]*$/gm, '')
    .replace(/^[ \t]{0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/gm, '')
    .replace(/^[ \t]{0,3}(?:>(?:[ \t]+|$))+/gm, '')
    .replace(/^[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]+(?:\[[ xX]\][ \t]+)?/gm, '')
    // The same within a line, where an excerpt's collapsed white space put
    // them, for the two that never read as prose.
    .replace(/(^|\s)#{1,6}(?=\s)/g, '$1')
    .replace(/(^|\s)([-*_])\2{2,}(?=\s|$)/g, '$1')
    .replace(/\*\*(?=[^\s*])([\s\S]*?[^\s*])\*\*/g, '$1')
    .replace(/(^|[^\p{L}\p{N}_])__(?=[^\s_])([\s\S]*?[^\s_])__(?![\p{L}\p{N}_])/gu, '$1$2')
    .replace(/\*(?=[^\s*])([\s\S]*?[^\s*])\*/g, '$1')
    .replace(/(^|[^\p{L}\p{N}_])_(?=[^\s_])([\s\S]*?[^\s_])_(?![\p{L}\p{N}_])/gu, '$1$2')
    .replace(/~~(?=[^\s~])([\s\S]*?[^\s~])~~/g, '$1')
  if (cut) text = text.replace(/(?:\*\*|__|~~|`)(?=\S)/g, '')

  text = restore(text).replace(/\s+/g, ' ').trim()
  return cut && text && !text.endsWith('…') ? `${text}…` : text
}
