# Oracle Periodic Checks Implementation Plan

> **Superseded by #511.** Periodic checks were removed before any hub ran them;
> Dreamer now keeps Oracle current with a periodic session-progress refresh
> ([design](../specs/2026-11-07-dreamer-periodic-refresh-design.md)). The
> draft-status change still stands.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove redundant draft-save copy and add opt-in, durable, read-only periodic Oracle status checks.

**Architecture:** Keep draft persistence unchanged but render only recovery and failure states. Add pure timezone/quiet-hour schedule helpers, then let the existing `ManagerAgent` enqueue deterministic scheduled messages into its durable queue with one exact timeout and no second runtime.

**Tech Stack:** TypeScript, React 19, Fastify, Vitest, Testing Library, Node timers and `Intl.DateTimeFormat`.

**Spec:** `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`

## Global Constraints

- Work from current `origin/main` in the isolated `feat/oracle-periodic-wake` worktree.
- Do not merge, deploy, or restart production.
- Keep PR #486 and queue-delivery changes out of this branch.
- Periodic checks are disabled by default and read-only at the tool-handler boundary.
- Use one exact timeout; do not add a polling interval or second Oracle runtime.
- Preserve `Recovered saved draft` and all storage/delivery warnings.

---

### Task 1: Remove redundant draft-save copy

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/ManagerAssistant.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/ManagerAssistant.test.tsx`
- Modify: `docs/app-spec.md`

**Interfaces:**
- Consumes: existing local draft persistence and recovery flags.
- Produces: ordinary drafts render no status; recovered drafts still render a polite status.

- [ ] **Step 1: Write failing UI tests**

Add assertions equivalent to:

```tsx
fireEvent.change(composer, { target: { value: 'Keep my draft' } })
expect(screen.queryByText('Saved on this device')).not.toBeInTheDocument()
```

Keep the remount tests asserting:

```tsx
expect(screen.getByText('Recovered saved draft')).toBeInTheDocument()
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
pnpm vitest run src/App.test.tsx src/ManagerAssistant.test.tsx -t "draft|refresh"
```

Expected: the new absence assertions fail because both composers render the
ambient notice.

- [ ] **Step 3: Render only recovered status**

Change both conditions from “non-empty draft” to “non-empty recovered draft”
and render the fixed text:

```tsx
{draft && recoveredDraft && !draftStorageError ? (
  <p role="status">Recovered saved draft</p>
) : null}
```

Update the product specification to require recovery and failure indications,
not an ambient success label for every draft.

- [ ] **Step 4: Run the focused tests**

Run the same Vitest command. Expected: PASS.

### Task 2: Define schedule types and pure calculations

**Files:**
- Create: `server/manager-schedule.ts`
- Create: `server/manager-schedule.test.ts`
- Modify: `shared/manager.ts`

**Interfaces:**
- Consumes: `validateDreamerTimeZone()` and `dreamerLocalParts()` from `server/dreamer-schedule.ts`.
- Produces:

```ts
export const managerCheckCadences = [60, 120, 240, 480] as const
export type ManagerCheckCadenceMinutes = (typeof managerCheckCadences)[number]
export interface ManagerProactiveSettings {
  enabled: boolean
  cadenceMinutes: ManagerCheckCadenceMinutes
  timeZone: string
  quietStartHour: number
  quietEndHour: number
}
export function managerCheckDefaults(): ManagerProactiveSettings
export function isManagerCheckQuiet(at: Date, settings: ManagerProactiveSettings): boolean
export function nextManagerCheckAt(from: Date, settings: ManagerProactiveSettings): Date
export function managerScheduledMessageId(scheduledFor: string): string
```

- [ ] **Step 1: Write failing pure tests**

Cover:

```ts
expect(nextManagerCheckAt(new Date('2026-11-04T12:00:00Z'), utc).toISOString())
  .toBe('2026-11-04T14:00:00.000Z')
expect(isManagerCheckQuiet(new Date('2026-11-04T23:00:00Z'), utc)).toBe(true)
expect(nextManagerCheckAt(new Date('2026-11-04T21:30:00Z'), utc).toISOString())
  .toBe('2026-11-05T07:00:00.000Z')
```

Also cover an overnight window, disabled quiet hours when start equals end,
invalid timezone refusal, and stable deterministic IDs.

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
pnpm vitest run server/manager-schedule.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement bounded schedule calculations**

Use local parts for quiet-hour membership and scan forward by one minute for at
most 26 hours when a cadence target lands inside quiet hours. Throw a 400-style
error for invalid settings rather than silently falling back.

- [ ] **Step 4: Run the pure tests**

Run the same Vitest command. Expected: PASS.

### Task 3: Persist settings and enqueue scheduled checks

**Files:**
- Modify: `server/manager-store.ts`
- Modify: `server/manager-agent.ts`
- Modify: `server/manager-agent.test.ts`
- Modify: `server/manager-store.test.ts`

**Interfaces:**
- Consumes: Task 2 schedule types and helpers.
- Produces:

```ts
interface ManagerProactiveState {
  settings: ManagerProactiveSettings
  nextCheckAt?: string
}

