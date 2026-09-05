# Curated UI Skills for Agentic Remote

Selection snapshot: September 5, 2026 (UTC), from
[UI Skills](https://www.ui-skills.com/).

These are project-specific adaptations, not five additional globally
installed skills. The existing Anthropic design guidance remains the
foundation; the four local references provide focused engineering guidance.
Load the smallest relevant set rather than the entire catalog.

## Selected sources and fit

| Catalog skill | Why it fits | Local use |
| --- | --- | --- |
| [interface-design](https://www.ui-skills.com/skills/dammyjay93/interface-design) | Product workspaces, navigation hierarchy, density, and consistent reusable controls rather than marketing pages. | `references/product-workspaces.md` |
| [web-design-guidelines](https://www.ui-skills.com/skills/antfu/web-design-guidelines) | Browser semantics, input, focus, safe areas, content handling, and interaction review. Its canonical wrapper points to Vercel's guidelines. | `references/accessibility-and-input.md`, `references/motion-and-performance.md` |
| [frontend-ui-engineering](https://www.ui-skills.com/skills/addyosmani/frontend-ui-engineering) | React component boundaries, responsive behavior, realistic states, and accessible implementation. | Product, accessibility, and performance references |
| [better-ui](https://www.ui-skills.com/skills/jakubkrehel/better-ui) | Optical polish, state cues, purposeful motion, and restraint for frequent interactions. | Product and motion references |
| [improve-ui](https://www.ui-skills.com/skills/ibelick/improve-ui) | Surface scoping, proof of governing owners, counterevidence, and grounded findings. | `references/evidence-and-review.md` |

## Deliberate conflict decisions

| Source recommendation not imported as a blanket rule | Repository decision |
| --- | --- |
| Brand-new palettes/fonts, a single accent, identical sidebar surfaces, or renamed design tokens | Reuse the actual system and explicit user choices; preserve independent semantic colors and tab-local accents. |
| Fixed animation scales/blur/springs, prescribed shadows, or page-wide transition suppression | Existing motion, reduced motion, repeated-use cost, and measured performance govern. No mandatory library or universal animation recipe. |
| URL-sync every state, use `nuqs`/Next.js, or add unload warnings for every draft | Keep the accepted session URL model. Do not expose prompts, answers, private paths, or all workspace state in URLs; preserve existing draft persistence and update/recovery flow. |
| Always enable submit until a request begins, or optimistically present success | Keep validated eligibility, unavailable/offline/busy states, confirmed delivery/approval, and exact draft/error recovery. |
| Add keyboard handlers to every interactive element | Prefer native semantics; do not duplicate native activation. Implement the complete pattern only for genuinely custom controls. |
| Virtualize every list over a fixed length, split every component over a line count, or add global state/query libraries | Measure and preserve current state owners, tree accessibility, transcript windowing, and scroll recovery. |
| `improve-ui` never implements, always writes `design-plans/`, excludes accessibility unless requested | Respect the user's mode; keep audits read-only, implement authorized fixes, and retain accessibility as a baseline. No unsolicited plan files. |
| Title Case everywhere, mandatory curly punctuation, or blanket acronym/label removal | Preserve the app's terminology and sentence-case guidance; provider/runtime/state labels convey real information. |
| Treat a 44px ergonomic target as the universal WCAG AA minimum | Retain the project's practical 40px baseline, prefer 44px where appropriate, and consult the actual standard and exceptions. |

We did not import bulk palette catalogs, mandatory interview/variant flows,
GSAP-only taste recipes, new React Doctor dependencies, or general-purpose
multi-agent improvement workflows. They add scope or conflict with this
React/Vite supervision workspace without solving the selected needs.

## Pinned canonical material and licenses

All six supplemental repositories below identify MIT licensing. Their
original license notices are included, and the local references deliberately
adapt rather than reproduce the complete skills.

| Material | Pinned source | License copy |
| --- | --- | --- |
| Interface design | [Dammyjay93/interface-design, `2f9be320`](https://github.com/Dammyjay93/interface-design/blob/2f9be3206855bcb2d1d0af262c8bae25cba6658d/.claude/skills/interface-design/SKILL.md) | [MIT](licenses/interface-design-MIT.txt) |
| Web-review wrapper | [antfu/skills, `5e3122fb`](https://github.com/antfu/skills/blob/5e3122fbe3b151c3e940a01900a82272184a769e/skills/web-design-guidelines/SKILL.md) | [MIT](licenses/antfu-skills-MIT.txt) |
| Web-interface rules | [vercel-labs/web-interface-guidelines, `e3d624ba`](https://github.com/vercel-labs/web-interface-guidelines/blob/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/command.md) | [MIT](licenses/vercel-guidelines-MIT.txt) |
| Frontend engineering | [addyosmani/agent-skills, `84ee5067`](https://github.com/addyosmani/agent-skills/blob/84ee50673804b95c287d1e4eb4f1c1dad7c5188a/skills/frontend-ui-engineering/SKILL.md) | [MIT](licenses/frontend-ui-engineering-MIT.txt) |
| UI polish | [jakubkrehel/skills, `267330e1`](https://github.com/jakubkrehel/skills/blob/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-ui/SKILL.md) | [MIT](licenses/better-ui-MIT.txt) |
| Evidence-based UI review | [ibelick/ui-skills, `9f140de7`](https://github.com/ibelick/ui-skills/blob/9f140de767e6e2d4adc3970eb68d24b3ec896f99/skills/improve-ui/SKILL.md) | [MIT](licenses/improve-ui-MIT.txt) |

Standards references, not copied skill bodies:
[WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
and [ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## Updating the curation

Review source revisions deliberately, not on every small UI edit. Reconcile
each proposed rule against `docs/app-spec.md`, current implementation, privacy,
and the existing tools before adopting it. Update pins/notices and local
references together, retain the labeled adaptation block in `SKILL.md`, and
refresh Graphify after staging changed files. A newer source recipe is not
permission to replace established product behavior.
