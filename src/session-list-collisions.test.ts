import type { ClientRect, Collision, CollisionDetection, DroppableContainer } from '@dnd-kit/core'
import { describe, expect, it } from 'vitest'
import { sessionListCollisions } from './session-list-collisions'

type Args = Parameters<CollisionDetection>[0]

function rect(top: number, height: number, left = 0, width = 300): ClientRect {
  return { top, height, left, width, bottom: top + height, right: left + width }
}

/**
 * Two categories above one computer:
 *   category:reviews 0-100, with session:hub:a 30-60 and session:hub:b 60-90
 *   category:plans   110-140, closed, header only
 *   computer:hub     150-260, with session:hub:c 180-210 and session:hub:d 220-250
 */
const layout: Record<string, ClientRect> = {
  'category:reviews': rect(0, 100),
  'session:hub:a': rect(30, 30),
  'session:hub:b': rect(60, 30),
  'category:plans': rect(110, 30),
  'computer:hub': rect(150, 110),
  'session:hub:c': rect(180, 30),
  'session:hub:d': rect(220, 30),
}

function args(active: string, pointer: { x: number; y: number } | null, dragged: ClientRect): Args {
  const droppableContainers = Object.keys(layout).map((id) => ({ id }) as unknown as DroppableContainer)
  return {
    active: { id: active } as Args['active'],
    collisionRect: dragged,
    droppableRects: new Map(Object.entries(layout)),
    droppableContainers,
    pointerCoordinates: pointer,
  }
}

const ids = (collisions: Collision[]) => collisions.map((collision) => collision.id)

describe('session list collisions', () => {
  it('lands on the session under the pointer inside a category', () => {
    expect(ids(sessionListCollisions(args('session:hub:c', { x: 100, y: 70 }, rect(55, 30))))[0])
      .toBe('session:hub:b')
  })

  it('lands on the category itself over its header', () => {
    expect(ids(sessionListCollisions(args('session:hub:c', { x: 100, y: 10 }, rect(0, 30)))))
      .toEqual(['category:reviews'])
    expect(ids(sessionListCollisions(args('session:hub:c', { x: 100, y: 120 }, rect(105, 30)))))
      .toEqual(['category:plans'])
  })

  it('takes the nearest of a category\'s sessions below its header when between them', () => {
    expect(ids(sessionListCollisions(args('session:hub:c', { x: 100, y: 95 }, rect(80, 30))))[0])
      .toBe('session:hub:b')
  })

  it('never lands in a category the pointer is not over, however close the dragged row comes', () => {
    // Pointer on the rule between the categories and the computer: the row's
    // centre is nearest the closed category, which must not take it.
    const collisions = ids(sessionListCollisions(args('session:hub:d', { x: 100, y: 145 }, rect(125, 30))))
    expect(collisions[0]).not.toMatch(/^category:/)
    expect(['session:hub:c', 'computer:hub', 'session:hub:d']).toContain(collisions[0])
  })

  it('leaves categories out of a keyboard move, and computers only trade places with computers', () => {
    expect(ids(sessionListCollisions(args('session:hub:c', null, rect(105, 30))))).not.toContain('category:plans')
    expect(ids(sessionListCollisions(args('computer:hub', { x: 100, y: 10 }, rect(0, 30)))))
      .toEqual(['computer:hub'])
  })
})
