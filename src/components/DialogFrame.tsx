import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { hubSignInExpired, subscribeHubSignIn } from '../hub-sign-in'
import { SignInExpiredNotice } from '../SignInExpiredNotice'
import { innermostDialogFrame, openDialogFrame, subscribeDialogFrames } from './dialog-stack'

const dialogFocusable =
  'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'

export function DialogFrame({
  title,
  eyebrow,
  onClose,
  children,
  className,
}: {
  title: string
  eyebrow: string
  onClose: () => void
  children: ReactNode
  className?: string
}) {
  const dialog = useRef<HTMLElement>(null)
  // Read while rendering, before the dialog is committed, so this is whatever
  // opened it. Reading it from the effect instead named a field inside the
  // dialog that React had already focused, and handing the focus back to
  // something that is about to unmount is the same as dropping it.
  const [opener] = useState<HTMLElement | null>(() =>
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  )
  const [frame] = useState(() => Symbol('dialog frame'))
  useLayoutEffect(() => openDialogFrame(frame), [frame])
  const innermost = useSyncExternalStore(subscribeDialogFrames, innermostDialogFrame) === frame
  const signedOut = useSyncExternalStore(subscribeHubSignIn, hubSignInExpired)

  useEffect(() => {
    // The frame says `aria-modal`, which tells a reader the page behind it is
    // out of reach. Taking the focus, keeping Tab inside it, and handing the
    // focus back on the way out are what make that true rather than a claim.
    //
    // A dialog that has already put the focus somewhere of its own -- a title
    // being renamed, a search field -- is left alone. Pulling it back to the
    // frame would take the reader out of the field they were placed in, and
    // typing straight away would go nowhere.
    //
    // Escape is deliberately not answered here. The app closes the topmost
    // layer itself, in the order they are stacked and only when nothing
    // nearer has already answered the key, and a second closer on the frame
    // would be the same decision made again with less to go on.
    if (
      !(
        document.activeElement instanceof HTMLElement &&
        dialog.current?.contains(document.activeElement)
      )
    ) {
      dialog.current?.focus()
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (
        event.key !== 'Tab' ||
        event.defaultPrevented ||
        !dialog.current ||
        [...document.querySelectorAll('.dialog[aria-modal="true"]')].at(-1) !==
          dialog.current
      ) {
        return
      }
      const reachable = [
        ...dialog.current.querySelectorAll<HTMLElement>(dialogFocusable),
      ].filter(
        (element) =>
          !element.matches(':disabled') &&
          element.getAttribute('tabindex') !== '-1' &&
          element.getAttribute('aria-hidden') !== 'true' &&
          (element.offsetWidth > 0 ||
            element.offsetHeight > 0 ||
            element === document.activeElement),
      )
      if (reachable.length === 0) {
        event.preventDefault()
        dialog.current.focus()
        return
      }
      const first = reachable[0]
      const last = reachable[reachable.length - 1]
      const active = document.activeElement
      // The control that had the focus can be removed or disabled while the
      // dialog is open -- a button that stops applying, a field that goes
      // away with the mode it belonged to. The focus falls to the body, and
      // Tab from there walks the page behind a dialog that says it is out of
      // reach, so it is brought back in. Focus placed on something inside the
      // dialog that Tab itself skips, such as a heading a jump link moved it
      // to, carries on from there instead of starting over.
      if (!reachable.some((element) => element === active)) {
        event.preventDefault()
        const within =
          active instanceof HTMLElement &&
          active !== dialog.current &&
          dialog.current.contains(active)
        const next = !within
          ? undefined
          : event.shiftKey
            ? reachable.findLast((element) =>
                Boolean(element.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING))
            : reachable.find((element) =>
                Boolean(element.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_PRECEDING))
        ;(next ?? (event.shiftKey ? last : first)).focus()
        return
      }
      if (event.shiftKey && (active === first || active === dialog.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const remaining = [
        ...document.querySelectorAll<HTMLElement>(
          '.dialog[aria-modal="true"]',
        ),
      ].at(-1)
      if (!remaining || (opener && remaining.contains(opener))) {
        if (opener?.isConnected) opener.focus()
      } else if (!remaining.contains(document.activeElement)) {
        remaining.focus()
      }
    }
  }, [])

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-label={title}
        aria-modal="true"
        className={`dialog ${className || ''}`}
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialog}
        role="dialog"
        tabIndex={-1}
      >
        <div className="dialog__header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button
            aria-label="Close"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        {signedOut && innermost ? <SignInExpiredNotice placement="inline" /> : null}
        {children}
      </section>
    </div>
  )
}
