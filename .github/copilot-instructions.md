# Agentic Remote repository instructions

## Production rollout

- Implement, validate, and deploy every change to the development runtime first.
- Development counts as stable only when the release is active, the runtime
  answers `/health`, paired computers are still `online`, sessions survived the
  restart, and the behavior the change was made for has been exercised.
- Once development is stable, roll the same commit out to production without
  asking again.
- Always ask first when development cannot actually prove the change:
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
- Promote only the exact commit that passed development validation and the
  matching CI gate. Record the promoted and previous release identifiers.
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
