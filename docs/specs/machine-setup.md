# Machine setup and operations

Reference baseline: application **1.1.0**, commit
`15a043e57234f7addfd8160f990dd22b38f1882a`, reviewed September 9, 2026.
This describes checked-in behavior, policy, and verification limits, not any
machine's live configuration. Commands are operator procedures, not audit actions.
The [publication delta](../reviews/2026-09-09/code-and-issues.md) records v1.1.1;
it did not change the installation/promotion implementation reviewed here.

See [installation](../../README.md), [promotion](../deployment-promotion.md),
[rollout policy](../../.github/copilot-instructions.md), and [native design](../native-shell.md).
Implementation determines what commands do; policy determines whether to run them.

## 1. Supported installation and toolchain

- The installer targets **Linux with systemd user services**: Bash, GNU-style
  `readlink`/`find`/`sort`/`mv`, `install`, `sed`, Git, Node, pnpm, systemctl/loginctl.
- Terminal discovery/tests additionally depend on Linux `/proc`, `ps`, `tmux`,
  and `stty`; this is not a portable Windows/macOS server-install contract.
- Use the locked package manager: root `package.json` selects **pnpm 10.34.5**.
  Root setup installs with `CI=true` and `--frozen-lockfile`; it does not install
  Node, pnpm, provider CLIs, tmux, Whisper, or an upstream access service.
- The former README minimum, “Node.js 22+”, was too broad for the complete locked gate.
  `jsdom@30.0.1` requires `^22.22.2 || ^24.15.0 || >=26.0.0`.
  Select a compatible release, such as Node 24.15+ within 24.x; this is an
  engine-range inference, not a multi-version execution result.
- The optional monitor additionally requires Corepack, Python 3, `flock`, and
  `curl`; downstream use requires non-interactive SSH. GitHub CLI is needed only
  if the machine's existing Git credential helper depends on it.
- GitHub Copilot CLI must be installed even for a planned Claude-only setup:
  `setup_service` requires `copilot` and records its executable in the unit.
  Authenticate providers as the service account through their own tooling.
- tmux is optional for SDK-only use. Claude Agent is optional and SDK-only;
  its default executable is `$HOME/.local/bin/claude`, overridable by
  `CLAUDE_BIN`. Provider availability is per computer, not inherited from a hub.
- Packaged audio verification currently covers **linux-x64 only**. Other
  platforms need deliberate media support work or explicitly managed binaries;
  an installed npm package alone does not establish transcription support.
- Graphify is optional developer tooling: queries/generation need Python 3.12+;
  freshness checking does not require the locked tool environment.

## 2. Role, channel, and access are separate decisions

| Concept | Meaning |
| --- | --- |
| Hub | Serves UI and `/api/*`; owns its own local sessions and hub metadata. |
| Node | Runs its own sessions and authenticated `/node-api/*`; no browser UI. |
| Development | Writable source and validation work; not a public serving path. |
| Production runtime source | Separate, clean source used to publish releases. |
| Active release | Immutable bundle selected by `releases/current`. |
| Native shell | Client of a hub; neither a hub nor a node; owns no sessions. |

`--host` selects the bind, not role/channel/authentication. The stock CLI has
**one installation per user HOME**; changing role replaces it. Independent runtimes
need deliberate isolation. A validation worktree is not a verified development runtime.

The hub has **no built-in user login**. Protect all HTTP/WebSocket routes with
TLS and an authenticated proxy, or an equivalently restricted private encrypted
network. Keep nodes off the public internet. Tunnels, authentication, certificates,
firewall rules, and tunnel boot supervision are machine-local, not installed by setup.

The hub checks actual `Host` and, when present, `Origin` on `/api/` routes,
including the event WebSocket. This blocks rebinding; it is not authentication.
No-Origin clients still need an allowed actual Host; forwarded headers are not
a substitute. Explicit comma-separated `AGENTIC_REMOTE_ALLOWED_ORIGINS` replaces
fallback policy, including implicit loopback; include every origin actually used.
Setup derives bind-host, localhost, and IPv4-loopback origins when none is supplied.
Direct startup without an explicit list derives HOST:PORT and permits loopback.
Malformed configured origins fail hub startup. A wildcard bind is not a wildcard
API allowlist. `/health` is outside this hook; `/api/health` is not.

