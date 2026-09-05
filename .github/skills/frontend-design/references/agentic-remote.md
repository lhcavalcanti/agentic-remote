# Agentic Remote integration

Paths in this document are relative to the repository root.

## Start with the product

Agentic Remote is a mobile-first remote agent manager with a Markdown
knowledge-reading workspace, not a marketing landing page or a generic chat
client. Improve the supervision, reading, and action flow rather than adding a
decorative hero, invented metrics, or a new onboarding step to active work.

Use `agentic-remote-navigation` alongside this skill. Read `docs/app-spec.md`
for required behavior, and consult the maintained graph for cross-file
relationships. Read relevant PR/fix history before changing an established
flow; check open work for overlap rather than assuming an old proposal is
still current.

The user's explicit direction and product specification win over generic
style advice. A deliberate existing choice, such as Agentic green, is not
grounds for a redesign simply because a similar palette can be overused.

Use the [task-to-reference table](../SKILL.md) to load only relevant
companion guidance. The [selection decisions](../UI-SKILLS.md) record
source conflicts that must not silently override this product.

## Preserve the behavioral contracts

- Keep every computer discoverable and each session owned by its computer.
  Provider and execution-mode identity must remain explicit; do not imply
  tmux access for SDK-only sessions.
- Questions and permissions take priority over passive activity. Keep their
  actions, confirmations, focus, and error recovery intact.
- Preserve immediate Send, editable Queue, Stop, per-session drafts, and the
  distinct phone/desktop Enter behavior. File and audio actions must not send
  prompts automatically.
- Knowledge remains beside the conversation or expanded over it, not a
  second sidebar tab. Workspace panel mode and per-session reading position
  have different owners. Keep the tree in its established place.
- Keep the current accent presets and their tab-local persistence. Warning,
  error, background-task, and computer-identity colors retain their meaning.
- Respect PWA safe areas, visual viewport changes, keyboard-open layouts,
  16px phone inputs, and practical 40px-or-larger interaction targets.

## Apply the design process to an existing application

Inspect existing tokens, type, components, and local patterns before choosing
new ones. A small interaction improvement does not require a new font,
dependency, theme, or layout system. Keep a coherent hierarchy and make one
intentional design change instead of applying generic decoration everywhere.

Provider/mode badges, state labels, and root/folder paths encode real
information. Do not remove them merely to reduce visual signals. Use explicit
action copy and directional empty/error states without concealing failures.

Keep plans compact and proportional to the task. Do not create planning
documents unless requested. For visual changes, compare the actual
implementation at desktop and phone sizes; include dense, waiting, offline,
empty, and keyboard-constrained states when relevant. Existing useful capture
sizes are 1440x900 and 390x844, not a substitute for narrower layout checks.

Use synthetic or redacted data in PR screenshots and recordings. Do not send
live transcripts, private documents, credentials, or pairing information to
external mockup services.

Use the existing test/build tools and refresh Graphify after relevant tracked
source changes. Follow `.github/copilot-instructions.md` for worktrees,
reviews, promotion, and cleanup; this design skill grants no additional
deployment or data-migration authority.
