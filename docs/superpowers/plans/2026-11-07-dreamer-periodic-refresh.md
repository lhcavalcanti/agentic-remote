# Dreamer Periodic Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Dreamer the single owner of periodic work: an in-memory session
progress cache that keeps Oracle current, plus follow-up upkeep. Remove the
undeployed Periodic checks.

**Architecture:**
- A pure-ish `DreamerProgress` class merges hub events and periodic authoritative
  listings and reads into bounded entries.
- `DreamerService` owns the 5-minute timer, fencing and upkeep: it reconciles
  tasks and runs a coordinator sweep.
- `buildTurnContext` renders an escaped, bounded view supplied through a
  `ManagerAgent` callback.

**Tech Stack:** TypeScript, Fastify, React 19, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-07-dreamer-periodic-refresh-design.md`

## Global Constraints

- Branch `feat/dreamer-periodic-refresh` from `origin/main` (`714f07d`), in
  `~/src/agentic-remote-worktrees/dreamer-periodic-refresh`.
- No merge, deploy, restart, force-push, or credential change. Open the PR with
  `Fixes #511`.
- The refresh makes no model call and persists no session text. Dreamer off
  means no cache, no timer, and an unchanged Oracle context.
- Fixed limits:

  | Limit | Value |
  |---|---|
  | Refresh interval | 5 min |
  | Excerpt length | 300 chars |
  | Open entries | 200 |
  | Closed entries | 20 |
  | Closed retention | 24 h |
  | Reads per refresh | 12 |
  | Read concurrency | 3 |
  | Read timeout | 10 s |
  | Read retry | 15 min |
  | Rendered quote | 160 chars |
  | Closed sessions shown | 5 |
  | Follow-ups shown | 8 |

- Bump the version from 1.39.0 to 1.40.0 everywhere the version-policy test checks.

---

### Task 1: Remove Periodic checks

**Files:**
- Delete: `server/manager-schedule.ts`, `server/manager-schedule.test.ts`
- Modify: `server/manager-agent.ts`, `server/manager-routes.ts`,
  `server/manager-store.ts`, `server/manager-context.ts`, `server/manager-tools.ts`,
  `shared/manager.ts`, `shared/notifications.ts`, `src/OracleSettings.tsx`,
  `src/use-oracle-settings.ts`, `src/App.tsx`, `src/ManagerAssistant.tsx`
- Tests: `server/manager-agent.test.ts`, `server/manager-routes.test.ts`,
  `server/manager-store.test.ts`, `server/manager-context.test.ts`,
  `server/manager-tools.test.ts`, `shared/notifications.test.ts`,
  `src/OracleSettings.test.tsx`, `src/ManagerAssistant.test.tsx`, `src/App.test.tsx`

**Interfaces:**
- Produces: `ManagerMessageSource = 'typed' | 'voice' | 'proactive' | 'task'`.
  `ManagerSettingsSnapshot` and `UpdateManagerSettingsInput` lose `proactive`.
  `ManagerState` loses `proactive`. `updateMessage` still sets
  `suppressNotification` for terminal proactive messages.

- [x] Delete the scheduled-check tests and assertions. Add a store test: a
  `state.json` containing `proactive` loads, and the next write omits it.
- [x] Run `pnpm vitest run server/manager-store.test.ts -t proactive`. Expected:
  FAIL, because the legacy field is kept.
- [x] Remove the code. In `ManagerStore.initialize`, delete the legacy field:

```ts
const { proactive: _legacyPeriodicChecks, ...current } =
  (state ?? {}) as Partial<ManagerState> & { proactive?: unknown }
this.current = { ...emptyState(), ...current }
```

- [x] Run `pnpm vitest run server/manager-*.test.ts shared/notifications.test.ts src/OracleSettings.test.tsx src/ManagerAssistant.test.tsx src/App.test.tsx`.
  Expected: PASS.
- [x] Commit: `refactor: remove undeployed Oracle periodic checks`.

### Task 2: Progress cache

**Files:**
- Create: `server/dreamer-progress.ts`, `server/dreamer-progress.test.ts`

**Interfaces:**
- Produces:

```ts
export const DREAMER_PROGRESS_REFRESH_MS = 5 * 60_000 // moved to shared/dreamer.ts in Task 5
export interface DreamerProgressLimits { excerptLength: number; openEntries: number;
  closedEntries: number; closedRetentionMs: number; readsPerRefresh: number;
  readConcurrency: number; readTimeoutMs: number; readRetryMs: number }
export interface DreamerProgressEntry { computerId: string; sessionId: string;
  computerName: string; title: string; status: SessionStatus; isOpen: boolean;
  revision: number; updatedAt: string;
  latest?: { excerpt: string; at: string; taskComplete: boolean };
  request?: { kind: 'question' | 'permission'; excerpt: string };
  detail?: { revision: number; updatedAt: string };
  closedAt?: string; retryReadAt?: string }
export interface DreamerProgressSnapshot { refreshedAt?: string;
  staleComputers: { id: string; name: string }[]; entries: DreamerProgressEntry[] }
export interface DreamerProgressSource {
  listSessionsWithAuthority(): Promise<{ sessions: ManagedSession[]; answeredComputerIds: string[] }>
  listComputers(): Pick<ComputerSummary, 'id' | 'name'>[]
  readSession(computerId: string, sessionId: string): Promise<ManagedSession> }
export class DreamerProgress {
  constructor(source: DreamerProgressSource, options?: { now?: () => Date; limits?: Partial<DreamerProgressLimits> })
  applyEvent(event: HubEvent): void
  refresh(): Promise<{ authoritative: ManagedSession[] } | undefined> // undefined when fenced
  clear(): void
  snapshot(): DreamerProgressSnapshot }
```

