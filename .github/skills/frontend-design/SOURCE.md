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

`SKILL.md` preserves the upstream text and frontmatter, with one prominently
labeled Agentic Remote adaptation callout after its heading. The callout
points to `references/agentic-remote.md`, which supplies local product,
privacy, accessibility, workflow, and navigation constraints.

To update, review a new upstream revision, retain its license, replace the
upstream portion without losing the local callout, and record the new
revision here. Review the local reference against the current product spec
and refresh Graphify after staging the changed files. Do not run an installer
that changes global agent configuration merely to refresh this project skill.
