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

/** Replaces one value span; all unrelated bytes, comments and formatting survive. */
export function replaceDisabledSkills(raw: string, names: string[]): string {
  if (!raw) return `{\n  "disabledSkills": ${JSON.stringify(names)}\n}\n`
  const { tokens, comments } = document(raw)
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
    if (comments.some((comment) => comment.start >= value.start && comment.end <= value.end)) {
      throw new Error('Comments inside disabledSkills cannot be preserved safely. Edit it manually instead.')
    }
    return `${raw.slice(0, value.start)}${JSON.stringify(names)}${raw.slice(value.end)}`
  }
  const closing = tokens.at(-1)!.start
  const separator = tokens.length > 2 && tokens.at(-2)?.text !== ',' ? ',' : ''
  return `${raw.slice(0, closing)}${separator}\n  "disabledSkills": ${JSON.stringify(names)}\n${raw.slice(closing)}`
}
