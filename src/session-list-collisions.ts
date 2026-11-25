import { closestCenter, pointerWithin } from '@dnd-kit/core'
import type { CollisionDetection, DroppableContainer } from '@dnd-kit/core'

const kind = (container: { id: string | number }) => String(container.id).split(':', 1)[0]

/**
 * Where a drag in the Sessions list lands.
 *
 * Rows trade places by the nearest centre, as they always have, and a
 * computer only ever trades places with computers. A category takes a session
 * only while the pointer is over it: onto the session under the pointer, the
 * nearest of its sessions below its header, or the header itself. So a row
 * carried close to a category, but not onto it, never ends up inside, and a
 * keyboard move, which has no pointer, reaches categories only through their
 * sessions.
 */
export const sessionListCollisions: CollisionDetection = (args) => {
  if (kind(args.active) === 'computer') {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) => kind(container) === 'computer'),
    })
  }
  const sections = args.droppableContainers.filter((container) => kind(container) === 'category')
  const others = args.droppableContainers.filter((container) => kind(container) !== 'category')
  const inside = (container: DroppableContainer, section: DroppableContainer) => {
    const rect = args.droppableRects.get(container.id)
    const outer = args.droppableRects.get(section.id)
    return Boolean(rect && outer && rect.top >= outer.top && rect.bottom <= outer.bottom)
  }
  if (!args.pointerCoordinates) return closestCenter({ ...args, droppableContainers: others })
  const [over] = pointerWithin({ ...args, droppableContainers: sections })
  const section = over && sections.find((container) => container.id === over.id)
  if (!section) {
    return closestCenter({
      ...args,
      droppableContainers: others.filter((container) => !sections.some((outer) => inside(container, outer))),
    })
  }
  const members = others.filter((container) => kind(container) === 'session' && inside(container, section))
  const [row] = pointerWithin({ ...args, droppableContainers: members })
  if (row) return [row, over]
  const firstRow = Math.min(...members.map((member) => args.droppableRects.get(member.id)!.top))
  if (members.length === 0 || args.pointerCoordinates.y < firstRow) return [over]
  return [...closestCenter({ ...args, droppableContainers: members }).slice(0, 1), over]
}
