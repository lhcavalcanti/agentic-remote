# Copilot SDK CLI Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make normal Copilot SDK sessions execute discovered CLI configuration and close the destructive lifecycle gap without weakening single-owner guarantees.

**Architecture:** SDK clients come from one factory that defaults to the SDK-bundled runtime and accepts only a dedicated SDK executable override. Normal SDK session create/resume paths share explicit CLI-discovery options; destructive cleanup deletes provider identity directly, while ownership-preserving transitions still require detach.

**Tech Stack:** TypeScript 7, `@github/copilot-sdk` 1.0.22, Vitest 5, pnpm, Graphify

**Spec:** `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`

## Global Constraints

- Keep one owner per session; never attach SDK and tmux simultaneously.
- `COPILOT_BIN` remains the interactive tmux executable.
- SDK clients use the bundled runtime unless `COPILOT_SDK_BIN` is explicitly set.
- Normal SDK sessions enable configuration, skills, instructions, repository hooks, and host git discovery on create and resume.
- Oracle remains skills-disabled and exposes only its explicit tools.
- Agentic Remote state is removed only after provider deletion succeeds or proves the provider identity is already absent.
- Plugin/MCP installation, OAuth onboarding, configuration editing, MCP Apps, and CLI TUI emulation are out of scope.
- No credentials, paths, configuration, MCP arguments, login names, or raw provider errors may enter diagnostics.
- Bump all shipped versions from 1.21.0 to 1.22.0.

---

### Task 1: Centralize SDK Runtime Construction

**Files:**
- Create: `server/copilot-sdk-client.ts`
- Create: `server/copilot-sdk-client.test.ts`
- Modify: `server/agent-service.ts:1995-2021`
- Modify: `server/manager-runtime.ts:1-22`

**Interfaces:**
- Produces: `copilotSdkClientOptions(environment?: NodeJS.ProcessEnv): CopilotClientOptions`
- Produces: `createCopilotSdkClient(environment?: NodeJS.ProcessEnv): CopilotClient`
- Consumed by: `AgentService`, its side-question client factory, and `createManagerSdkClient`

- [ ] **Step 1: Write the failing factory tests**

```ts
import { describe, expect, it } from 'vitest'
import { copilotSdkClientOptions } from './copilot-sdk-client.js'

describe('copilotSdkClientOptions', () => {
  it('uses the SDK-bundled runtime by default', () => {
    const options = copilotSdkClientOptions({ COPILOT_BIN: '/interactive/copilot' })
    expect(options.connection).toBeUndefined()
    expect(options).toMatchObject({
      mode: 'copilot-cli',
      logLevel: 'error',
      useLoggedInUser: true,
    })
  })

  it('uses only the dedicated SDK executable override', () => {
    const options = copilotSdkClientOptions({
      COPILOT_BIN: '/interactive/copilot',
      COPILOT_SDK_BIN: '/sdk/copilot',
    })
    expect(options.connection).toBeDefined()
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm vitest run server/copilot-sdk-client.test.ts
```

Expected: FAIL because `server/copilot-sdk-client.ts` does not exist.

- [ ] **Step 3: Implement the factory**

```ts
import {
  CopilotClient,
  RuntimeConnection,
  type CopilotClientOptions,
} from '@github/copilot-sdk'

export function copilotSdkClientOptions(
  environment: NodeJS.ProcessEnv = process.env,
): CopilotClientOptions {
  const executable = environment.COPILOT_SDK_BIN?.trim()
  return {
    ...(executable
      ? { connection: RuntimeConnection.forStdio({ path: executable }) }
      : {}),
    mode: 'copilot-cli',
    logLevel: 'error',
    useLoggedInUser: true,
  }
}

export function createCopilotSdkClient(
  environment: NodeJS.ProcessEnv = process.env,
): CopilotClient {
  return new CopilotClient(copilotSdkClientOptions(environment))
}
```

Replace all three local SDK constructors with `createCopilotSdkClient()`.
Do not change `server/terminal-session.ts` or `server/app.ts`; they continue to
read `COPILOT_BIN`.

- [ ] **Step 4: Run focused tests**

Run:

