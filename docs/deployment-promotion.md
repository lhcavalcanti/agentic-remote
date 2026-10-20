# Deployment and promotion

Agentic Remote should keep the build that is being developed separate from the
runtime that serves the UI and accepts external connections. This prevents a
broken build, dependency install, or restart during development from taking
away the operator's access.

## Separate runtime role from release channel

`--role hub|node` describes the runtime topology:

- A **hub** serves the UI and owns local sessions.
- A **node** runs sessions for a hub and does not serve the UI.

The deployment channel is separate:

- **Development** is a writable checkout where changes are pulled. Validation
  builds and tests a pinned worktree of the candidate commit instead, so that
  what passed is what is promoted; see [Pull, validate, and graduate](#pull-validate-and-graduate).
- **Production** is a separate runtime source or release location used by the
  managed service and any external tunnel.

A hub or node can use this same development/production split. Do not run the
externally reachable service from the development checkout.

## Machine-local profile

The profile belongs outside the repository, for example under
`~/.config/agentic-remote/`. It must contain paths and policies, not provider
credentials, pairing tokens, repositories, or SSH keys.

| Field | Purpose |
| --- | --- |
| `profile_name` | Human-readable machine/setup name |
| `repository` | GitHub repository to monitor |
| `development_root` | Writable checkout the candidate commit is pulled into |
| `production_runtime_root` | Separate runtime source or deployment worktree |
| `release_root` | Immutable releases and the `current` pointer |
| `service_name` | Managed systemd service to restart |
| `health_url` | Local health endpoint after promotion |
| `external_check` | Optional tunnel or external access check |
| `validation_policy` | Local lint, test, and build that gate promotion |
| `state_dir` | Run markers, and the pinned worktree validation runs in |
| `promotion_policy` | How the exact validated commit is installed |
| `rollback_policy` | Previous-release and failure behavior |

The profile should identify the deployment target explicitly. A monitor must
not infer a production path from the current working directory or from an
arbitrary Git worktree.

A simple implementation can use a machine-local key-value file such as
`~/.config/agentic-remote/promotion.env`. For example:

```text
AGENTIC_REMOTE_MONITOR_DEV_ROOT=/path/to/development/checkout
AGENTIC_REMOTE_MONITOR_PROD_ROOT=/path/to/production/runtime
AGENTIC_REMOTE_MONITOR_RELEASE_ROOT=/path/to/releases
AGENTIC_REMOTE_MONITOR_SERVICE=agentic-remote.service
AGENTIC_REMOTE_MONITOR_HEALTH_URL=http://127.0.0.1:4317/health
AGENTIC_REMOTE_MONITOR_STATE_DIR=/path/to/monitor/state
```

Validation runs in a worktree under `state_dir`, so put it on a filesystem
that is fast enough to run the suite.

### Inherit the runtime identity by default

A monitor promotes a build; it does not decide what the host is. Leave
`AGENTIC_REMOTE_MONITOR_HOST`, `PORT`, `ROLE`, and `NAME` empty so each
graduation reuses the role, name, and bind address already installed on the
host. Set one only to change the runtime deliberately.

This matters most on a node. A profile that asserts `ROLE=hub` converts a
paired node into a hub on its first graduation, rebinds it, and renames the
computer the hub has registered.

Use `/health` for `health_url`. It reports `{ok, role, node}` for both roles,
whereas `/api/health` is registered only for a hub and returns `404` on a node
— so a node configured with `/api/health` fails its check after the service has
already restarted, and never records the promotion.

Point `health_url` at the address the service actually binds. A host
configured with a LAN `HOST` does not answer on `127.0.0.1`. The hub Host
allowlist applies only to `/api/` URLs, so `/health` needs no allowlist entry
while `/api/health` does. `agentic-remote-promotion-setup enable` probes the
configured URL and refuses to arm the timer until it answers.

### Graduation is transactional

Before changing the runtime source or activating a candidate, the monitor
commits `state_dir/pending-promotion`. This versioned JSON journal binds the
operation to its runtime and release roots and records the validated candidate
commit/release and the previous known-good source commit/release. It is written
through an exclusive `0600` temporary file, flushed, atomically renamed, and its
directory flushed. A refused or interrupted journal commit cannot activate a
candidate. Uncommitted `.pending-promotion-*` files are not recovery records.

The next run reconciles a committed journal **before pulling, validating, or
publishing anything else**. It must not infer a rollback baseline from the
possibly unverified `current` pointer:

- `prepared`: activation or verification may have been interrupted. Restore
  the recorded known-good release, quarantine the interrupted candidate, and
  leave both success records unchanged. A successfully recovered interruption
  still exits as a failed graduation; a later run may validate and retry.
- `local-verified`: setup, source identity, local health, and external checks
  passed and were recorded. Recheck that exact active release and resume the
  downstream phase without rebuilding it or choosing a new rollback baseline.
- `verified`: all configured phases passed. Finish the success records without
  reactivating the candidate, including when an operator has already manually
  selected a healthy rollback. An already committed canonical record is not
  rewritten merely to repair the legacy marker.

The canonical success record and legacy marker are also flushed before the
journal is removed. Incomplete recovery keeps the same journal for the next
attempt; it cannot overwrite the recorded baseline with the failed candidate.
Malformed journals, changed runtime roots, or unrelated source commits fail
closed. If `current` was moved to neither recorded endpoint, preserve that
selection, quarantine only the inactive pending candidate when safe, and leave
the journal for an operator to reconcile. Never remove the journal or downgrade
the installed monitor simply to bypass this decision: older monitors do not
understand this recovery boundary.
If an older monitor left no journal and the runtime source differs from the
recorded successful commit, refuse a fresh promotion rather than adopting that
unrecorded runtime as known-good. An operator must reconcile that legacy state.

The release pointer and the managed service are replaced before the health and
external checks run, and the release directory keeps only the current release
plus two rollbacks. A failure that simply exits would therefore leave the failed
candidate serving traffic, and repeated retries would evict the last known-good
release. On any failure after the switch, restore the previous release pointer,
restart the service, and leave the success marker unchanged so the next run
retries from a known state. Restore the previous source commit only after the
pointer is back and the failed candidate is out of the rollback inventory.

The failed candidate is marked `.promotion-failed` before restoration, so
`agentic-remote rollback` will never select it. Remove only that new candidate
after the previous pointer is restored and the restarted runtime passes its
health check; keep older healthy releases available. If pointer restoration,
restart, health verification, or removal fails, retain the rejected release
and its marker and report the incomplete recovery without advancing success.
Do not remove an active release. A rejected release still serving as `current`
must be rolled back to a healthy release before promotion can retry.
Inactive rejected directories are quarantined outside the release inventory if
restored health cannot be established, so older rollback commands cannot select
them merely because they are newest. An active candidate is never moved or
deleted when pointer restoration fails. Retained marked directories do not
consume the two healthy rollback slots.

The application CLI also retries quarantine: before publication or another
rollback when `current` names an unmarked release, after a successful rollback
restart, and after setup starts a replacement. This moves inactive marked
directories to the sibling `release_root.rejected` inventory rather than
retaining them forever. An active marked directory is never moved. If the
quarantine root is a symlink, the destination is occupied, or the move fails,
report failure and preserve the healthy current release and all rejected data.
Quarantine uses an atomic directory rename, not a cross-filesystem copy/delete
fallback; incompatible filesystem layouts fail without partially moving a release.
Rejection markers and inventory directory changes are flushed before the monitor
downgrades the installed CLI or removes its recovery journal.
Do not roll back to the failed candidate to undo an incomplete cleanup.

The installed CLI is a symlink into the production source checkout, not the
active release. Restoring that checkout too soon can reinstall an older
`rollback` implementation that ignores `.promotion-failed`. If pointer
restoration or safe removal/quarantine fails, keep the marker-aware source
installed and report incomplete recovery. Subsequent manual rollbacks then
continue to exclude the rejected candidate, even after it becomes inactive.

Publication stages complete bundles outside the rollback inventory, flushes
every regular file and directory in child-before-parent order, then installs
them with an atomic directory rename. Symlinks are not followed; their containing
directories persist the link entries, and special files are rejected. Both the
actual staging parent and release inventory are flushed before switching
`current`, and the inventory is flushed again after the pointer switch and
retention cleanup. Manual rollback also
flushes its pointer switch before restarting the service. A flush error fails
the operation instead of allowing the monitor to record `local-verified` or
`verified`. A refused pre-activation flush preserves the healthy pointer. If the
active-pointer flush fails, setup does not restart the service and retains the
complete candidate while the prepared promotion journal restores the known-good
release; an indeterminate active target is never deleted during publication
cleanup. The monitor supplies a unique `--release-id`, then checks that both the
source checkout and
the active release match its candidate. A setup failure before pointer activation
cannot hide an unverified candidate behind the previous healthy pointer. The
promotion record contains the promoted and previous release paths as well as
their commits. The profile's release root must identify the application CLI's
release directory; a mismatch is refused before changing the runtime source.
The release identifier `current` is reserved for the active symlink. Both setup
argument parsing and publication reject it before installing dependencies,
building, creating release paths, or quarantining existing inventory.
Identifiers present in either the live or rejected inventory remain reserved,
including file and symlink entries. Validation uses the canonical inventory
location and runs before quarantine, so moving a rejected release cannot free
its identity for reuse. A retry must use a fresh identifier; retained rejection
markers and archived data are never overwritten by a new build.

Graduate only what `origin/main` already contains. A clean local `main` can sit
ahead of its upstream, so comparing `HEAD` against `refs/remotes/origin/main`
after the fetch is what prevents promoting an unmerged commit.

### Where values live, and what each location exposes

Every setting resolves in this order: an environment variable of the same name,
then the profile file, then a built-in default. Any value can therefore be
supplied per run without touching the file:

```bash
AGENTIC_REMOTE_MONITOR_DEV_ROOT=/other/checkout agentic-remote-promotion-monitor run
```

Local installation runs prepend both `AGENTIC_REMOTE_RUNTIME_TOOLS` and
`$HOME/.local/bin` to the service environment's `PATH`. The runtime-tools
directory supplies the pinned package-manager shim, while the user-local
directory supplies Copilot when it was installed with the documented npm
prefix.

Moving values into the systemd unit looks like it hides them but does the
opposite. The profile is written `0600`, while `systemctl show -p Environment`
prints every `Environment=` entry in the unit. Keep values in the profile, or in
a separate `EnvironmentFile=` whose permissions you control.

The profile is not a secret store in the first place. It holds paths, URLs, a
service name, and the repository to watch. The GitHub token is read at run time
from the GitHub CLI configuration and exported only into the monitor's own
process, so this tooling never writes it to disk. Keep credentials, pairing
tokens, and SSH keys out of the profile: name an SSH destination and let the SSH
client resolve the key.

## Reproducible setup from the repository

The repository includes the reproducible setup assets, while the installed
monitor, profile, systemd units, state, releases, and credentials remain
machine-local:

- `bin/agentic-remote-promotion-monitor` performs pull, validation, promotion,
  and health checks.
- `bin/agentic-remote-promotion-setup` installs the monitor and user systemd
  units.
- `config/agentic-remote-promotion.env.example` is a portable profile template.

On a new machine:

```bash
./bin/agentic-remote-promotion-setup init
$EDITOR ~/.config/agentic-remote/promotion.env
./bin/agentic-remote-promotion-setup install --create-runtime --enable
```

`--create-runtime` creates the second detached worktree from the clean
development `main` checkout. `install` copies the monitor to a stable
machine-local path, so the systemd timer does not execute from the mutable
development checkout. Omit `--enable` when the machine should remain opt-out.

Refresh an existing installation after upgrading from a version that predates
the `refresh` command:

```bash
./bin/agentic-remote-promotion-setup refresh
```

`refresh` atomically replaces the installed monitor and unit definitions,
preserves the profile, and keeps the timer's enabled and running state unless
promotion is paused (see below).
Successful promotions also refresh those lifecycle assets from the exact
validated candidate before restarting the managed service. A refresh failure
therefore leaves the previous service process running while the promotion
monitor restores the previous release, rather than silently installing an
older timeout or monitor.

### Pausing promotion

Disabling the timer alone is not a pause: anything that runs
`systemctl --user enable --now` on it, or starts the service by hand, would
resume promotion. An operator pause is therefore a durable marker that the
monitor itself enforces:

```bash
./bin/agentic-remote-promotion-setup disable --reason "holding the current release"
./bin/agentic-remote-promotion-setup status
./bin/agentic-remote-promotion-setup enable
```

- `disable` atomically writes a `0600` `promotion-paused` marker (UTC time
  and optional one-line reason) to the profile's `state_dir` *before* it
  disables and stops the timer, and succeeds only once the timer is neither
  active nor enabled. If the marker cannot be written it still stops the
  timer, but fails.
- While the marker exists, every monitor run, whether started by the timer,
  a rearmed timer, or `systemctl --user start` of the service, logs
  `promotion is paused since …; skipping this run` and exits 0 before any
  fetch, validation, recovery, or promotion. A pending promotion journal is
  retained and reconciled after resuming. A run already validating when the
  pause lands stops after validation and before graduation; one that already
  recorded a pending promotion completes or rolls back that transaction, since
  cutting it short would strand recovery. The monitor holds a `pause.lock` in
  `state_dir` from that last check until its journal exists, and `disable`
  records the pause under the same lock, so it reports which of the two
  happened.
- `refresh`, `install`, and therefore `agentic-remote setup`/`update` keep the
  marker and leave the timer disabled, disarming a timer that was rearmed in
  the meantime, and fail if it cannot be disarmed. `install --enable` does not
  resume a pause.
- Only `enable` resumes: it clears the marker after the health preflight
  passes, then arms the timer. A failed preflight leaves the pause in place.
- `status` reports `Promotion: paused since …` (with the reason), `enabled`, or
  `disabled`. It exits 0 when paused, and warns if the timer was rearmed.
- A marker that is not a readable regular file (a symlink, a directory, or
  undecodable content) fails closed: the monitor refuses to run, `status` exits
  non-zero, `refresh` treats promotion as paused, and `enable` refuses to clear
  it. Inspect and remove it by hand.
- `uninstall` preserves the marker along with the rest of the state.

Any external watchdog that repairs a disabled timer must treat a paused
monitor (the marker, or `status` reporting `paused`) as healthy rather than
rearm it. A rearm is harmless to promotion, but it is not a repair.

## Pull, validate, and graduate

A local-only monitor may run this sequence on an opt-in machine:

1. Exit without changes while an operator pause is recorded (see
   [Pausing promotion](#pausing-promotion)), then acquire a lock so only one
   run can change the runtime.
2. Reconcile any pending promotion before treating the current release as a
   baseline. Finish recovery or completion and return; do not start a different
   promotion in the same run.
3. Require the development checkout to be a clean `main` worktree.
4. Fetch and fast-forward `main`; never merge or rewrite local development
   changes.
5. Prepare a validation worktree under `state_dir`, pinned to the candidate
   commit, and install dependencies and run the configured validation there.
   The full Vitest suite runs with one worker and a 30-second per-test timeout,
   matching the stable local gate for timing-sensitive tmux and recovery tests.
   Validating in the development checkout ties the result to a workspace: it
   can sit on a filesystem chosen for working rather than for running a suite,
   where the runner gives up waiting for its own workers and reports a timeout
   while every test passes. Pinning also means what passed is what is
   promoted, rather than whatever the checkout became while the suite ran.
   `state_dir` therefore decides which filesystem validation runs on.
   The [advisory hosted check](#advisory-hosted-check) runs only a quick
   subset, so this is the only gate a commit passes before production and it
   has to include the tests.
6. Remove the validation worktree afterwards, refusing to delete anything that
   turns out to be a checkout this repository cannot account for.
7. Verify the production runtime worktree is clean, intentionally detached, and
   has not changed during validation, and stop here if promotion was paused
   meanwhile.
8. Durably record the pending promotion and known-good baseline, then promote
   the exact validated commit, publish an immutable release, and
   restart the managed service.
9. Wait for the service, local health endpoint, external access check, paired
   computers, and relevant sessions to recover.
10. Record completed verification and the candidate, tested, promoted, and
    previous release identifiers, then clear the pending journal.

If validation or promotion fails, do not advance the success marker and do not
discard the previous known-good release. The next run must be able to retry or
roll back without rebuilding from an unknown state. If there is no ungraduated
commit, the monitor should exit without restarting the service.

The monitor is machine-local orchestration. It is intentionally not an
Agentic Remote application command and must not be required by the hub or node
runtime.

## Advisory hosted check

`.github/workflows/light-check.yml` gives each pull request head fast feedback
on GitHub. It is advisory: it must never be a required check or part of a
branch ruleset, because an exhausted Actions quota then fails every run and
blocks merges, which is why hosted CI was removed in #124. The local gate above
stays authoritative.

- One `ubuntu-latest` job runs `pnpm install --frozen-lockfile`, `pnpm lint`,
  `pnpm exec tsc -b`, `pnpm exec vite build`, and `pnpm test:quick`.
- It runs when a ready pull request is opened, reopened, updated, or marked
  ready. Drafts are skipped, as are pull requests whose every changed file is
  Markdown, under `docs/`, or under `graphify/`. A newer head cancels the
  running check. Permissions are read-only and the job times out after 3
  minutes.
- `pnpm test:quick` is the `fast` project minus `slowTests` in
  `vite.config.ts`: every jsdom file and each file measured at 0.15 seconds or
  more locally. New files join it by default; add one to `slowTests` when it is
  that slow. Every file still runs in `pnpm test`.
- No dependency cache is used. Restoring the 440 MB pnpm store took 12 seconds
  against 17 seconds for an uncached install, and each pull request's first run
  had nothing to restore and spent 9 more seconds saving it.

Budget: jobs are billed per job and rounded up to whole minutes, so the check is
sized to finish within 60 seconds, one billed minute. Measured on GitHub it took
54 seconds: setup and checkout 7, install 18, lint 4, type-check 7, build 4,
tests 10. About 10 pull requests a day with about 3 heads each is roughly 1,200
runs, or 1,200 billed minutes, a month against an assumed 2,000-minute quota.
Skipped runs cost nothing; a cancelled run is billed for its started minute.
If a run regularly exceeds 60 seconds, shrink the test selection rather than
double the cost.

Disable the check with `gh workflow disable light-check.yml` (and re-enable it
with `gh workflow enable light-check.yml`), for example when the quota runs
low.

## Connection-continuity invariants

- Build and test from a checkout pinned to the commit being promoted, never
  from the production runtime or a release.
- Serve the UI from `release_root/current`, not from a checkout.
- Switch the release pointer only after build and validation succeed.
- Keep the external tunnel pointed at the managed service, not at a
  development server.
- Use a service restart mode that preserves terminal-backed sessions.
- Verify recovery after every promotion and retain the previous release for
  rollback.

### Browser build identity

Every production Vite build generates an opaque `buildId` once, independently
of the package version, Git checkout, and release directory name. The same ID
is embedded in the browser bundle and `sw.js`, and recorded with the package
version in `dist/build-info.json`. Rebuilding an unchanged commit deliberately
creates a new identity; copying or restarting that build does not.

Publication copies the complete `dist` directory, including this metadata,
without regenerating the ID. Rollback restores the original artifact and ID,
not a new build of the old sources. No Git metadata is needed in an installed
release.

A static-serving hub resolves `AGENTIC_REMOTE_RELEASE_DIR` (or its default
`dist`) once at startup and reads the identity there. `/api/version` returns
that build's `{ version, buildId }` with `Cache-Control: no-store`, even when
the static directory is separate from the server sources. Missing or invalid
build metadata prevents static-serving startup: rebuild older standalone
`dist` directories before using them with this server. Nodes and non-static
development/test hubs do not require a production build; the latter retain
the version-only API response.

The client compares build IDs when available, falling back to package versions
for older hubs. Registration URLs and shell caches use the build ID. The ID is
also embedded in the worker so an older, persistent registration URL cannot
choose the cache namespace of newly fetched worker code. Cache reads stay
within that worker's namespace, and online navigation does not replace the
installed offline shell with another release's HTML. Update checks retarget
even a waiting worker after a rollback, and successive same-version builds can
each announce an update without changing the version shown in App settings.
Update now rechecks the deployed identity before activating a waiting worker,
so a toast left open across a rollback cannot activate the obsolete build.
If that recheck fails, the current app stays active and the error is surfaced.

## Post-merge and post-graduation cleanup

Cleanup is part of completing the change:

1. Verify the pull request merge commit and the commit graduated to the runtime.
2. Delete the merged remote feature branch.
3. Remove the temporary local worktree and its local branch.
4. Prune stale worktree metadata and confirm the primary checkout is clean on
   `main`.
5. Keep the intentional production runtime worktree, if one exists, detached
   and clean. It is a deployment asset, not temporary task state.

Only remove branches and worktrees owned by the current task. Stop and ask
before touching a dirty, unmerged, or otherwise unowned worktree.

## Promoting to other machines

A single profile can describe a two-phase promotion: validate on the machine
that builds, then install the same commit elsewhere.

```text
AGENTIC_REMOTE_MONITOR_DOWNSTREAM_HOSTS=prod-a prod-b
AGENTIC_REMOTE_MONITOR_DOWNSTREAM_ROOT=/home/USER/src/agentic-remote
AGENTIC_REMOTE_MONITOR_DOWNSTREAM_HEALTH_URL=http://127.0.0.1:4317/health
```

Phase one graduates the commit into the local runtime and checks it. Phase two
then runs, for each host in order:

1. Refuse to continue if the remote checkout is dirty or unreachable.
2. Run `./bin/agentic-remote update` there.
3. Require the remote `HEAD` to equal the validated commit. A host that landed
   on a different tip did not install what was validated, so it is rolled back.
4. Probe the health URL on that host.
5. Roll that host back with `./bin/agentic-remote rollback` if any step fails.

The success marker only advances after every host succeeds, so a failure leaves
the commit ungraduated and the next run retries it.

Downstream promotion is opt-in. Leave `DOWNSTREAM_HOSTS` empty and the monitor
stays single-machine.

### Requirements

- Key-based SSH from the monitor host to each downstream host, with the host key
  already accepted. The monitor runs unattended and must never be prompted; it
  uses `BatchMode=yes` by default.
- A clean checkout at `DOWNSTREAM_ROOT` that can fetch from the same remote.
  Downstream checkouts are managed detached at the promoted commit, so do not
  use a checkout someone also develops on. A detached checkout also means
  `agentic-remote update` no longer works on that host, because it runs
  `git pull --ff-only`; the monitor becomes the way that host is updated.
- A build toolchain reachable from a non-interactive login shell on that host,
  plus `curl` and `git`.
- The downstream account must be able to manage its own service, which for the
  default installation means a user systemd service with lingering enabled.
- At least one previous release, so a failed promotion has something to fall
  back to.
- Each host keeps its own identity. The monitor never copies configuration,
  pairing tokens, credentials, or state between machines.

Every destination shares one `DOWNSTREAM_ROOT` and one
`DOWNSTREAM_HEALTH_URL`, so hosts must agree on their repository path and on a
health address that is valid from each host. Machines that differ need separate
profiles on separate monitor hosts.

### Failure behavior

A failure on any host restores that host to the commit it was on, then restores
any host already promoted earlier in the same run, so the fleet is not left
split across two commits. The success marker is not advanced, so the next run
retries the same commit.

The local runtime stays active because its validation and health are durably
recorded as `local-verified`. A retry rechecks that same local commit/release and
resumes the downstream phase without rebuilding or restarting the healthy local
runtime. If that recheck fails, recovery still uses the original journaled
known-good baseline, never the uncompleted candidate.

### Choosing which machine serves the UI

Role and release channel are independent. A common arrangement is to build on a
development machine while a separate machine serves users, so a rebuild never
restarts the UI someone is using. That machine is the downstream target, and it
keeps `role = hub` so it serves the UI; the development machine can remain a
hub too, unrouted, so a build can be validated with its UI before promotion.

Changing which machine serves users is a topology change, not a promotion.
Hub-owned state does not move: `computers.json`, `knowledge.json`, and push
subscriptions belong to whichever host is the hub, so re-pair the other host,
recreate knowledge roots, and re-subscribe to notifications. VAPID keys are
per-hub, so subscriptions minted against the old hub stop working.

## Setup variants

Profiles can describe different machine classes without changing the
application repository:

| Setup | Runtime role | Typical channel layout |
| --- | --- | --- |
| Development hub | `hub` | development checkout plus separate UI runtime |
| Production hub | `hub` | production runtime plus immutable releases |
| Worker node | `node` | development/runtime split for node-local sessions |
| Single-purpose host | `hub` or `node` | profile may omit a development checkout only when updates are manual |

The profile and monitor are optional. Enabling them on one machine must not
change the behavior or access policy of another machine.
