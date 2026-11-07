# Agentic Remote repository instructions

## Production rollout

- Implement, validate, and deploy every change to the development runtime first.
- Development counts as stable only when the release is active, the runtime
  answers `/health`, paired computers are still `online`, sessions survived the
  restart, and the behavior the change was made for has been exercised.
- Merging and successful development validation do not authorize a production
  deployment or restart. Wait for explicit user authorization before every
  production rollout, then roll out only the same commit that was validated.
- Before requesting or acting on that authorization, state whether:
  - the behavior only exists on a node and was not exercised through the hub,
  - the change migrates, rewrites, or deletes stored state,
  - development verification was inconclusive, or
  - the rollout is not reversible with `agentic-remote rollback`.
- After a production update, verify runtime health, hub connectivity, and the
  behavior the change affected. Both roles answer `/health`; only a hub answers
  `/api/health`, and only `/api/` URLs are subject to the Host allowlist. A node
  answers `404` on `/`, so check it through the hub's computer list.
- If production verification fails, roll production back and report rather than
  leaving the hosts diverged.

## Owned work follow-through

- Follow every PR or task you own, or that an agent you dispatched owns, to a
  terminal state: merged; closed without merging; transferred to a named owner
  with its evidence record and next action; explicitly blocked; or waiting on a
  clearly stated user decision. An idle, failed, interrupted, or locally
  complete session is not a terminal state.
- Decide from live state: fetch, then read the PR head and `main` SHAs,
  Supervisor verdicts, commit statuses and checks, mergeability, and worktree
  ownership and local changes. Transcripts, journals, cached reviews, and
  earlier reports are not evidence.
- Evidence binds to the PR's exact full head SHA. A head change (push, rebase,
  or merging `main` in) invalidates the Supervisor verdict, checks, full gate,
  and mergeability; so does `main` advancing, after which the branch is
  reconciled with `main` and the evidence collected again. Evidence naming
  another or only an abbreviated SHA counts as missing.
- A Supervisor verdict is a signed review or comment whose marker
  `<!-- supervisor:review:<PR>:<full SHA>:... -->` matches the live PR and head,
  with a heading such as `### APPROVE`. GitHub's review label, passing checks,
  and unsigned comments do not replace it.
- Merge promptly, without asking again, only when the exact head has a
  Supervisor `APPROVE`, every required check and an `agentic-remote/full-gate`
  `success` on that head, and GitHub reports it clean and mergeable. Never
  approve a review on the user's behalf.
- Full gates are serialized by the gate's host-wide lock; a queued gate is not a
  passed one.
- When an owner goes idle, fails, or is interrupted with work left, reconcile
  its branch, worktree, processes, and GitHub state first. Resume or steer it
  when safe; otherwise start one replacement that reuses its branch and
  worktree once nothing still writes there. Never create a second worktree for
  the same task. An overloaded coordinator transfers a disjoint set of items,
  each with its evidence record, to another.
- Report only merges, closures, transfers, explicit blockers, and decisions
  awaiting the user. Merge authority does not authorize a production rollout.

## Deployment profiles and promotion

- Keep the writable development checkout separate from the production runtime
  source and immutable release used by the externally reachable service.
- Treat each machine as an explicit local deployment profile containing the
  development root, production runtime root, release root, service, health and
  external checks, validation policy, promotion policy, and rollback policy.
- Keep scheduled pull/test/promote orchestration outside this repository. The
  application repository owns service setup, release publication, and rollback;
  the checked-in promotion setup assets install a machine-local opt-in monitor
  that owns the machine-specific schedule.
- Keep `bin/agentic-remote-promotion-monitor`,
  `bin/agentic-remote-promotion-setup`, and
  `config/agentic-remote-promotion.env.example` generic. Installed profiles,
  systemd units, state, and credentials remain outside the repository.
- Promote only the exact commit that passed development validation. The hosted
  light check is advisory and runs only a quick subset, so that validation is
  the whole gate and has to run the complete suite locally. Record the promoted and previous release
  identifiers.
- Reaching other machines is part of the profile, not of this repository. Use
  the profile's downstream settings rather than hard-coding a host, account, or
  SSH alias anywhere in the repository.
- Changing which machine serves the UI is a topology change, not a promotion.
  Hub-owned state does not migrate, so treat it as a state-migrating change and
  ask first.
- If validation, health checks, or promotion fail, keep the previous release
  active and leave the success marker unchanged so a later run can retry or
  roll back.
- Do not copy provider credentials, pairing tokens, repositories, or SSH keys
  into a profile or between machines.
- See [Deployment and promotion](../docs/deployment-promotion.md) for the
  complete profile and cleanup contract.

## Branch and worktree hygiene

- Keep the primary checkout on `main` and clean after each change is pushed or
  merged.
- Use temporary branches and worktrees for feature work. After testing and
  pushing or merging the change, delete the local temporary branch and
  worktree.
- After graduation, verify that the pull request merge SHA and promoted SHA
  match, then prune temporary worktrees and branches. Preserve an intentional
  detached production runtime worktree and keep it clean.
- Never delete a dirty, unmerged, or unowned worktree; stop and ask instead.
- Never discard unrelated uncommitted changes without explicit approval.
