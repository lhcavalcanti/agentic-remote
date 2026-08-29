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
| `development_root` | Writable checkout used for pull and validation |
| `production_runtime_root` | Separate runtime source or deployment worktree |
| `release_root` | Immutable releases and the `current` pointer |
| `service_name` | Managed systemd service to restart |
| `health_url` | Local health endpoint after promotion |
| `external_check` | Optional tunnel or external access check |
| `validation_policy` | Local checks and/or matching CI workflow |
| `promotion_policy` | How the exact validated commit is installed |
| `rollback_policy` | Previous-release and failure behavior |

The profile should identify the deployment target explicitly. A monitor must
not infer a production path from the current working directory or from an
arbitrary Git worktree.

A simple implementation can use a machine-local key-value file such as
`~/.config/agentic-remote/promotion.env`; environment variables supplied by the
service may override the file for one-off operator runs. For example:

```text
AGENTIC_REMOTE_MONITOR_DEV_ROOT=/path/to/development/checkout
AGENTIC_REMOTE_MONITOR_PROD_ROOT=/path/to/production/runtime
AGENTIC_REMOTE_MONITOR_RELEASE_ROOT=/path/to/releases
AGENTIC_REMOTE_MONITOR_SERVICE=agentic-remote.service
AGENTIC_REMOTE_MONITOR_HEALTH_URL=http://127.0.0.1:4317/api/health
AGENTIC_REMOTE_MONITOR_REPOSITORY=owner/repository
AGENTIC_REMOTE_MONITOR_WORKFLOW=ci.yml
```

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
4. Install dependencies and run the configured development validation.
5. Require the matching CI result when the local host cannot reliably run the
   complete suite.
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

- Build and test only from the development root.
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
