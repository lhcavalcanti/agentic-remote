type Token = { start: number; end: number; text: string; quoted?: boolean }

function document(raw: string) {
  const tokens: Token[] = []
  const comments: Array<{ start: number; end: number }> = []
  const masked = raw.split('')
  for (let index = 0; index < raw.length;) {
    const start = index
    const character = raw[index]
    if (/\s/.test(character)) { index++; continue }
    if (character === '/' && (raw[index + 1] === '/' || raw[index + 1] === '*')) {
      if (raw[index + 1] === '/') {
        while (index < raw.length && !/[\r\n]/.test(raw[index])) index++
      } else {
        const end = raw.indexOf('*/', index + 2)
        if (end < 0) throw new Error('CLI settings are not valid JSONC. Edit them manually before changing skills.')
        index = end + 2
      }
      comments.push({ start, end: index })
      for (let offset = start; offset < index; offset++) if (!/[\r\n]/.test(raw[offset])) masked[offset] = ' '
      continue
    }
    if (character === '"') {
      index++
      while (index < raw.length) {
        if (raw[index] === '\\') index += 2
        else if (raw[index++] === '"') break
      }
      tokens.push({ start, end: index, text: raw.slice(start, index), quoted: true })
    } else if ('{}[]:,'.includes(character)) {
      index++
      tokens.push({ start, end: index, text: character })
    } else {
      while (index < raw.length && !/[\s{}[\]:,/]/.test(raw[index])) index++
      if (index === start) index++
      tokens.push({ start, end: index, text: raw.slice(start, index) })
    }
  }
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    if (token.text === ',' && [']', '}'].includes(tokens[index + 1]?.text) &&
      !['[', '{', ',', ':'].includes(tokens[index - 1]?.text)) masked[token.start] = ' '
  }
  if (masked[0] === '\uFEFF') masked[0] = ' '
  let value: unknown
  try { value = raw ? JSON.parse(masked.join('')) : {} }
  catch { throw new Error('CLI settings are not valid JSONC. Edit them manually before changing skills.') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('CLI settings must be a JSON object.')
  return { value: value as Record<string, unknown>, tokens, comments }
}

export function parseSkillSettings(raw: string): Record<string, unknown> {
  return document(raw).value
}

/** Edits element tokens and separators without moving or dropping array comments. */
export function replaceDisabledSkills(raw: string, names: string[]): string {
  if (!raw) return `{\n  "disabledSkills": ${JSON.stringify(names)}\n}\n`
  const { tokens, value: settings } = document(raw)
  const values: Array<{ start: number; end: number }> = []
  let depth = 0
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    if (depth === 1 && token.quoted && tokens[index + 1]?.text === ':' &&
      JSON.parse(token.text) === 'disabledSkills') {
      const start = tokens[index + 2]
      let end = start.end
      if (start.text === '[' || start.text === '{') {
        let nested = 0
        for (let cursor = index + 2; cursor < tokens.length; cursor++) {
          if (['[', '{'].includes(tokens[cursor].text)) nested++
          if ([']', '}'].includes(tokens[cursor].text) && --nested === 0) {
            end = tokens[cursor].end
            break
          }
        }
      }
      values.push({ start: start.start, end })
    }
    if (['[', '{'].includes(token.text)) depth++
    if ([']', '}'].includes(token.text)) depth--
  }
  if (values.length > 1) throw new Error('CLI settings repeat disabledSkills. Edit it manually before changing skills.')
  const value = values[0]
  if (value) {
    if (!Array.isArray(settings.disabledSkills) || settings.disabledSkills.some((name) => typeof name !== 'string')) {
      throw new Error('CLI disabledSkills must be a list of strings.')
    }
    const array = tokens.filter((token) => token.start > value.start && token.end < value.end)
    const elements = array.filter((token) => token.quoted)
    const commas = array.filter((token) => token.text === ',')
    const remaining = new Map<string, number>()
    for (const name of names) remaining.set(name, (remaining.get(name) ?? 0) + 1)
    const kept = elements.map((token) => {
      const name = JSON.parse(token.text) as string
      const count = remaining.get(name) ?? 0
      if (count) remaining.set(name, count - 1)
      return count > 0
    })
    const added = [...remaining].flatMap(([name, count]) => Array.from({ length: count }, () => name))
    const trailing = array.at(-1)?.text === ','
    const lastKept = kept.lastIndexOf(true)
    const edits: Array<{ start: number; end: number; text: string }> = []
    const insertions = new Map<number, string>()
    const insert = (at: number, text: string) => insertions.set(at, (insertions.get(at) ?? '') + text)
    elements.forEach((element, index) => {
      if (!kept[index]) edits.push({ ...element, text: '' })
      const needsComma = kept[index] && (index !== lastKept || added.length > 0 || trailing)
      if (commas[index] && !needsComma) edits.push({ ...commas[index], text: '' })
      if (!commas[index] && needsComma) insert(element.end, ',')
    })
    if (added.length) {
      const close = value.end - 1
      const multiline = raw.slice(value.start, value.end).includes('\n')
      const newline = raw.includes('\r\n') ? '\r\n' : '\n'
      const closingIndent = /\n([\t ]*)$/.exec(raw.slice(0, close))?.[1]
      const first = elements[0]
      const firstIndent = first ? raw.slice(raw.lastIndexOf('\n', first.start - 1) + 1, first.start) : ''
      const indent = first && /^[\t ]*$/.test(firstIndent) ? firstIndent : `${closingIndent ?? ''}  `
      const prefix = multiline
        ? closingIndent === undefined ? `${newline}${indent}` : indent.slice(closingIndent.length)
        : raw.slice(value.start + 1, close).trim() ? ' ' : ''
      insert(close, `${prefix}${added.map((name) => JSON.stringify(name)).join(multiline ? `,${newline}${indent}` : ', ')}${trailing ? ',' : ''}${multiline ? `${newline}${closingIndent ?? ''}` : ''}`)
    }
    for (const [at, text] of insertions) edits.push({ start: at, end: at, text })
    let updated = raw
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      updated = `${updated.slice(0, edit.start)}${edit.text}${updated.slice(edit.end)}`
    }
    return updated
  }
  const closing = tokens.at(-1)!.start
  const separator = tokens.length > 2 && tokens.at(-2)?.text !== ',' ? ',' : ''
  return `${raw.slice(0, closing)}${separator}\n  "disabledSkills": ${JSON.stringify(names)}\n${raw.slice(closing)}`
}
