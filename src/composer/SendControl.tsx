import { useEffect, useId, useRef, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type TriggerProps = Pick<ComponentProps<'button'>,
  'onClick' | 'onContextMenu' | 'onPointerDown' | 'onPointerUp' | 'onPointerLeave' |
  'onPointerCancel' | 'onKeyDown' | 'ref' | 'aria-haspopup' | 'aria-expanded' | 'aria-controls'>

export function SendControl({
  enabled, disabled, steerUnavailableReason, onSubmit, children,
}: {
  enabled: boolean
  disabled: boolean
  steerUnavailableReason?: string
  onSubmit: (enqueue?: boolean) => void
  children: (props: TriggerProps) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const chevron = useRef<HTMLButtonElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const id = useId()
  const visible = enabled && open
  const clearPress = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = undefined
  }
  const close = (restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) trigger.current?.focus()
  }
  const show = () => { if (!disabled) setOpen(true) }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  useEffect(() => {
    if (!visible) return
    root.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()
    const outside = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target) &&
          !trigger.current?.contains(event.target) && !chevron.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', outside)
    }
  }, [visible])
  const choose = (enqueue: boolean) => {
    if (disabled || (!enqueue && steerUnavailableReason)) return
    close()
    onSubmit(enqueue)
  }
  const triggerProps: TriggerProps = enabled ? {
    ref: trigger,
    'aria-controls': id,
    'aria-expanded': visible,
    'aria-haspopup': 'menu',
    onClick: show,
    onContextMenu: (event) => { event.preventDefault(); show() },
    onPointerDown: (event) => {
      clearPress()
      if (event.button === 0) timer.current = setTimeout(show, 500)
    },
    onPointerUp: clearPress,
    onPointerLeave: clearPress,
    onPointerCancel: clearPress,
    onKeyDown: (event) => {
      if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10') ||
          (event.altKey && event.key === 'ArrowDown')) {
        event.preventDefault()
        show()
      }
    },
  } : { onClick: () => onSubmit() }
  return (
    <>
      {children(triggerProps)}
      {enabled ? (
        <button
          aria-controls={id} aria-expanded={visible} aria-haspopup="menu" aria-label="Send options"
          className="composer-tool composer-send-options" disabled={disabled}
          onClick={show} ref={chevron} title="Steer or queue" type="button"
        ><ChevronDown aria-hidden="true" size={16} /></button>
      ) : null}
      {visible ? (
        <div
          aria-label="Message delivery" className="composer-send-menu" id={id} ref={root} role="menu"
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Tab') {
              event.preventDefault()
              event.stopPropagation()
              close()
            } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
              event.preventDefault()
              const items = [...root.current!.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
              const current = items.indexOf(document.activeElement as HTMLButtonElement)
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 :
                (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
              items[next]?.focus()
            }
          }}
        >
          <button
            aria-description={steerUnavailableReason}
            aria-disabled={disabled || Boolean(steerUnavailableReason)}
            onClick={() => choose(false)} role="menuitem" type="button"
          >
            <strong>Steer — guide the active turn</strong>
            {steerUnavailableReason ? <small>{steerUnavailableReason}</small> : null}
          </button>
          <button aria-disabled={disabled} onClick={() => choose(true)} role="menuitem" type="button">
            <strong>Queue — run after this turn</strong>
            <small>Delivers automatically after the current turn.</small>
          </button>
        </div>
      ) : null}
    </>
  )
}
