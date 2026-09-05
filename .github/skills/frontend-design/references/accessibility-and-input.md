# Accessibility and input

Use for controls, questions, permissions, forms, drawers, readers, and phone
layouts. Sources and standards are recorded in [UI-SKILLS.md](../UI-SKILLS.md).

## Semantics and focus

- Prefer native buttons for actions and links for navigation. Do not nest
  interactive controls. Native activation usually needs no extra key handler;
  adding one must not submit an action twice.
- Give icon actions and fields accessible names. Associate help and errors
  with their fields; preserve visible labels and meaningful reading order.
  Decorative icons should not be announced as content.
- Match semantics to behavior. A disclosure containing ordinary buttons is
  not automatically an ARIA menu. A true modal needs deliberate initial
  focus, focus containment, an inert background, and focus restoration;
  merely adding `open` to a dialog does not establish that whole contract.
- Keep focus visible and unobscured by headers, the composer, or overlays.
  Escape closes only the appropriate top layer, never silently dismissing an
  unanswered agent question. Keep the Knowledge tree's documented keyboard
  navigation intact.

## Protect input and attention

Preserve phone Return/newline, desktop Send, Queue shortcuts, composition/IME,
and native editing behavior. Pasting must remain possible; a custom paste
handler must preserve content and the existing delivery/recovery contract.
Do not turn controlled drafts or answer forms into uncontrolled fields solely
to avoid renders.

Announce meaningful async outcomes without reading every token or poll to a
screen reader. Keep urgent decisions prominent, but avoid duplicate focus and
live-region announcements. Never signal success before delivery/approval is
confirmed; retain entered text and actionable errors on failure.

## Phone and visual checks

Use the repository's visual-viewport and safe-area handling. Keep 16px phone
inputs and the practical 40 CSS-pixel target baseline; prefer 44px where
appropriate without overlapping adjacent hit areas. Those ergonomic targets
are not a blanket claim about WCAG's AA minimum.

Retain zoom, tap alternatives to drag/swipe, and discoverability without hover.
Do not auto-focus a phone field merely because a panel opened. Use words or
icons as well as color, and measure contrast on resolved colors: normal text
generally needs 4.5:1, large text 3:1 under the linked criterion's definitions
and exceptions.

Exercise keyboard, touch, zoom/reflow, and relevant assistive-technology paths.
A screenshot or automated scan alone does not establish accessibility
conformance. Report untested coverage accurately.