- [x] Write failing tests for each of these:
  1. A full event sets `latest` from the last non-empty assistant message, with
     its time and `taskComplete`. It sets `request` from a pending question or
     permission.
  2. A `summary: true` event updates status without touching excerpts.
  3. An older event is ignored. An equal revision with a newer `updatedAt`
     applies.
  4. `session.removed` with `replacedBy` drops the entry, and without it the
     entry is closed.
  5. A listing from a computer that answered closes an open entry once two
     consecutive answers omit it, and an event that arrived while the listing
     was in flight wins over it. An unanswered computer keeps its entries and
     is reported in `staleComputers`. Unregistered computers are dropped.
  6. A listing from a computer that answered with a lower revision starts the
     entry over, dropping its excerpts so it is read again.
  7. Read selection:
     - only stale transcripts on computers that answered are read;
     - waiting or error first, then running, then newest;
     - at most `readsPerRefresh`, and never more than `readConcurrency` at once.
  8. A read that never settles times out after `readTimeoutMs`. Its entry gets
     `retryReadAt` and is skipped until then.
  9. A read result older than a newer event is discarded, and a read never
     reopens a session an event closed meanwhile.
  10. `clear()` during a refresh makes it resolve `undefined` without
      repopulating the cache.
  11. Pruning:
      - closed entries older than 24 h are dropped;
      - beyond 20 closed or 200 open, the oldest go first.
  12. Excerpts collapse whitespace and are cut at the limit with `…`.
- [x] Run `pnpm vitest run server/dreamer-progress.test.ts`. Expected: FAIL
  (missing module).
- [x] Implement the class, with helpers `transcriptProgress(session, limit)` and
  `notOlder(a, b)`, the exported `mapWithConcurrency` from `computer-manager.ts`,
  and a timeout that wraps each read.
- [x] Run the same file. Expected: PASS.
- [x] Commit: `feat: add Dreamer session progress cache`.

### Task 3: Dreamer refresh lifecycle and lifecycle sweep

**Files:**
- Modify: `server/dreamer-service.ts`, `server/manager-proactive-coordinator.ts`,
  `server/app.ts`, `shared/dreamer.ts`
- Tests: `server/dreamer-service.test.ts`,
  `server/manager-proactive-coordinator.test.ts`, `server/dreamer-app.test.ts`

**Interfaces:**
- Consumes: Task 2 `DreamerProgress` and `DreamerProgressSource`.
- Produces:
  - `DreamerServiceOptions` gains:
    - `progressSource?: DreamerProgressSource`
    - `progressRefreshMs?: number`
    - `progressLimits?: Partial<DreamerProgressLimits>`
    - `sweepLifecycle?: (sessions: ManagedSession[]) => Promise<void>`
  - `DreamerService` gains:
    - `handleHubEvent(event: HubEvent): void`
    - `refreshProgress(): Promise<void>`
    - `progressView(): DreamerProgressView | undefined`
  - The progress view has this shape:

    ```ts
    DreamerProgressView = DreamerProgressSnapshot & {
      followUps: { title: string; owner: OracleTaskOwner; status: OracleTaskStatus; nextAction: string }[]
    }
    ```

  - `ManagerProactiveCoordinator.sweep(sessions: readonly ManagedSession[]): Promise<void>`.
  - The shared snapshot gains this field, present only while enabled:

    ```ts
    DreamerSnapshot.progress?: {
      refreshedAt?: string
      nextRefreshAt?: string
      staleComputers: string[]
      error?: string
    }
    ```

- [x] Write failing service tests:
  1. `start()` with Dreamer enabled refreshes once and arms an interval of
     `progressRefreshMs`. With Dreamer disabled it does neither.
  2. Enabling refreshes, and disabling clears the cache, stops the timer and
     drops `progress` from the snapshot.
  3. A refresh in flight during disable or `stop()` publishes nothing and runs
     no upkeep.
  4. A listing that throws sets `progress.error`, keeps the morning-plan timer
     active, and the next tick clears the error.
  5. Upkeep runs `sweepLifecycle` with the authoritative sessions and
     reconciles tasks. A failed listing still reconciles tasks but does not
     sweep.
  6. Concurrent `refreshProgress()` calls share one run.
  7. `progressView()` lists open tasks only, with `undefined` when disabled.
  8. `handleHubEvent` is ignored while disabled.
