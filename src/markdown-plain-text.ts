// The rest of a link or an image after its text: an address, bare with up to
// one level of parentheses or in angle brackets, and an optional title.
const target = String.raw`\((?:<[^<>\n]*>|(?:[^()\s]|\([^()\s]*\))*)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)`
// The text of a link or an image, which may hold one level of brackets.
const words = String.raw`\[((?:[^[\]]|\[[^[\]]*\])*)\]`

/**
 * The HTML elements, named in lower case as HTML in Markdown is written; any
 * other name in angle brackets, such as `Promise<Option>`, is kept as typed.
 */
const elements = new Set((
  'a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption center ' +
  'cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure ' +
  'font footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link ' +
  'main map mark marquee menu meta meter nav nobr noscript object ol optgroup option output p param picture pre ' +
  'progress q rp rt ruby s samp script search section select slot small source span strike strong style sub ' +
  'summary sup svg table tbody td template textarea tfoot th thead time title tr track tt u ul var video wbr'
).split(' '))
/** Elements within a line of text, whose removal leaves their words joined. */
const inlineElements = new Set((
  'a abbr b bdi bdo big cite code data del dfn em font i img input ins kbd label mark nobr picture q rp rt ruby ' +
  's samp small source span strike strong sub sup svg time tt u var wbr'
).split(' '))
/** The named character references prose uses; any other name is kept as typed. */
const namedCharacters = new Map(Object.entries({
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', copy: '©', reg: '®', trade: '™', deg: '°',
  times: '×', middot: '·', bull: '•', hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“',
  rdquo: '”', laquo: '«', raquo: '»', larr: '←', rarr: '→', harr: '↔',
}))

/**
 * Markdown as plain text, for a glance at what a closed session was about.
 *
 * Emphasis, code, link, heading, list, quote, table and footnote syntax goes
 * and its words stay; a code block keeps its code, and a character reference
 * outside code becomes its character. Images, link definitions, HTML tags and
 * comments go. Every run of white space becomes one space, as it already is
 * in a closed session's excerpts, so markers that started a line in the
 * message are recognised within one too. An excerpt cut short (it ends in
 * "…") also loses the markers whose pair the cut took, and still ends in "…".
 */
