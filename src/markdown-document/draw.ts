import { cloneElement, createElement, Fragment, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { Element, RootContent } from 'hast'
import type { Components } from 'react-markdown'
import { documentJsx } from './document-jsx'
import { isDrawnInParts } from './drawing'
import type { DrawStep } from './pipeline'

/** An element still being drawn into. */
interface Level {
  /** The element made with no children: its type, key, and props. */
  shell: ReactElement
  /** Its hast, so children are made where they belong (tables drop whitespace); absent for a block. */
  node?: Element
  /** One keyed fragment per earlier step into it; final. */
  done: ReactElement[]
  /** The latest step's children; the last may be the level below, still open. */
  latest: ReactNode[]
  /** The hast of the latest step's last node, which a deeper step draws into. */
  last?: RootContent
}

/** A document as drawn so far: a block per top-level step, the last perhaps still being drawn into. */
export interface DocumentDrawing {
  blocks: ReactElement[]
  /** The last block's open elements, the block first. */
  open: Level[]
}

export const emptyDrawing: DocumentDrawing = { blocks: [], open: [] }

function list(children: ReactNode): ReactNode[] {
  if (children === undefined || children === null) return []
  return Array.isArray(children) ? children : [children]
}

function childrenOf(element: ReactNode): ReactNode {
  return isValidElement<{ children?: ReactNode }>(element) ? element.props.children : undefined
}

/** `nodes` as elements, made as children of `parent`, or of the page. */
function elementsFor(nodes: RootContent[], components: Components, parent?: Element): ReactNode[] {
  if (!parent) return list(childrenOf(documentJsx({ type: 'root', children: nodes }, components)))
  const made = documentJsx(
    { type: 'root', children: [{ ...parent, children: nodes as Element['children'] }] },
    components,
  )
  return list(childrenOf(childrenOf(made)))
}

/**
 * The element `levels[index]` stands for, every level below it inside. While
 * they are `open`, a component drawing one is told it is still being drawn.
 */
function build(levels: Level[], index: number, open: boolean): ReactElement {
  const level = levels[index]!
  const latest = index + 1 < levels.length
    ? [...level.latest.slice(0, -1), build(levels, index + 1, open)]
    : level.latest
  const shell = level.shell as ReactElement<{ drawing?: boolean }>
  return cloneElement(shell, open && isDrawnInParts(shell.type) ? { drawing: true } : undefined, [
    ...level.done,
    createElement(Fragment, { key: level.done.length }, latest),
  ])
}

/**
 * `drawing` with one more step drawn. Everything drawn before keeps its
 * element, so React leaves its part of the page alone: a step into a long
 * table adds rows to the table already there.
 */
export function drawStep(drawing: DocumentDrawing, step: DrawStep, components: Components): DocumentDrawing {
  const { depth } = step
  if (depth === 0) {
    // Each block is an element of its own, so laying out a new one leaves the rest alone.
    const block: Level = {
      shell: createElement('div', { key: drawing.blocks.length, className: 'document-chunk' }),
      done: [],
      latest: elementsFor(step.nodes, components),
      last: step.nodes.at(-1),
    }
    const { blocks } = finishDrawing(drawing)
    return { blocks: [...blocks, build([block], 0, true)], open: [block] }
  }
  if (drawing.open.length < depth) throw new Error(`Nothing is open to draw into at depth ${depth}.`)
  const levels = drawing.open.slice(0, depth + 1)
  let container = levels[depth]
  if (drawing.open.length > depth + 1) {
    // Whatever is open below the element drawn into is complete.
    container = { ...container!, latest: [...container!.latest.slice(0, -1), build(drawing.open, depth + 1, false)] }
  }
  if (container) {
    container = {
      ...container,
      done: [...container.done, createElement(Fragment, { key: container.done.length }, container.latest)],
    }
  } else {
    const parent = levels[depth - 1]!
    const shell = parent.latest.at(-1)
    if (!isValidElement(shell) || parent.last?.type !== 'element') {
      throw new Error(`Nothing is open to draw into at depth ${depth}.`)
    }
    container = { shell, node: parent.last, done: [], latest: [] }
  }
  levels[depth] = {
    ...container,
    latest: elementsFor(step.nodes, components, container.node),
    last: step.nodes.at(-1),
  }
  return { blocks: [...drawing.blocks.slice(0, -1), build(levels, 0, true)], open: levels }
}

/** `drawing` once nothing more will be added: whatever was still open is complete. */
export function finishDrawing(drawing: DocumentDrawing): DocumentDrawing {
  if (drawing.open.length < 2) return drawing
  return { blocks: [...drawing.blocks.slice(0, -1), build(drawing.open, 0, false)], open: [] }
}