ManagerMessageSource = 'typed' | 'voice' | 'scheduled'
```

- [ ] **Step 1: Write failing ManagerAgent tests**

Use fake time to prove:

```ts
await agent.updateSettings({ proactive: { ...managerCheckDefaults(), enabled: true } })
await vi.advanceTimersByTimeAsync(120 * 60_000)
expect(agent.snapshot().messages).toContainEqual(expect.objectContaining({
  role: 'user',
  source: 'scheduled',
  answerOnly: true,
}))
```

Add cases for user messages staying first, deterministic duplicate prevention,
one restart catch-up after several missed intervals, quiet-hour deferral,
disablement clearing the timer, and restart recovery of an already persisted
scheduled message.

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
pnpm vitest run server/manager-agent.test.ts server/manager-store.test.ts -t "scheduled|proactive"
```

Expected: FAIL because proactive settings and scheduling do not exist.

- [ ] **Step 3: Implement persisted state and one-timeout scheduling**

Persist `proactive.settings` and `proactive.nextCheckAt` in `state.json`.
On `start()` and proactive settings changes, clear the previous timeout, enqueue
one overdue check when eligible, and arm one timeout for the next instant.
Write the deterministic message before advancing `nextCheckAt`; if the message
already exists, only advance the schedule. Retry admission failures after 1, 5,
then 15 minutes without allocating more than one timer.

- [ ] **Step 4: Run focused tests**

Run the same Vitest command. Expected: PASS.

### Task 4: Enforce scheduled read-only behavior and expose settings

**Files:**
- Modify: `server/manager-context.ts`
- Modify: `server/manager-tools.ts`
- Modify: `server/manager-tools.test.ts`
- Modify: `server/manager-routes.ts`
- Modify: `server/manager-routes.test.ts`
- Modify: `src/use-oracle-settings.ts`
- Modify: `src/OracleSettings.tsx`
- Modify: `src/OracleSettings.test.tsx`

**Interfaces:**
- Consumes: Task 3 `source: "scheduled"` messages and proactive settings.
- Produces: settings API validation, scheduled prompt wrapper, read-only
  handler enforcement, and an accessible App settings form.

- [ ] **Step 1: Write failing boundary tests**

Assert that scheduled turns may call `get_session` but receive a tool failure
from `send_to_session`, `set_session_folder`, `memory_write`, and structured
memory mutations. Assert the settings route rejects invalid cadence, timezone,
and hours.

- [ ] **Step 2: Write failing settings UI tests**

Render settings, enable periodic checks, choose a cadence/timezone/quiet window,
save, and assert the exact `updateManagerSettings({ proactive: ... })` payload.
Verify next/latest status is readable and the toggle can pause checks.

- [ ] **Step 3: Run focused tests and verify failure**

Run:

```bash
pnpm vitest run server/manager-tools.test.ts server/manager-routes.test.ts src/OracleSettings.test.tsx
```

- [ ] **Step 4: Implement boundary and UI**

Wrap scheduled content in `<scheduled_status_check>` rather than
`<user_message>`. Add a handler guard:

```ts
if (host.messageSource() === 'scheduled' && managerToolMutability(name) !== 'read') {
  return failure('Scheduled Oracle checks are read-only.')
}
```

Add a **Periodic checks** settings section with an enable checkbox, cadence
select, timezone input, quiet-hour selects, next check, latest state, and
explicit copy that checks are read-only.

- [ ] **Step 5: Run focused tests**

Run the same Vitest command. Expected: PASS.

### Task 5: Show scheduled activity and complete validation

**Files:**
- Modify: `src/ManagerAssistant.tsx`
- Modify: `src/ManagerAssistant.test.tsx`
- Modify: `docs/app-spec.md`
- Modify: `package.json`
- Modify: shell version files required by the repository version policy.
- Refresh: `graphify/graph.json`, `graphify/graph.html`, `graphify/GRAPH_REPORT.md`, `graphify/communities.json`, `graphify/metadata.json`

**Interfaces:**
- Consumes: scheduled messages and proactive settings from Tasks 3-4.
- Produces: visible **Scheduled check** transcript/queue semantics and a minor
  release candidate.

- [ ] **Step 1: Write failing presentation tests**

Assert queued and completed scheduled messages show **Scheduled check**, do not
show editable/removable controls, and retain Retry after failure.

- [ ] **Step 2: Run presentation tests and verify failure**

Run:

```bash
pnpm vitest run src/ManagerAssistant.test.tsx -t "scheduled"
```

- [ ] **Step 3: Implement presentation and documentation**

Render a source badge for scheduled messages. Keep scheduled queue entries
read-only; show their failure and Retry using existing transcript behavior.
Document cadence, quiet hours, catch-up, notification, and opt-out semantics.
Apply one minor version bump across all required application and shell files.

- [ ] **Step 4: Run targeted validation**

Run:

```bash
pnpm vitest run server/manager-schedule.test.ts server/manager-agent.test.ts server/manager-store.test.ts server/manager-tools.test.ts server/manager-routes.test.ts src/App.test.tsx src/ManagerAssistant.test.tsx src/OracleSettings.test.tsx
```

- [ ] **Step 5: Run repository gates**

Run:

```bash
pnpm check
NODE_ENV=production pnpm check
python3 graphify/manage.py update
python3 graphify/manage.py check
```

Expected: all commands pass.

- [ ] **Step 6: Commit and open a review PR**

Stage only this worktree's files, commit with the required Copilot trailer,
push `feat/oracle-periodic-wake`, and open a PR referencing the tracking issue.
Do not merge or deploy.