## 3. Install, pair, and verify

Select the service account, role, bind/port, private routing, data location, and
separate development/runtime-source paths. Obtain reviewed source independently
on each machine; do not copy another machine's checkout, credentials, identity,
or provider state. Ensure clean intended source and a usable non-interactive toolchain.

For a hub behind a same-machine authenticated proxy, a generic starting point is:

```bash
cd /path/to/runtime-source
git status --short
node --version
pnpm --version
command -v copilot systemctl loginctl
AGENTIC_REMOTE_ALLOWED_ORIGINS="https://agents.example.com,http://localhost:4317,http://127.0.0.1:4317" \
  ./bin/agentic-remote setup --role hub --name hub --host 127.0.0.1 --port 4317
```

Replace the example origin/paths. Remote computers cannot reach a loopback-only
listener; use a LAN bind only within the planned access boundary. Setup installs,
builds, publishes, writes settings/unit, restarts, and tries linger.
It does **not** run lint/tests or prove behavior.

On an additional computer, choose a hub-reachable private bind and port:

```bash
./bin/agentic-remote setup --role node --name worker \
  --host "$NODE_BIND" --port "$NODE_PORT"
```

`NODE_BIND` and `NODE_PORT` above are operator-selected values, not auto-discovery.
An operator may then run `agentic-remote pair-info` **on that node**. It prints a
secret pairing token: do not run it for routine diagnostics or retain its output
in issues, screenshots, logs, or review artifacts. Enter the final node URL and
token in the hub's **Sessions → Manage computers** dialog over the trusted path.
Authorized pairing stores the node credential in the hub registry; this does
not authorize cloning identity/state directories during deployment.
Use the final HTTP(S) URL: node requests refuse redirects rather than forwarding
credentials/bodies. The original action may still have happened; inspect before retrying.

Verify service activity, `GET /health` at the actual bind, and the expected role.
On a hub, check `/api/health`, `/api/version`, and the computer list with an
allowed Host. A node returning `404` at `/` or `/api/health` is expected.
Through the hub, confirm the paired computer is online, create a synthetic
session on the intended owner, send/receive a harmless prompt, and exercise the
enabled provider/execution mode. This last step may contact a provider and
requires operator authorization; it is not a read-only diagnostic.

## 4. Machine-local files, permissions, and configuration

`resolveDataDirectory()` uses `AGENTIC_REMOTE_DATA_DIR`, otherwise
`$HOME/.agentic-remote`. The following are defaults, not discovered machine paths.

| Location | Owner and contents |
| --- | --- |
| `~/.config/agentic-remote/environment` | Generated service settings, installed `0600`. |
| `~/.config/systemd/user/agentic-remote.service` | Generated unit, installed `0644`; paths are not secrets. |
| `~/.local/bin/agentic-remote` | Symlink to the runtime **source CLI**, not the active release. |
| `~/.config/agentic-remote/releases/` | Current bundle plus retained rollback bundles. |
| Sibling `releases.rejected/` | Quarantined rejected releases; not rollback candidates. |
| `<data>/node.json` | This computer's ID/name and pairing secret, all roles. |
| `<data>/state.json`, `<data>/claude/state.json` | Provider-specific application session state. |
| `<data>/uploads/`, `<data>/claude/uploads/` | Attachments on the session-owning computer. |
| `<data>/computers.json` | Hub's paired-computer metadata **and tokens**. |
| `<data>/knowledge.json`, `<data>/session-knowledge.json` | Hub root metadata and per-session bindings. |
| `<data>/push-notifications.json` | Hub VAPID key pair, subscriptions, and mute settings. |
| `<data>/models/`, `<data>/tmp/transcriptions/` | Local speech model and transient transcription jobs. |
| Provider-managed directories and repositories | Remain with their owning provider/computer; not in releases. |

Stores request `0700` directories and `0600` state/uploads, but do not generally
repair existing permissions. Release/config parents depend on ownership/umask.
Keep writable state private and outside Git; never publish environment contents,
tokens, VAPID private keys, provider history, or raw production journals.

