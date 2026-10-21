# Copilot SDK CLI-Configuration and Lifecycle Parity

Status: Approved for implementation
Tracking: #443, #389

## Goal

Normal Copilot SDK sessions must execute with the same discovered local
configuration classes as Copilot CLI sessions—project and personal skills,
MCP servers, Open Plugins assets, custom agents, custom instructions, and
repository hooks—without acquiring terminal ownership or exposing sensitive
configuration through Agentic Remote.

The SDK lifecycle must also remain correct when the independently installed
interactive CLI is protocol-incompatible with the installed SDK package.

## Decisions

1. **Keep the hybrid backend.** SDK sessions remain web-owned and tmux sessions
   remain terminal-owned. A session has one provider owner at a time.
2. **Use the SDK-bundled runtime by default for SDK clients.** The SDK package
   and bundled runtime are released and tested together. `COPILOT_BIN` remains
   the executable for interactive tmux sessions and the startup canary.
   `COPILOT_SDK_BIN` is a deliberate operator override for SDK clients.
3. **Use the existing logged-in account and Copilot home.** SDK clients retain
   `useLoggedInUser: true`, `mode: "copilot-cli"`, and the default
   `COPILOT_HOME`. No credential or state copy is introduced.
4. **Enable configuration execution explicitly for normal SDK sessions.**
   Create, cold resume, and same-ID fallback creation set
   `enableConfigDiscovery`, `enableSkills`,
   `enableOnDemandInstructionDiscovery`, `enableFileHooks`, and
   `enableHostGitOperations` to `true`.
5. **Do not broaden Oracle authority.** Oracle keeps its separate runtime,
   explicit tools, and `enableSkills: false`; changing the runtime factory must
   not enable project plugins, MCP tools, skills, hooks, or shell tools there.
6. **Delete provider state instead of detaching before destructive cleanup.**
   `session.delete` is the authority for SDK-backed deletion. Agentic Remote
   removes its stored session only after provider deletion succeeds. Operations
   that retain provider state—suspend, move to tmux, restart, or reconfigure—
   still require a successful detach and fail closed otherwise.
7. **Keep management out of this change.** Plugin/MCP installation, removal,
   OAuth onboarding, configuration editing, MCP Apps rendering, and exact CLI
   TUI emulation require separate security and UX designs.

## Evidence for the Runtime Split

The locked dependency is `@github/copilot-sdk` 1.0.22, whose bundled runtime is
Copilot CLI 1.0.98. A no-turn, isolated lifecycle probe used a temporary
`COPILOT_HOME` and the existing GitHub CLI authentication:

| Runtime | Reported version | `session.detach` | `session.delete` |
| --- | --- | --- | --- |
| SDK-bundled | 1.0.98 / protocol 3 | succeeded | succeeded |
| `/usr/local/bin/copilot` 1.0.100 | 1.0.71 / protocol 3 | `Unhandled method session.detach` | succeeded |

Both paths reported authenticated `gh-cli` credentials. The probe created no
turn, deleted each synthetic session, force-stopped its isolated runtime, and
removed its fixed temporary Copilot home.

This proves that package version, executable release, runtime-reported version,
and protocol number are distinct. Protocol 3 alone cannot qualify every method.
It also shows that using the SDK-bundled runtime fixes #389 without weakening
the detach requirement for ownership-preserving operations.

## Components

### SDK client factory

Create `server/copilot-sdk-client.ts` as the sole constructor for local Copilot
SDK clients. It returns `CopilotClientOptions` and a `CopilotClient`, using:

- the SDK-bundled runtime when `COPILOT_SDK_BIN` is empty;
- `RuntimeConnection.forStdio({ path: COPILOT_SDK_BIN })` only for an explicit
  override;
- `mode: "copilot-cli"`, `logLevel: "error"`, and `useLoggedInUser: true`.

`AgentService`, side questions, and Oracle use the factory. Tests can inspect
the pure options builder without starting a runtime.

### Normal-session configuration

