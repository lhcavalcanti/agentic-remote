import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type { Nodes } from 'mdast'
import type { ChatMessage, ClosedSessionContext, SessionDetail } from './contracts.js'

/** How long a closed session stays reopenable before it is deleted for good. */
export const CLOSED_SESSION_RETENTION_DAYS = 14
export const CLOSED_SESSION_RETENTION_MS = CLOSED_SESSION_RETENTION_DAYS * 24 * 60 * 60 * 1000

const CONTEXT_PROMPTS = 3
const CONTEXT_PROMPT_LENGTH = 200
const CONTEXT_REPLY_LENGTH = 400
/** How much of a message is read for its context, so a huge paste cannot hold up a close. */
const CONTEXT_SOURCE_LENGTH = 20_000
/**
 * How much is read of a message the parser is slow on, ten times the longest
 * excerpt. Its time grows faster than its input where emphasis markers,
 * brackets or quote markers crowd together, and deep nesting overflows its
 * stack.
 */
const CONTEXT_CROWDED_SOURCE_LENGTH = 4_000

/** When a session closed at `closedAt` is deleted, in epoch milliseconds; NaN when unreadable. */
export function closedSessionExpiresAt(closedAt: string): number {
  return Date.parse(closedAt) + CLOSED_SESSION_RETENTION_MS
}

// Whole code points, so a cut never leaves half of a surrogate pair.
function excerpt(text: string, limit: number): string {
  const characters = Array.from(text.replace(/\s+/g, ' ').trim())
  return characters.length > limit
    ? `${characters.slice(0, limit - 1).join('')}…`
    : characters.join('')
}

const markdown = unified().use(remarkParse).use(remarkGfm)

/** Nodes whose children are blocks, which are kept apart so their words never join. */
const blockParents = new Set<string>(['root', 'blockquote', 'list', 'listItem', 'table', 'tableRow'])

/**
 * The HTML elements, named in lower case or in capitals as HTML is written.
 * Any other name in angle brackets, such as the `<Option>` of
 * `Promise<Option>`, is prose about a type or a component, and stays.
 */
const htmlElements = new Set((
  'a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption center ' +
  'cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure ' +
  'font footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link ' +
  'main map mark marquee menu meta meter nav nobr noscript object ol optgroup option output p param picture pre ' +
  'progress q rp rt ruby s samp script search section select slot small source span strike strong style sub ' +
  'summary sup svg table tbody td template textarea tfoot th thead time title tr track tt u ul var video wbr'
).split(' '))

/**
 * What raw HTML leaves to read: nothing for markup, and the text of anything
 * else. A lone capital, as in `Store<S>`, is a type parameter unless the
 * message also closes it, as in `<B>bold</B>`.
 */
function htmlText(html: string, closed: ReadonlySet<string>): string {
  if (/^<[!?]/.test(html)) return ''
  const name = /^<\/?([a-zA-Z][a-zA-Z\d-]*)/.exec(html)?.[1]
  if (!name) return html
  const lower = name.toLowerCase()
  const capitals = name === name.toUpperCase() && (name.length > 1 || closed.has(name))
  const markup = name.includes('-') ? name === lower : htmlElements.has(lower) && (name === lower || capitals)
  if (!markup) return html
  return lower === 'br' ? '\n' : ''
}

/** The single capitals a tree's raw HTML closes, as in `</B>`; code is not HTML. */
function closedCapitals(tree: Nodes): Set<string> {
  const closed = new Set<string>()
  const pending: Nodes[] = [tree]
  while (pending.length > 0) {
    const node = pending.pop()!
    if (node.type === 'html') {
      const name = /^<\/([A-Z])\s*>$/.exec(node.value)?.[1]
      if (name) closed.add(name)
    } else if ('children' in node) {
      for (const child of node.children as Nodes[]) pending.push(child)
    }
  }
  return closed
}