```bash
pnpm vitest run server/copilot-sdk-client.test.ts server/manager-runtime.test.ts server/agent-service.test.ts -t "creates"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/copilot-sdk-client.ts server/copilot-sdk-client.test.ts \
  server/agent-service.ts server/manager-runtime.ts
git commit -m "fix: pair SDK clients with their bundled runtime" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 2: Enable Normal-Session CLI Configuration Discovery

**Files:**
- Modify: `server/copilot-sdk-client.ts`
- Modify: `server/copilot-sdk-client.test.ts`
- Modify: `server/agent-service.ts:270-310,3070-3150,7818-7900`
- Modify: `server/agent-service.test.ts:210-280` and normal create/resume tests

**Interfaces:**
- Produces: `COPILOT_SDK_SESSION_DISCOVERY: Readonly<Pick<SessionConfig, ...>>`
- Consumed by: normal SDK create, cold resume, and missing-session fallback create
- Does not apply to: Oracle/manager sessions

- [ ] **Step 1: Capture resume configuration in the fake**

Add:

```ts
readonly resumedConfigs: ResumeSessionConfig[] = []

async resumeSession(
  sessionId: string,
  config: ResumeSessionConfig,
): Promise<CopilotSessionLike> {
  this.resumedSessionIds.push(sessionId)
  this.resumedConfigs.push(config)
  if (this.resumeError) throw this.resumeError
  return this.session
}
```

- [ ] **Step 2: Write failing create/resume parity tests**

Create a shared expected object:

```ts
const cliDiscovery = {
  enableConfigDiscovery: true,
  enableSkills: true,
  enableOnDemandInstructionDiscovery: true,
  enableFileHooks: true,
  enableHostGitOperations: true,
}
```

Assert it is present in:

1. `client.createdConfigs[0]` after `service.createSession(directory, false)`;
2. `client.resumedConfigs[0]` after loading a persisted SDK session;
3. the fallback `createdConfigs` entry when resume reports a missing empty
   provider session.

Add an Oracle assertion in `server/manager-agent.test.ts` that its session
config remains `enableSkills: false` and does not contain
`enableConfigDiscovery: true`.

- [ ] **Step 3: Run the tests and verify they fail**

Run:

```bash
pnpm vitest run server/agent-service.test.ts server/manager-agent.test.ts \
  -t "configuration discovery|missing empty session|skills disabled"
```

Expected: FAIL because AgentService does not supply discovery options.

- [ ] **Step 4: Add and spread the immutable options**

In `server/copilot-sdk-client.ts`:

```ts
export const COPILOT_SDK_SESSION_DISCOVERY = {
  enableConfigDiscovery: true,
  enableSkills: true,
  enableOnDemandInstructionDiscovery: true,
  enableFileHooks: true,
  enableHostGitOperations: true,
} as const satisfies Partial<SessionConfig>
```

Spread it into:

- `createSdkSession`;
- `attachSdkSession`'s `resumeSession`;
- `attachSdkSession`'s missing-empty-session `createSession`.

Place the spread before explicit handlers/runtime values so Agentic Remote's
session-specific values remain authoritative.

- [ ] **Step 5: Run focused parity/resource tests**

Run:

```bash
pnpm vitest run \
  server/agent-service.test.ts \
  server/manager-agent.test.ts \
  server/session-resource-providers.test.ts \
  server/session-resource-transport.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add server/copilot-sdk-client.ts server/copilot-sdk-client.test.ts \
  server/agent-service.ts server/agent-service.test.ts server/manager-agent.test.ts
git commit -m "feat: load CLI configuration in SDK sessions" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 3: Make Destructive SDK Cleanup Independent of Detach

**Files:**
- Modify: `server/agent-service.ts:1849-1880,6845-6925`
- Modify: `server/agent-service.test.ts`
- Test: `server/session-admission-lifecycle.test.ts`
- Test: `server/session-clear-transcript.test.ts`

**Interfaces:**
- Produces: `deleteSdkProviderIdentity(id: string): Promise<void>`
- Consumed by: failed creation/replacement cleanup and user deletion
- Preserves: `disconnect()` requirement for suspension and SDK-to-tmux migration

- [ ] **Step 1: Make the fake independently fail detach and delete**