export function markdownPlainText(markdown: string): string {
  // Text the rules below must not touch, such as code, is set aside here and
  // put back at the end.
  const kept: string[] = []
  const keep = (text: string) => `\uE000${kept.push(text) - 1}\uE000`
  const restore = (text: string): string =>
    text.replace(/\uE000(\d+)\uE000/g, (_match, index: string) => restore(kept[Number(index)] ?? ''))
  const cut = markdown.trimEnd().endsWith('…')
  const defined = new Set<string>()

  let text = markdown
    .replace(/\uE000/g, '')
    .replace(/\r\n?/g, '\n')
    // A backslash ending a line breaks it.
    .replace(/\\\n/g, '\n')
    .replace(/\\`/g, () => keep('`'))
    // A fence's language is the word against its opening backticks.
    .replace(/(`{3,}|~{3,})(?:[^\s`~]+(?=\s))?([\s\S]*?)(?:\1(?![`~])|$)/g,
      (_match, _fence, code: string) => keep(code.trim()))
    .replace(/(^|[^`])(`{1,2})(?!`)([\s\S]*?[^`])\2(?!`)/g,
      (_match, before: string, _ticks, code: string) => before + keep(code.trim()))
    .replace(/\\([!-/:-@[-`{-~])/g, (_match, character: string) => keep(character))
    .replace(/<!--[\s\S]*?(?:-->|$)/g, '')
  // A footnote definition loses its marker; a reference goes when it is
  // numbered or defined, so a class such as [^a-z] stays.
  const footnotes = new Set([...text.matchAll(/\[\^([^\]\s]+)\]:/g)].map((match) => match[1]!.toLowerCase()))
  text = text
    .replace(/\[\^([^\]\s]+)\](:?)/g, (match, label: string, colon: string) =>
      colon || /^\d+$/.test(label) || footnotes.has(label.toLowerCase()) ? '' : match)
    .replace(new RegExp(String.raw`!${words}(?:${target}|\[[^\]]*\])`, 'g'), '')
    .replace(new RegExp(words + target, 'g'), '$1')
  const referenced = new Set([...text.matchAll(/\[([^[\]]*)\](?:\[([^[\]]*)\])?(?![:(])/g)]
    .map((match) => (match[2] || match[1] || '').toLowerCase()))
  text = text
    .replace(/(^|\s)\[([^\]]+)\]:[ \t]*(<[^<>\n]*>|[^\s<>]+)(?:[ \t]+(?:"[^"]*"|'[^']*'|\([^)]*\)))?/g,
      (match, before: string, label: string, address: string, offset: number, whole: string) => {
        // A label in prose, such as "[Update]: the build", is no definition:
        // a definition's address looks like one, ends its line, comes before
        // another definition, or is one a reference uses.
        const rest = whole.slice(offset + match.length)
        const key = label.toLowerCase()
        if (!/^<|[/.#:]/.test(address) && !/^[ \t]*(?:\n|$)/.test(rest) && !/^\s+\[[^\]]+\]:/.test(rest) &&
          !referenced.has(key)) return match
        defined.add(key)
        return before
      })
    // A reference starts a word, unlike an index such as `matrix[i][j]`.
    .replace(new RegExp(String.raw`(^|[^\p{L}\p{N}\]])${words}\[[^\]]*\]`, 'gu'), '$1$2')
    .replace(/\[([^[\]]+)\](?![([:])/g, (match, label: string) => (defined.has(label.toLowerCase()) ? label : match))
  if (cut) {
    text = text
      .replace(new RegExp(String.raw`(!?)${words}\([^)]*$`), (_match, image: string, label: string) => (image ? '' : label))
      .replace(/(^|[^\p{L}\p{N}])(!?)\[([^\]]*)$/u,
        (_match, before: string, image: string, label: string) => before + (image ? '' : label))
      .replace(/<\/?[a-zA-Z][^<>]*$/, '')
  }
  text = text
    .replace(/<([a-z][a-z\d+.-]{1,31}:[^\s<>]*|[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)>/gi,
      (_match, address: string) => keep(address))
    .replace(/\bhttps?:\/\/[^\s<>]*[^\s<>.,;:!?'")\]}*_~]/g, (address) => keep(address))
    .replace(/<\/?([a-zA-Z][a-zA-Z\d]*(-[a-z\d-]*)?)(?=[\s/>])(?:[^<>"']|"[^"]*"|'[^']*')*>/g,
      (tag, name: string, custom: string | undefined, _offset: number, whole: string) => {
        // HTML is written in lower case or in capitals; a name in mixed case,
        // such as <Option>, is a type or a component, and a lone capital is
        // one too, as in Store<S>, unless the text also closes it.
        const lower = name.toLowerCase()
        if (name !== lower && (name !== name.toUpperCase() || (name.length === 1 && !whole.includes(`</${name}>`)))) {
          return tag
        }
        if (custom ? name !== lower : !elements.has(lower)) return tag
        return inlineElements.has(lower) ? '' : ' '
      })
  // A table is known by its delimiter row; without one, a pipe is a pipe.
  const delimiterRow = /(^|\s)\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)+\|?(?=\s|$)/g
  if (delimiterRow.test(text)) text = text.replace(delimiterRow, '$1').replace(/\|/g, ' ')
  text = text
    // Markers that start a line: headings, setext underlines, thematic
    // breaks and quotes.
    .replace(/^[ \t]{0,3}#{1,6}(?=[ \t]|$)[ \t]*(.*?)(?:[ \t]+#+)?[ \t]*$/gm, '$1')
    .replace(/^[ \t]{0,3}=+[ \t]*$/gm, '')
    .replace(/^[ \t]{0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/gm, '')
    .replace(/^[ \t]{0,3}(?:>(?:[ \t]+|$))+/gm, '')
    // Headings and breaks within a line, where an excerpt's collapsed white
    // space put them. A lone # heads only after the end of a sentence or
    // clause, so "press # to dial" stays; a run of four equals signs is an
    // underline, unlike ===.
    .replace(/(^|\s)#{2,6}(?=\s)/g, '$1')
    .replace(/(^|[.!?:;)]\s+)#(?=\s)/g, '$1')
    .replace(/(^|\s)(?:([-*_])\2{2,}|={4,})(?=\s|$)/g, '$1')
    .replace(/\*\*(?=[^\s*])([\s\S]*?[^\s*])\*\*/g, '$1')
    .replace(/(^|[^\p{L}\p{N}_])__(?=[^\s_])([\s\S]*?[^\s_])__(?![\p{L}\p{N}_])/gu, '$1$2')
    .replace(/\*(?=[^\s*])([\s\S]*?[^\s*])\*/g, '$1')
    .replace(/(^|[^\p{L}\p{N}_])_(?=[^\s_])([\s\S]*?[^\s_])_(?![\p{L}\p{N}_])/gu, '$1$2')
    .replace(/~~(?=[^\s~])([\s\S]*?[^\s~])~~/g, '$1')
  // A spaced dash, asterisk or plus is a bullet, with its task box, where a
  // line starts or after the end of a sentence or clause; a dash or an
  // asterisk is one too where it comes again, as a list's items do. One
  // between numbers, as in "5 - 3", is arithmetic, and a lone one in prose,
  // as in "prices marked * are estimates" or "React + Vite", stays.
  const bullet = /(^|\s)([-*+])(?:[ \t]+\[[ xX]\])?(?=\s)/g
  const arithmetic = (lead: string, rest: string) => /\d\s*$/.test(lead) && /^\s*\d/.test(rest)
  const repeated = new Map<string, number>()
  for (const match of text.matchAll(bullet)) {
    const lead = text.slice(0, match.index + match[1]!.length)
    if (!arithmetic(lead, text.slice(match.index + match[0].length))) {
      repeated.set(match[2]!, (repeated.get(match[2]!) ?? 0) + 1)
    }
  }
  text = text.replace(bullet, (match, before: string, marker: string, offset: number, whole: string) => {
    const lead = whole.slice(0, offset + before.length)
    if (arithmetic(lead, whole.slice(offset + match.length))) return match
    const listed = /(?:^|\n)[ \t]*$/.test(lead) || /[.!?:;)]\s*$/.test(lead) ||
      (marker !== '+' && (repeated.get(marker) ?? 0) > 1)
    return listed ? before : match
  })
  // A numbered item starts a line or follows the end of a sentence or
  // clause, and the items after it count up from there, which tells them
  // from a number ending a sentence, as in "Python 3. Then".
  let next = 0
  text = text.replace(/(^|\s)(\d{1,9})[.)](?:[ \t]+\[[ xX]\])?(?=\s)/g,
    (match, before: string, digits: string, offset: number, whole: string) => {
      const lead = whole.slice(0, offset + before.length)
      const number = Number(digits)
      if (number !== next && !/(?:^|\n)[ \t]*$/.test(lead) && !/[.!?:;)]\s*$/.test(lead)) return match
      next = number + 1
      return before
    })
  if (cut) {
    text = text
      .replace(/(?:\*\*|~~|`)(?=\S)/g, '')
      .replace(/(^|[^\p{L}\p{N}_])__?(?=[^\s_])/gu, '$1')
      .replace(/(^|[^\p{L}\p{N}*])\*(?=[^\s*])/gu, '$1')
  }
  text = text.replace(/&(?:#(\d{1,7})|#[xX]([\da-fA-F]{1,6})|([a-zA-Z]{2,8}));/g,
    (match, decimal?: string, hex?: string, name?: string) => {
      if (name) return namedCharacters.get(name) ?? match
      const point = decimal ? Number(decimal) : Number.parseInt(hex ?? '', 16)
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : '\ufffd'
    })

  text = restore(text).replace(/\s+/g, ' ').trim()
  return cut && text && !text.endsWith('…') ? `${text}…` : text
}