/**
 * The words a reader sees of a tree once it is rendered: text and code stay,
 * links keep their words, and images, raw markup, link definitions and
 * footnotes go. Walked with a stack of its own, since a paste can nest
 * thousands of quotes deep.
 */
function nodeText(tree: Nodes): string {
  const closed = closedCapitals(tree)
  let text = ''
  const pending: (Nodes | string)[] = [tree]
  while (pending.length > 0) {
    const node = pending.pop()!
    if (typeof node === 'string') {
      text += node
      continue
    }
    switch (node.type) {
      case 'text':
      case 'inlineCode':
      case 'code':
        text += node.value
        break
      case 'html':
        text += htmlText(node.value, closed)
        break
      case 'break':
        text += '\n'
        break
      case 'image':
      case 'imageReference':
      case 'definition':
      case 'footnoteDefinition':
      case 'footnoteReference':
        break
      default:
        if ('children' in node) {
          const children = node.children as Nodes[]
          const apart = blockParents.has(node.type)
          for (let index = children.length - 1; index >= 0; index -= 1) {
            pending.push(children[index]!)
            if (apart && index > 0) pending.push('\n')
          }
        }
    }
  }
  return text
}

// The first `length` code points, without splitting a pair.
function head(text: string, length: number): string {
  return Array.from(text.slice(0, 2 * length)).slice(0, length).join('')
}

/**
 * A message as plain text, read with the grammar the conversation is rendered
 * with, so lists, headings and tables are told from prose before its lines
 * are joined. Its first 20,000 characters are read, or 4,000 of one more than
 * a tenth emphasis, bracket or quote markers, or of one nested too deep for
 * the parser; a message the parser still cannot read is kept as typed rather
 * than stop the session closing.
 */
function plainText(content: string): string {
  const source = head(content, CONTEXT_SOURCE_LENGTH)
  const crowded = (source.match(/[*_~[>]/g)?.length ?? 0) > source.length / 10
  const lengths = crowded ? [CONTEXT_CROWDED_SOURCE_LENGTH] : [CONTEXT_SOURCE_LENGTH, CONTEXT_CROWDED_SOURCE_LENGTH]
  for (const length of lengths) {
    const read = head(source, length)
    try {
      return nodeText(markdown.parse(read))
    } catch {
      // Read less, or keep it as typed.
    }
  }
  return source
}

function said(message: ChatMessage, role: ChatMessage['role']): boolean {
  return message.role === role && message.content.trim().length > 0
}

/**
 * What a session was about when it closed: its title and folder, its last
 * three prompts, and an excerpt of its last reply, each read as plain text
 * and cut on one line.
 */
export function closedSessionContext(
  session: Pick<SessionDetail, 'title' | 'cwd' | 'messages'>,
): ClosedSessionContext {
  const prompts: string[] = []
  let reply: string | undefined
  // From the end, reading only the messages that are kept.
  for (let index = session.messages.length - 1; index >= 0; index -= 1) {
    const message = session.messages[index]!
    const prompt = prompts.length < CONTEXT_PROMPTS && said(message, 'user')
    if (!prompt && (reply !== undefined || !said(message, 'assistant'))) {
      if (prompts.length === CONTEXT_PROMPTS && reply !== undefined) break
      continue
    }
    const text = excerpt(plainText(message.content), prompt ? CONTEXT_PROMPT_LENGTH : CONTEXT_REPLY_LENGTH)
    if (!text) continue
    if (prompt) prompts.unshift(text)
    else reply = text
  }
  return {
    title: session.title,
    cwd: session.cwd,
    prompts,
    ...(reply ? { reply } : {}),
  }
}

export function isClosedSessionContext(value: unknown): value is ClosedSessionContext {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const context = value as Record<string, unknown>
  return typeof context.title === 'string' &&
    typeof context.cwd === 'string' &&
    Array.isArray(context.prompts) &&
    context.prompts.every((prompt) => typeof prompt === 'string') &&
    (context.reply === undefined || typeof context.reply === 'string')
}