Add `disconnectError?: Error` to `DeferredSession` and
`deleteError?: Error` to `FakeCopilotClient`:

```ts
async disconnect() {
  this.disconnectCount += 1
  if (this.disconnectError) throw this.disconnectError
}

async deleteSession(sessionId: string) {
  this.deletedSessionIds.push(sessionId)
  if (this.deleteError) throw this.deleteError
}
```

- [ ] **Step 2: Write the #389 failing regression**

```ts
it('deletes an SDK session without detaching it first', async () => {
  const detach = Object.assign(
    new Error('Unhandled method session.detach'),
    { code: -32601 },
  )
  client.session.disconnectError = detach
  const created = await service.createSession(directory, false)

  await service.deleteSession(created.id)

  expect(client.session.disconnectCount).toBe(0)
  expect(client.deletedSessionIds).toContain(created.id)
  expect(store.get(created.id)).toBeUndefined()
})
```

- [ ] **Step 3: Write provider-delete failure and ownership tests**

Add tests proving:

- `client.deleteSession` failure rejects and leaves `store.get(id)` present;
- SDK-to-tmux activation with `disconnectError` rejects and never calls
  `terminalController.reopen`;
- suspension with `disconnectError` rejects and leaves the session unsuspended;
- failed creation cleanup calls provider deletion without first detaching.

- [ ] **Step 4: Run and verify failures**

Run:

```bash
pnpm vitest run server/agent-service.test.ts \
  server/session-admission-lifecycle.test.ts \
  server/session-clear-transcript.test.ts \
  -t "without detaching|provider deletion|failed detach|creation cleanup"
```

Expected: the new destructive-cleanup tests FAIL; existing ownership tests
remain green.

- [ ] **Step 5: Implement provider-authoritative deletion**

Add:

```ts
private async deleteSdkProviderIdentity(id: string): Promise<void> {
  try {
    await this.client.deleteSession(id)
  } catch (error) {
    if (!isMissingSessionError(error)) throw error
  }
  this.sessions.delete(id)
  this.hydratedSessions.delete(id)
  this.loadingSessions.delete(id)
  this.hydratingSessions.delete(id)
  this.pendingSessionMetadata.delete(id)
}
```

Update `disposeSdkIdentity` to call this method without `session.disconnect()`.
In `deleteSerialized`, SDK-backed sessions abort active work but defer owner
removal to `deleteSdkProviderIdentity`; terminal-backed sessions retain their
existing disconnect and provider-file cleanup path.

Do not alter `retireSdkOwnerForTerminalActivation`,
`suspendClaimedSession`, or other identity-preserving paths.

- [ ] **Step 6: Run lifecycle suites**

Run:

```bash
pnpm vitest run \
  server/agent-service.test.ts \
  server/session-admission-lifecycle.test.ts \
  server/session-clear-transcript.test.ts \
  server/session-reply-durability.test.ts \
  server/queued-provider-dispatch.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add server/agent-service.ts server/agent-service.test.ts \
  server/session-admission-lifecycle.test.ts server/session-clear-transcript.test.ts
git commit -m "fix: delete SDK identities without detach" \
  -m "Fixes #389" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 4: Add Sanitized Runtime Diagnostics

**Files:**
- Modify: `server/copilot-sdk-client.ts`
- Modify: `server/copilot-sdk-client.test.ts`
- Modify: `server/agent-service.ts:296-310,2253-2280`

**Interfaces:**
- Produces: `readCopilotSdkRuntimeDiagnostic(client): Promise<CopilotSdkRuntimeDiagnostic | undefined>`
- Consumes optional: `getStatus()` and `getAuthStatus()` on `CopilotClientLike`
- Output fields: `runtimeVersion`, `protocolVersion`, `authenticated`, `authType`

- [ ] **Step 1: Write diagnostic sanitization tests**

Test that the helper returns only:

```ts
{
  runtimeVersion: '1.0.98',
  protocolVersion: 3,
  authenticated: true,
  authType: 'gh-cli',
}
```

even when the source auth object also contains `login`, `host`, and
`statusMessage`. Test that absent methods return `undefined` without throwing.

- [ ] **Step 2: Run and verify failure**

Run:

```bash
pnpm vitest run server/copilot-sdk-client.test.ts -t "diagnostic"
```

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement and call the helper**

Extend `CopilotClientLike` with optional status/auth methods. After
`client.start()`, read diagnostics and emit one fixed-format `console.info`
line containing only the sanitized fields. Catch diagnostic failure with a
fixed warning that does not interpolate the provider error.

- [ ] **Step 4: Run focused tests**

Run:

```bash
pnpm vitest run server/copilot-sdk-client.test.ts server/agent-service.test.ts \
  -t "diagnostic|starts"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/copilot-sdk-client.ts server/copilot-sdk-client.test.ts \
  server/agent-service.ts server/agent-service.test.ts
