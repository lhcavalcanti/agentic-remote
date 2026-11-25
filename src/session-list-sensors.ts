import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type {
  DraggableSyntheticListeners,
  MouseSensorOptions,
  TouchSensorOptions,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { MouseEvent, SyntheticEvent, TouchEvent } from 'react'

/** Marks a control that stands for its row, so pressing it picks the row up. */
export const dragsRow = { 'data-drags-row': '' } as const

/**
 * Whether a press began on one of the row's own controls, such as Close or
 * Tasks, which keep it. The row's open button and its handle are the row.
 */
function pressesOwnControl({ currentTarget, target }: SyntheticEvent) {
  if (!(target instanceof Element)) return false
  const control = target.closest('a[href], button, input, select, textarea, [role="button"]')
  return control !== null && control !== currentTarget && currentTarget.contains(control) &&
    !control.hasAttribute('data-drags-row')
}

/** The left button anywhere on a row; a pen that sends mouse events works the same way. */
class RowMouseSensor extends MouseSensor {
  static activators = [{
    eventName: 'onMouseDown' as const,
    handler: (event: MouseEvent, options: MouseSensorOptions) =>
      event.nativeEvent.button === 0 && !pressesOwnControl(event) &&
      MouseSensor.activators[0].handler(event, options),
  }]
}

/** A finger held on a row. Swipes stay the list's, to scroll it. */
class RowTouchSensor extends TouchSensor {
  static activators = [{
    eventName: 'onTouchStart' as const,
    handler: (event: TouchEvent, options: TouchSensorOptions) =>
      !pressesOwnControl(event) && TouchSensor.activators[0].handler(event, options),
  }]
}

/**
 * How the Sessions list picks up a session row or a computer's header: a mouse
 * press that moves a few pixels or a long press anywhere on it, or the
 * keyboard on its Reorder handle. Touch never comes through pointer events,
 * which would turn every swipe across the list into a drag.
 */
export function useSessionListSensors() {
  return useSensors(
    useSensor(RowMouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(RowTouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
}

/**
 * Splits a sortable's listeners: presses go on the whole row and keys only on
 * its handle, so Enter and Space on the row still open it.
 */
export function splitRowListeners(listeners: DraggableSyntheticListeners) {
  const { onKeyDown, ...press }: NonNullable<DraggableSyntheticListeners> = listeners ?? {}
  const keys: NonNullable<DraggableSyntheticListeners> = onKeyDown ? { onKeyDown } : {}
  return { press, keys }
}
