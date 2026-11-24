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

/** What raw HTML leaves to read: nothing for markup, and the text of anything else. */
function htmlText(html: string): string {
  if (/^<[!?]/.test(html)) return ''
  const name = /^<\/?([a-zA-Z][a-zA-Z\d-]*)/.exec(html)?.[1]
  if (!name) return html
  const lower = name.toLowerCase()
  const markup = name.includes('-')
    ? name === lower
    : htmlElements.has(lower) && (name === lower || (name.length > 1 && name === name.toUpperCase()))
  if (!markup) return html
  return lower === 'br' ? '\n' : ''
}

/**
 * The words a reader sees of a node once it is rendered: text and code stay,
 * links keep their words, and images, raw markup, link definitions and
 * footnotes go.
 */
function nodeText(node: Nodes): string {
  switch (node.type) {
    case 'text':
    case 'inlineCode':
    case 'code':
      return node.value
    case 'html':
      return htmlText(node.value)
    case 'break':
      return '\n'
    case 'image':
    case 'imageReference':
    case 'definition':
    case 'footnoteDefinition':
    case 'footnoteReference':
      return ''
    default:
      return 'children' in node
        ? (node.children as Nodes[]).map(nodeText).join(blockParents.has(node.type) ? '\n' : '')
        : ''
  }
}

/**
 * A message as plain text, read with the grammar the conversation is rendered
 * with, so lists, headings and tables are told from prose before its lines
 * are joined. Only its first 20,000 characters are read.
 */
function plainText(content: string): string {
  const source = Array.from(content.slice(0, 2 * CONTEXT_SOURCE_LENGTH)).slice(0, CONTEXT_SOURCE_LENGTH).join('')
  return nodeText(markdown.parse(source))
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