Setup preserves installed role/name/bind/port when flags are absent. It preserves
custom origins, extra allowed roots, the transcription-computer assignment, and
an existing data-directory line. A previously derived origin list is regenerated
when the bind changes; a custom list must be updated deliberately.
**Current limitation:** exported/profile `AGENTIC_REMOTE_DATA_DIR` is not read by
`setup_service`; only the existing environment-file value is retained.
Do not assume a profile-only data-root change took effect.

Setup's finite environment rewrite drops custom `CLAUDE_BIN`, `COPILOT_HOME`,
media/model/thread settings, and other unlisted overrides. Manage needed overrides
outside that generated file; verify effective presence without printing secrets.
Data-root/role changes are not code-only updates. Session directories must be
under HOME unless `AGENTIC_REMOTE_ALLOWED_ROOTS` adds absolute roots; admission
checks do not relocate old sessions or files.

## 5. Speech transcription placement

The hub transcribes by default: `$HOME/.local/bin/whisper-cli`,
`<data>/models/ggml-small.bin`, and 3 threads (configured range 1–16).
Overrides: `AGENTIC_REMOTE_WHISPER_BIN`, `AGENTIC_REMOTE_WHISPER_MODEL`,
`AGENTIC_REMOTE_WHISPER_THREADS`, `AGENTIC_REMOTE_FFMPEG_BIN`, `AGENTIC_REMOTE_FFPROBE_BIN`.
Provision tools/model on the **transcribing** computer; setup does not, and missing tools yield `503`.

Packaged ffmpeg/ffprobe are SHA-256 checked before use; digest tests detect
dependency drift. Explicit alternative binaries bypass the packaged-path digest
check and need their own operator provenance. Never silence a mismatch blindly.
Audio is limited to 25 MiB and 15 minutes; a busy transcriber rejects concurrent
work with `429`. Local job files are private and cleaned after completion and
on startup; they are not a durable recording archive.

`AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER` selects a paired computer by name or ID.
The hub buffers a bounded recording in memory and sends it through that
computer's authenticated API; it does not spool delegated audio to hub disk.
Only the transcript returns. Offline/unpaired selection yields `503`; an older
node lacking the route yields `409`. Selecting the local computer uses local
transcription. Delegation does not move sessions, uploads, or Knowledge files.

## 6. Service, boot, and routine operations

The unit runs Node directly with `--import tsx server/index.ts` from `current`,
sets production mode, and supplies explicit executable/PATH settings.
It uses `Restart=on-failure`, a 5-second restart delay, `TimeoutStopSec=30`,
`NoNewPrivileges=true`, and `KillMode=process`.
The latter preserves tmux children across a service restart; it is not a promise
that processes survive reboot or that every SDK request survives disconnection.
Check persisted sessions and in-flight behavior separately.

The service is enabled under the user's `default.target`. Boot/logout continuity
needs the user manager and linger; setup's failed `loginctl enable-linger` only warns.
Verify `loginctl show-user "$USER" -p Linger --value`, then actual boot recovery.
Network ordering is not provider/tunnel readiness.

`agentic-remote status` reads unit status; `logs` follows the journal.
`start`, `stop`, and `restart` alter the service. `uninstall` removes/disables the
unit and its owned CLI link but leaves data, environment, and release inventory.
It is not secure erasure and does not uninstall the separate promotion monitor.
Do not use mutation commands while merely auditing a live machine.

## 7. Immutable releases, update, and rollback

`publish_release` copies `dist`, server/shared sources, manifests/tsconfigs, and
the installed dependency tree into staging outside the rollback inventory.
It flushes regular files/directories, atomically renames the complete bundle,
then atomically switches and flushes `current`. Special files are rejected;
symlinks are not recursively followed by the flush.
Current plus two unmarked rollbacks are retained; rejected directories do not
consume healthy slots. Staging/inventory need compatible rename semantics and
space for the full dependency copy. IDs remain reserved across live/rejected
inventories; never recycle a quarantined ID or use reserved `current`.

`update` does `git pull --ff-only` in the CLI's source checkout, then setup.
It is for a managed branch checkout, not a detached monitor runtime.
`rollback` chooses the newest eligible non-current directory by timestamp,
switches and flushes the pointer, and restarts. It does not select a requested SHA,
rebuild, restore service settings, undo data changes, or restore provider state.
After a manual rollback, verify the actual selected artifact; another rollback
is not necessarily another step backward in commit history.