git commit -m "feat: report sanitized Copilot SDK runtime status" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 5: Document, Version, Validate, and Publish

**Files:**
- Modify: `docs/app-spec.md`
- Modify: `docs/provider-compatibility.md`
- Modify: `docs/sdk-architecture-roadmap.md`
- Modify: `package.json`
- Modify: `shell/package.json`
- Modify: `shell/src-tauri/tauri.conf.json`
- Modify: `shell/src-tauri/Cargo.toml`
- Modify: `shell/src-tauri/Cargo.lock`
- Modify: `shell/README.md`
- Modify: generated Graphify files

**Interfaces:**
- Consumes all previous tasks
- Produces release 1.22.0 and a PR linked to #443 and #389

- [ ] **Step 1: Update normative and compatibility documentation**

State once that normal SDK sessions enable CLI configuration discovery, use the
SDK-bundled runtime by default, share the logged-in account/Copilot home, and
retain read-only Skills/MCP views. Document `COPILOT_SDK_BIN` as an advanced
override and keep installation/OAuth/TUI management out of scope.

- [ ] **Step 2: Bump every shipped version**

Change 1.21.0 to 1.22.0 in the six version-bearing files listed above. Run:

```bash
pnpm vitest run server/version-policy.test.ts
```

Expected: PASS.

- [ ] **Step 3: Refresh Graphify**

Stage the new source file before generation, then run:

```bash
git add server/copilot-sdk-client.ts server/copilot-sdk-client.test.ts
python3 graphify/manage.py update
python3 graphify/manage.py check
```

Expected: graph current.

- [ ] **Step 4: Run targeted and complete gates**

Run:

```bash
pnpm vitest run \
  server/copilot-sdk-client.test.ts \
  server/agent-service.test.ts \
  server/manager-agent.test.ts \
  server/manager-runtime.test.ts \
  server/session-resource-providers.test.ts \
  server/session-resource-transport.test.ts \
  server/session-admission-lifecycle.test.ts \
  server/session-clear-transcript.test.ts \
  server/session-reply-durability.test.ts \
  server/queued-provider-dispatch.test.ts \
  server/version-policy.test.ts
pnpm check
NODE_ENV=production pnpm check
```

Expected: all pass, with only documented baseline warnings.

- [ ] **Step 5: Run the isolated no-turn lifecycle probe**

Using fixed temporary Copilot homes, verify:

- SDK 1.0.22 bundled runtime reports 1.0.98/protocol 3 and passes detach/delete;
- system CLI 1.0.100 override reports its actual runtime and deletion remains
  safe even when detach is unsupported;
- both authenticate through the existing GitHub CLI credential;
- every synthetic session and temporary home is removed.

- [ ] **Step 6: Commit documentation/version/generated files**

```bash
git add docs package.json shell graphify
git commit -m "release: prepare SDK CLI parity" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

- [ ] **Step 7: Push and open the PR**

```bash
git push -u origin feat/sdk-cli-parity
```

Create a concise PR body with:

```text
Fixes #443
Fixes #389
```

Include the bundled/system lifecycle evidence, focused/full gate results,
state-neutral rollback, and the deliberate management exclusions.

- [ ] **Step 8: Review, merge, and roll out**

Wait for Supervisor's exact-head verdict. Address findings holistically,
rerun affected checks, and do not approve the PR automatically. After user
approval and Supervisor `APPROVE`, merge, deploy the exact commit to
development, exercise SDK config discovery/lifecycle through the hub, then
promote to production under the repository policy.
