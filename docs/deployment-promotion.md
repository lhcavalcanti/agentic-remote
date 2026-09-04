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

- **Development** is a writable checkout where changes are pulled, built, and
  tested.
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

The release pointer and the managed service are replaced before the health and
external checks run, and the release directory keeps only the current release
plus two rollbacks. A failure that simply exits would therefore leave the failed
candidate serving traffic, and repeated retries would evict the last known-good
release. On any failure after the switch, restore the previous commit and
release pointer, restart the service, and leave the success marker unchanged so
the next run retries from a known state.

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

## Pull, validate, and graduate

A local-only monitor may run this sequence on an opt-in machine:

1. Acquire a lock so only one run can change the runtime.
2. Require the development checkout to be a clean `main` worktree.
3. Fetch and fast-forward `main`; never merge or rewrite local development
   changes.
4. Prepare a validation worktree under `state_dir`, pinned to the candidate
   commit, and install dependencies and run the configured validation there.
   Validating in the development checkout ties the result to a workspace: it
   can sit on a filesystem chosen for working rather than for running a suite,
   where the runner gives up waiting for its own workers and reports a timeout
   while every test passes. Pinning also means what passed is what is
   promoted, rather than whatever the checkout became while the suite ran.
   `state_dir` therefore decides which filesystem validation runs on.
   Nothing runs the suite remotely, so this is the only gate a commit passes
   before production and it has to include the tests.
5. Remove the validation worktree afterwards, refusing to delete anything that
   turns out to be a checkout this repository cannot account for.
6. Verify the production runtime worktree is clean and intentionally detached.
7. Promote the exact validated commit, publish an immutable release, and
   restart the managed service.
8. Wait for the service, local health endpoint, external access check, paired
   computers, and relevant sessions to recover.
9. Record the candidate, tested, promoted, and previous release identifiers.

If validation or promotion fails, do not advance the success marker and do not
discard the previous known-good release. The next run must be able to retry or
roll back without rebuilding from an unknown state. If there is no ungraduated
commit, the monitor should exit without restarting the service.

The monitor is machine-local orchestration. It is intentionally not an
Agentic Remote application command and must not be required by the hub or node
runtime.

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

The local runtime stays graduated, because it validated the commit and is
healthy. A retry therefore rebuilds and restarts the local runtime again before
reaching the downstream phase.

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