Each Vite production build creates a new opaque `buildId` even for the same SHA.
The ID is shared by bundle, worker, and `dist/build-info.json`; copying/restarting
preserves it. Artifact rollback restores the original ID. `/api/version` reports
the static build's version/ID with `no-store`; missing build metadata prevents a
static hub from starting. A node/non-static development hub needs no such build.
For a stale PWA, use **App settings → Check for updates** and verify the active
build rather than guessing from package version alone.

## 8. Exact-commit promotion profiles and recovery

The optional installer copies the monitor outside mutable source to
`~/.local/lib/agentic-remote/promotion-monitor`, with a `0600` profile at
`~/.config/agentic-remote/promotion.env` and private user units.
Run `./bin/agentic-remote-promotion-setup init`, edit the created profile, then
`./bin/agentic-remote-promotion-setup install --create-runtime`.
Omit `--enable` until the target and verification policy are established.
Runtime source must be clean, detached, and share development's object store;
development must be clean `main` at fetched `origin/main`, not locally ahead.

The monitor locks its state directory, validates a pinned owned worktree with
frozen install → lint → tests → build, then installs that exact commit.
It rebuilds in runtime source; exact SHA does not mean byte-identical build ID.
Validation commands are fixed, not arbitrary profile hooks. State defaults to
`~/.local/state/agentic-remote-monitor`; use suitable storage, not an unrelated checkout.
The release-root field must resolve to the CLI's fixed release inventory.
Although service name is a profile field, setup currently targets only
`agentic-remote.service`; do not configure a different name expecting isolation.
Leave role/name/host/port overrides empty to inherit installed identity.

Local recovery journals `prepared`, `local-verified`, and `verified` before
advancing the canonical `promotion-state` and legacy `last-graduated-commit`.
They bind candidate/previous commits and releases to the configured roots.
A pending journal is reconciled before new validation. Rejected artifacts are
marked and excluded/quarantined before older CLI source can be restored.
Malformed journals, changed roots, unrelated sources, or a third current release
fail closed. Preserve evidence; never delete a journal to force progress.
When restoration is incomplete, report it and retain the recovery boundary.

Enable probes the health URL before arming a persistent, two-hour calendar timer
with up to five minutes of random delay and a 30-minute service timeout.
`AGENTIC_REMOTE_PROMOTION_HOME` relocates files, **not** the caller's systemd
manager: it is not a sandbox. Reinstalling without `--enable` should not be
treated as proof an already-enabled timer has been disabled.

Downstream hosts are optional SSH destinations from the local profile.
Each independently fetches, checks out the exact candidate detached, and runs
setup; normal downstream promotion does **not** run `update`.
All hosts in one profile share a repository path and health URL and need
non-interactive credentials/toolchains. No configuration or state is copied.
On failure, current code attempts to rebuild prior source commits downstream;
it does not provide the local journal's per-artifact recovery guarantees.
Previous downstream heads live in memory, and restoration is not health-verified.
A healthy local `local-verified` release remains active for downstream retry.

Policy requires proven development behavior, live computers, and surviving
sessions before automatically promoting the same commit. Ask first for state
migration, unexercised node-only behavior, inconclusive proof, or nonreversible
changes. The monitor currently checks source/pointer, service, HTTP health, and
optional external status—not those complete behavioral conditions.
Do not confuse timer success or a proxy login redirect with release acceptance.

## 9. Backup and topology limits

There is no application backup/restore command or cross-host session migration.
Release inventory is not a backup of mutable state, providers, or repositories.
Metadata rename is not an fsync-backed crash-durability guarantee. Failed writes
can leave in-memory-only Knowledge/registry/push-mute changes; a live API read is
not persistence proof. Validate disk and restart convergence before recovery acceptance.
For authorized recovery, retain encrypted, consistent owner-local data/configuration
and recovery records under the backup policy; quiesce writers or coordinate snapshots.
Restore on the owner with compatible code, paths, identity, and private permissions;
verify before admitting writes. Reinstallation cannot recover history/lost files;
do not hand-edit damaged JSON. Restoration/data-root changes need migration approval.
Never transplant credentials/identity to impersonate the old host. Changing the
serving hub needs topology approval, re-pairing, Knowledge metadata recreation,
and new notification subscriptions; old VAPID subscriptions do not transfer.