- [x] Write failing coordinator tests. `sweep` admits a missed `finished`
  transition once (a second sweep with the same revision admits nothing). It is
  a no-op when disabled.
- [x] Implement:
  - A second unref'd interval, `progressTimer`. It is started by `start()` and
    by enabling `updateSettings`, and stopped by `stop()`, by disabling, and by
    `markScheduledFailure`.
  - Single-flight `refreshProgress` fenced by its own `progressGeneration`,
    since a timezone change bumps `lifecycleGeneration` without stopping it.
  - A safe error `'Dreamer could not refresh session progress.'`.
  - `progress` in `snapshot()`.
- [x] Wire `server/app.ts`:
  - `progressSource` comes from `ComputerManager`.
  - `sweepLifecycle` calls `proactiveCoordinator?.sweep`.
  - The hub event listener calls `dreamerService.handleHubEvent(event)` before
    reconciling tasks.
- [x] Run `pnpm vitest run server/dreamer-service.test.ts server/manager-proactive-coordinator.test.ts server/dreamer-app.test.ts`.
  Expected: PASS.
- [x] Commit: `feat: refresh session progress and follow-ups from Dreamer`.

### Task 4: Oracle context

**Files:**
- Modify: `server/manager-context.ts`, `server/manager-agent.ts`, `server/app.ts`
- Tests: `server/manager-context.test.ts`, `server/manager-agent.test.ts`

**Interfaces:**
- Consumes: Task 3 `DreamerProgressView`.
- Produces:
  - `TurnContextInput.progress?: DreamerProgressView`
  - `rosterLine(session, entry, now, progress?: DreamerProgressEntry)`
  - `ManagerAgentOptions.progressContext?: () => DreamerProgressView | undefined`

- [x] Write failing context tests:
  1. An idle session shows `last reply HH:MM: "…"`, or
     `last reply HH:MM (task complete): "…"`.
  2. A running session that reports activity shows `doing:` and no last reply.
  3. A waiting session shows `asks: "…"`. The cached request is hidden once the
     live status is no longer waiting.
  4. `<`, `>`, `&` and `"` in excerpts are escaped, and quotes are cut at 160
     characters.
  5. The section shows the refresh time, unreachable computers, at most 5
     closed sessions, and at most 8 follow-ups plus an omitted count.
  6. Before the first refresh it reads `Dreamer progress: not refreshed yet.`
  7. Without `progress`, the output equals today's.
- [x] Write a failing agent test. A typed turn's prompt includes the Dreamer
  progress section. A proactive turn's prompt does not. A throwing
  `progressContext` still completes the turn.
- [x] Implement it, and update the "Context you receive" bullet in the system
  prompt.
- [x] Run `pnpm vitest run server/manager-context.test.ts server/manager-agent.test.ts`.
  Expected: PASS.
- [x] Commit: `feat: show Dreamer session progress in Oracle context`.

### Task 5: Dreamer UI

**Files:**
- Modify: `src/OracleDreamer.tsx`, `src/styles.css` (only if a new class is needed)
- Test: `src/OracleDreamer.test.tsx`

**Interfaces:**
- Consumes: `DreamerSnapshot.progress`.

- [x] Write failing tests:
  1. The settings copy mentions the 5-minute session progress refresh.
  2. The settings status shows the refresh time, unreachable computer names,
     and a refresh error.
  3. The Morning plan panel shows `Session progress updated <time>`, the
     unreachable computers and a refresh error, and nothing when `progress` is
     absent.
- [x] Move `DREAMER_PROGRESS_REFRESH_MS` to `shared/dreamer.ts` so the copy
  derives from it. Implement a `SessionProgressStatus` component used in both
  places. Times use `sessionActivityTime` (a time today, otherwise a date) in a
  `<time>` element titled with the full local time.
- [x] Run `pnpm vitest run src/OracleDreamer.test.tsx`. Expected: PASS.
- [x] Commit: `feat: show Dreamer progress refresh status`.

### Task 6: Docs, version, graph, gate

**Files:**
- Modify:
  - `docs/app-spec.md`
  - `docs/design/oracle-dreamer.md`
  - `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
  - `docs/superpowers/plans/2026-11-04-oracle-periodic-checks.md`
  - this plan and its spec, for what changed during implementation
  - the version files
  - `graphify/*`

- [x] Update `docs/app-spec.md`. Remove the Periodic checks bullets and the
  Scheduled check label. Add the Dreamer refresh, the cache bounds, Oracle
  context, upkeep and failure rules to the Dreamer section.
- [x] Update `docs/design/oracle-dreamer.md`:
  - Add a phase: "Periodic progress refresh".
  - Add the second content-read exception, an in-memory excerpt cache.
  - Add the API field.
  - Narrow follow-up 2 to history collection.
- [x] Add a "Superseded by #511" line to the Periodic checks spec and plan.
- [x] Bump the version to 1.40.0, then run the version-policy test.
- [x] Update graphify, then run `pnpm check` and `NODE_ENV=production pnpm check`.
- [x] Commit: `docs: describe Dreamer periodic refresh` and `chore: release 1.40.0`.
