# Activity display

How a session shows its tool calls, skills, MCP calls, and sub-agents.

Mockups live in [`mockups/activity-view.html`](mockups/activity-view.html).
Open it in a browser: it renders the same nine activities twice, inside a frame
that stands in for the app, so the comparison is about the view rather than the
wording.

## What the Copilot CLI gets right

Its transcript is a log, not a feed of cards. The view does the work:

- **No containers.** Rows run the full width with no border, card, or tint, so
  the eye follows a single column of text instead of a stack of boxes.
- **One typeface.** Everything is monospace, including the agent's narration,
  which is what makes arguments, paths, and results line up.
- **One column of glyphs** down the left, and **one column of durations** down
  the right; the text between them is free to be any length.
- **Weight, not colour, carries the hierarchy.** Only the tool name is bold and
  bright. Provenance, arguments, and results are all the same grey, so a long
  argument list never shouts.

and the row itself reads left to right:

- **One line per call.** Density is the point: a dozen steps stay readable.
- **A status glyph in the left gutter.** Filled for finished, hollow for still
  running, so progress reads as a column rather than as prose.
- **The tool name leads, in bold.** `search_config_keys`, `Read`,
  `Search` — the thing that happened is the first word.
- **Provenance is muted and parenthesised.** `(MCP: configuration-service)` says where
  a call went without competing with what it did.
- **Arguments follow after a separator**, truncated with an ellipsis.
- **Results are reported.** `48 lines read`, `No matches found`,
  `95 lines found` — the row says how it went, not merely that it ran.
- **Duration is right-aligned.** A column of times makes a slow step obvious.
- **A skill announces itself** as `skill(service-inventory)`, acting as a
  heading for the calls it brings with it.
- **Narration is marked by colour, not by typeface.** Thinking keeps the
  monospace but takes a blue bullet, so it reads as a different kind of line
  while staying in the same column.

## What the app does today

Every call is a bordered pill with a tint, stacked one per row.

- The same nine activities need eleven pills, because each skill and agent
  takes a row of its own, and they fill the column the proposal fits them all
  into with room left over.
- Three different treatments — plain, blue for MCP, amber for agents — compete
  inside the same list, so the eye has no single thing to follow.
- Nothing lines up: each pill is only as wide as its text, so there is no
  column of statuses to scan and no column of durations at all.
- Vertical space is spent on borders and padding rather than on steps.
- The tool title carries a humanised name — `MCP · Service Deployment
  Operations · Search Deployment Store` — which is long, and wraps.
- There is nowhere to put a result or a duration, so neither is shown.
- Skills and sub-agents are pills like any other call, so the work they pull in
  is not visibly theirs.

## Proposed

Adopt the log, and let a skill own its calls.

1. **Row grammar**: `glyph · [kind] name (origin) · args · result` with the
   duration right-aligned. Monospace, no border, hover for the row background.
2. **Weight over colour**: only the tool name is bright and bold; provenance,
   arguments, and results share one grey. Status lives in the glyph, and a
   failure turns the name red.
3. **Skills and sub-agents become headings** — `skill(name)`, `agent(type)` —
   with the calls beneath them tied together by a rule, and grouping ends when
   the skill's last call completes.
4. **Results become first class**: line counts, match counts, and error
   summaries are already in `tool.execution_complete`; the row shows them.
5. **Durations** come from the gap between `tool.execution_start` and its
   completion.
6. **Narration keeps the proportional font**, so reasoning still reads as prose.

## Where this lands in the code

| Concern | Location |
| --- | --- |
| Row content, names, origin, arguments | `toolActivityContent` in `server/agent-service.ts` |
| Result summary and duration | `tool.execution_complete` handling in `server/agent-service.ts`, plus new `ChatMessage` fields |
| Row rendering | `ActivityMessage` in `src/App.tsx` |
| Grouping under a skill or agent | the activity branch of the timeline in `src/App.tsx` |
| Styles | `.activity-message` rules in `src/index.css` |

The transcript already distinguishes MCP calls, skills, and sub-agents, so the
change is presentational plus two new fields on an activity message. The sticky
"current tool" row, the compact one-line detail, and the existing roles and
labels the tests assert on are all preserved.