## 10. Native shell: implemented versus planned

`shell/` is an independent pnpm package with its own lock and Rust crate.
Root service install/build does not build Tauri or require Apple tooling.
The local Vite page is settings only (port 1421); the session UI is loaded from
the remote hub, preserving same-origin API/WebSocket behavior without new CORS.
Targets are macOS/Windows/Linux/iOS; configured minima (macOS 10.15, iOS 15)
are not device support proof. Cargo declares Rust 1.77.2; locked MSRV was not verified.
`Cargo.lock` selects Tauri 2.11.5; the manifest's broad major constraint is not an MSRV test.

Implemented source includes configurable primary/direct URLs, `shell.json` in
Tauri's platform config directory, injected optional bridge methods, desktop
badge/tray/hotkey, foreground notifications, and desktop deep-link dispatch.
`create_main_window` falls back to local settings if neither URL is reachable.
The probe is synchronous DNS plus TCP (1.5 seconds per address), not TLS,
authentication, health validation, or continuous failover.
Saving settings navigates the existing main webview; it does not destroy it
or clear prior cookies. A changed shortcut is registered on the next launch.
Normal URL/cookie origin rules still apply; no cross-host cookie isolation was
proven by this Linux source audit.

Remote IPC grants only badge/notify/withdraw/open-settings/bridge-ready commands;
configuration read/write belongs to local settings. Saving a new hub configuration
adds grants to the existing shell process without revoking previously added
origins. Earlier hub origins therefore retain those bridge permissions in the
main webview for that process; the currently saved URLs are not the complete
effective grant list. Changing the URL is not revocation. A fresh shell process
initializes grants from the saved configuration, but this audit did not exercise
that lifecycle on a physical device.
There is no remote filesystem/shell/process grant. Use plain trusted HTTP(S)
origins, not wildcards or embedded credentials. The current normalizer is not strict
general URL/origin validation; the intended boundary needs stronger input checks.

Mobile badge is a no-op; desktop notification withdrawal is a no-op.
Notification actions/replies, APNs background delivery, iOS scheme wiring,
launch-at-login, persistent window placement, and automatic shell updater are
not shipped implementations. Bridge fields alone do not establish these features.
Signing/notarization and signed-iPhone authentication/lifecycle acceptance remain
separate work; do not infer them from Rust compilation or browser screenshots.

## 11. Build and test maintenance

Root `pnpm check` is oxlint → Vitest → TypeScript/Vite build. There is no hosted
CI gate. Tests pin `NODE_ENV=development` so inherited production mode does not
remove React `act`; use `NODE_ENV=production pnpm check` for relevant config work.
Root TS covers app/shared/server/Vite, not the native crate or every ad-hoc script.
Version tests synchronize app/shell manifests, Cargo's lock entry, and bundle
examples. Documentation-only changes need no SemVer bump; builds still get new IDs.
`pnpm dev` defaults to loopback Vite 4317 and Fastify 4318; these can collide with
an installed service. Isolate ports before starting a developer server.

Targeted diagnosis groups below do not replace the full gate or native/live acceptance:

```bash
pnpm exec vitest run server/service-unit.test.ts server/promotion-setup.test.ts \
  server/release-publication.test.ts server/promotion-monitor.test.ts
pnpm exec vitest run server/version-policy.test.ts server/app-build.test.ts \
  server/service-worker.test.ts server/transcription-media-digests.test.ts graphify/manage.test.ts
pnpm exec vitest run server/tmux-errors.test.ts server/terminal-send-uncertainty.test.ts
pnpm exec vitest run server/active-sessions.test.ts server/terminal-session.test.ts \
  server/terminal-startup-queue.test.ts server/terminal-queue-delivery.test.ts \
  server/tmux-errors.integration.test.ts
```