Create one exported immutable normal-session discovery object and spread it
into every normal SDK create/resume call. This avoids create/resume drift:

```ts
{
  enableConfigDiscovery: true,
  enableSkills: true,
  enableOnDemandInstructionDiscovery: true,
  enableFileHooks: true,
  enableHostGitOperations: true,
}
```

Explicit Agentic Remote handlers and runtime selections continue to take
precedence. `requestExtensions` and `enableMcpApps` stay off because the
application has no renderer or management surface for them. Existing MCP
servers may use already-configured credentials; new OAuth onboarding is not
claimed.

The existing Skills and MCP views remain read-only and sanitized. Live SDK
metadata is still preferred; workspace discovery remains the honest fallback
for unloaded, suspended, and tmux sessions.

### Destructive SDK lifecycle

For an SDK-backed session, deletion performs:

1. stop new admissions and wait for in-flight delivery/reply persistence;
2. abort an active prompt when necessary;
3. resolve pending permissions/questions as unavailable or cancelled;
4. call `client.deleteSession(sessionId)`;
5. remove the local SDK owner and Agentic Remote state only after step 4
   succeeds or reports an already-missing provider identity.

Failed-creation and replacement cleanup use the same provider-delete primitive.
They do not require `session.detach` before deleting the identity.

Suspend, SDK-to-tmux migration, and any operation that keeps the provider
identity call `disconnect()` and must fail if detach is unsupported or
uncertain. Agentic Remote never starts a tmux owner after a failed detach.

### Diagnostics

At SDK startup, query the optional SDK status/auth methods when available and
log only:

- runtime version;
- protocol version;
- authenticated boolean and authentication type.

Never log login names, hosts, tokens, configuration, paths, MCP arguments,
environment values, or raw provider errors. Diagnostics are best-effort and do
not turn a functioning older fake or node implementation into a startup
failure.

## Error and Recovery Semantics

- Configuration discovery failure during session create/resume is a provider
  failure; do not silently retry with discovery disabled.
- A missing optional read-only resource RPC remains `unsupported`, not an empty
  catalog.
- Provider deletion failure leaves the Agentic Remote record visible and
  retryable.
- Already-missing provider state may complete local deletion.
- Failed detach leaves the SDK session as owner and prevents tmux activation.
- Service restart keeps the existing stale-callback behavior: persisted SDK
  approval/question cards cannot resume dead callbacks and return `409`.
- No stored-state migration is required. Rollback reactivates the prior release
  against the same session IDs and provider home.

## Testing

Use test-driven changes:

1. client-factory tests prove bundled-by-default behavior and the dedicated
   override without changing `COPILOT_BIN`;
2. AgentService tests capture create, resume, and fallback-create configs and
   require all normal-session discovery flags;
3. Oracle tests require `enableSkills: false` and no normal-session discovery
   spread;
4. deletion tests reproduce #389: detach rejects as unsupported, provider
   delete succeeds, and local deletion completes;
5. provider-delete failure tests prove the local record remains;
6. migration/suspension tests prove failed detach never starts tmux;
7. startup diagnostics tests prove sanitization and compatibility with clients
   that omit status/auth methods;
8. the isolated no-turn bundled/system lifecycle probe is repeated as
   development evidence;
9. targeted resource/lifecycle suites, `pnpm check`,
   `NODE_ENV=production pnpm check`, and Graphify freshness must pass.

## Versioning and Rollout

This is a shipped feature and runtime-behavior change, so bump application and
shell versions from 1.21.0 to 1.22.0.

Deploy the PR commit to development first. Exercise:

- bundled runtime authentication;
- create/delete of a disposable SDK session;
- project skill discovery from a synthetic working folder;
- Skills/MCP read-only views;
- SDK-to-tmux handoff;
- restart with sessions preserved;
- paired computers still online and `/health` healthy.

The change is reversible and does not migrate stored state, so after
development proves the behavior, promote the exact commit to production under
the existing policy. Roll back if runtime startup, session ownership, or
provider deletion fails.
