# Product workspaces

Use for session navigation, conversation chrome, Knowledge, settings, and
their shared visual language. Adapted from the sources in [UI-SKILLS.md](../UI-SKILLS.md).

## Let the task establish hierarchy

Identify the primary job in the current state: find a session, answer a
question, inspect context, or give the next instruction. Make that job easy
to find without letting every status, toolbar action, and border compete.
Pending questions and permissions retain the product's highest priority.

Keep computer grouping, provider/runtime identity, and offline state
discoverable. A quieter row must not become an ambiguous chat list. Empty,
loading, offline, waiting, error, and interrupted are different states; use
specific guidance rather than one generic empty card.

## Reuse the actual system

- Trace the surface's existing components, variants, CSS variables, and
  resolved styles before adding tokens or primitives. Fix the owning rule,
  not an unrelated global override.
- Use native controls and existing accessible components first. Extract a
  shared component for a demonstrated shared responsibility, not merely
  similar markup. Do not impose a new component library or styling system.
- Separate brand emphasis from semantic color. Preserve Agentic green,
  tab-local accents, and warning/error/task/computer identity colors.
- Build hierarchy with grouping, spacing, type weight, and contrast. Choose
  density deliberately; do not make touch targets or reading text smaller
  just to fit another row.
- Use consistent radii, icon weight, optical alignment, and surface depth.
  A formula or shadow recipe is a starting point, not a reason to replace
  established tokens. Use tabular numerals where changing counts shift layout.

## Preserve useful space

Evaluate the space available to the component, including resized panes, not
just the browser width. Keep essential controls reachable with long names,
paths, and drafts. Resolve flex/grid overflow locally instead of clipping
the entire application to hide a defect.

Apply readable measures to prose without constraining wide code or tables.
Preserve horizontal reading gestures, folder-tree position, and the
conversation/Knowledge relationship across workspace modes. A marketing hero,
decorative metric grid, or compulsory new design-system document does not
belong in this supervision flow.