The last group uses real tmux: coordinate **one runner per host**, never alongside
another user's gate. `fileParallelism:false` serializes files within one runner,
not separate runners. Helpers isolate socket roots, clear inherited `TMUX`, and
poll readiness/exit; discovery still uses machine-global `ps`/`/proc` and filters.
Issue **#169 remains open**: the ownership-scoped harness and repeated/concurrent
reliability proof are incomplete. SIGKILL fallback does not itself await final
exit. Historical failure frequency is not a measured current rate; a passing
gate cannot establish closure. Preserve first-failure evidence, not retry-to-green.

`test:e2e` currently means `playwright test`, but no tracked Playwright config or
actual Playwright test suite accompanies it; `e2e/*.test.ts` are Vitest helpers.
Browser capture/regression scripts run directly with Node/tsx against an isolated
frontend, explicit output directory, and mocked API/WebSockets. Their loopback
guard rejects ports 4317/4318. They do not prove pairing, providers, recovery,
upstream authentication, or installed-PWA/native behavior.

For shell work, run `pnpm install --frozen-lockfile`, `pnpm icons`, `pnpm check`,
and `pnpm build:desktop` **inside `shell/`** with platform build dependencies.
iOS additionally needs macOS/Xcode, target installation, `pnpm ios:init`, signing,
and `cargo check --manifest-path src-tauri/Cargo.toml --target aarch64-apple-ios`.
macOS/iOS native acceptance is **blocked on the required host/device** in a Linux
audit. Root gate success cannot remove that block.

Graphify `check`/`query`/`explain` provide local navigation; tracked-only scope
excludes secrets/generated inputs and queries disable networking. AST edges are
not runtime proof. Refresh through `manage.py`, never hand-edit generated artifacts.

## 12. Non-invasive diagnostics and acceptance

Use bounded unit/journal reads and checks against the configured bind, for example:
`systemctl --user is-active agentic-remote.service`,
`journalctl --user -u agentic-remote.service -n 80 --no-pager`,
`curl --fail --silent --show-error --max-time 5 "$HEALTH_URL"`,
and `readlink -f ~/.config/agentic-remote/releases/current`.
Review journals locally before sharing; inspect modes/owners rather than secrets.
Never run pair-info, provider login/status, a monitor, or deployment commands for inventory.

| ID | Required acceptance evidence |
| --- | --- |
| OPS-001 | Intended role/channel/bind and independent source/runtime ownership recorded. |
| OPS-002 | Compatible locked toolchain; local complete gate recorded at exact candidate SHA. |
| OPS-003 | Authenticated TLS/private access covers HTTP and WebSockets; API allowlist tested. |
| OPS-004 | Role-correct health, service active, actual bind reachable; no node-UI expectation. |
| OPS-005 | Pairing succeeds through the hub; owner-specific provider/session behavior exercised. |
| OPS-006 | Private data/config ownership; overrides survive reinstallation as intended. |
| OPS-007 | Linger and post-boot recovery verified, distinct from restart-only evidence. |
| OPS-008 | Sessions and computers recover after development restart; affected behavior exercised. |
| OPS-009 | Candidate/previous SHA and release paths recorded; original artifact rollback verified. |
| OPS-010 | Interrupted promotion preserves original recovery baseline and rejected inventory. |
| OPS-011 | Every downstream restoration and resumed promotion verified, not merely attempted. |
| OPS-012 | Transcription runs on selected owner with verified media and local cleanup. |
| OPS-013 | PWA detects same-version builds and rollback; identity matches deployed artifact. |
| OPS-014 | #169 ownership, bounded exit, cleanup, and repeated/concurrent fixture evidence obtained. |
| OPS-015 | Real browser E2E distinguished from synthetic capture and helper-unit coverage. |
| OPS-016 | Native signed login/relaunch/background/device flows demonstrated on target hardware. |
| OPS-017 | Consistent authorized owner-local restoration exercised without topology cloning. |

These are criteria, **not passed checks**. The setup-specific audit used source/
graph review and Bash syntax checks; the [dated review](../reviews/2026-09-09/code-and-issues.md)
records separate application validation and synthetic measurements.
Gaps: behavioral promotion gating, downstream durable recovery,
ignored profile/data settings, override loss, E2E, #169, and native device proof.
Historical documentation corrections are tracked in that review; planned native
features and owner-local state are not missing server features. No recovery time,
outage budget, storage growth, speech throughput, native memory, or flake rate was measured.
