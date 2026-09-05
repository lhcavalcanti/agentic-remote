# Motion and frontend performance

Use for streaming conversations, drawers, resizing, busy states, document
rendering, and long lists. Adapted from [UI-SKILLS.md](../UI-SKILLS.md).

## Motion communicates a change

Repeated typing, polling, status updates, and keyboard navigation should feel
immediate. Do not replay entrance animations on every transcript update or
stagger a frequently used session list. Never move the reader away from older
content just because passive activity arrived.

Use restrained, interruptible transitions for a meaningful open/close or
selection change. Name the animated properties; prefer transform/opacity
where appropriate, but do not assume compositing is guaranteed. Profile
large blur, filter, shadow, and `will-change` changes before using them.

Keep static labels or icons for each state. Reduced-motion paths must work
without movement, and actions/focus restoration must not depend on an
animation completing. Check rapid reversal and cancellation, not just the
happy-path entrance. Use the existing motion language rather than importing
fixed scale, blur, or spring recipes or a new animation package.

## Keep high-frequency work small

- Identify the actual cost with existing browser/profiler tools before adding
  memoization, virtualization, caching, or new dependencies.
- Preserve session identity as computer plus session, and retain draft,
  question, queue, and reading-position owners during component extraction.
  Do not refactor the whole app because a file exceeds a size heuristic.
- Keep per-keystroke and per-poll work independent of total transcript
  history. Reuse existing incremental parsing, bounded rendering, and stable
  selectors/callbacks where their dependencies are correct.
- Preserve existing async ownership and race guards: an old response must
  not overwrite a newer selection or resurrect cleared content.
- Batch necessary layout reads/writes outside render, scope observers, and
  clean up listeners. Pane dragging must remain responsive without resetting
  document or tree position.
- Reserve space for media to prevent layout shifts. Defer expensive reader
  resources when appropriate without hiding current content on every refresh.

A list length is not an automatic virtualization mandate. Any windowing must
preserve focus, tree semantics, heading navigation, pending action visibility,
history expansion, and scroll recovery.

This is a client-rendered React/Vite application. Do not introduce Next.js,
server-component, global-store, data-fetching-library, font-preload, or CDN
assumptions without a demonstrated need in this repository.
