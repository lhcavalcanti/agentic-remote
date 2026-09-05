# Source and local adaptation

- Requested catalog page:
  <https://www.ui-skills.com/skills/anthropics/frontend-design>
- Canonical source linked by that page:
  <https://github.com/anthropics/skills/tree/main/skills/frontend-design>
- Pinned upstream revision:
  `41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f` (September 3, 2026).
- Upstream skill:
  <https://github.com/anthropics/skills/blob/41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f/skills/frontend-design/SKILL.md>
- License: Apache-2.0; the upstream `LICENSE.txt` is included unchanged.

The catalog excerpt differs from the current canonical source. This
installation uses the versioned Anthropic source rather than treating the
catalog's excerpt as a separate skill.

`SKILL.md` preserves the upstream design body, name, and license field.
Local adaptations are a description extension, the prominently labeled
Agentic Remote callout, and the bounded
`agentic-remote-ui-guidance` routing block. The callout points to
`references/agentic-remote.md` for local product, privacy, accessibility,
workflow, and navigation constraints.

The conditional companion references are project-specific adaptations of
five selected UI Skills. [UI-SKILLS.md](UI-SKILLS.md) records their fit,
canonical version pins, MIT license copies, standards references, and
source recommendations deliberately not adopted. They supplement the
Anthropic foundation rather than replacing it or installing global skills.

To update, review a new upstream revision, retain its license, replace the
upstream portion without losing the local adaptations, and record the new
revision here. Review all local references against the current product spec
and refresh Graphify after staging the changed files. Do not run an installer
that changes global agent configuration merely to refresh this project skill.
