# Agentic Remote repository instructions

## Production rollout

- Implement, validate, and deploy every change to the development hub first.
- Development counts as stable only when the release is active, the hub answers
  `/api/health`, paired computers are still `online`, sessions survived the
  restart, and the behavior the change was made for has been exercised.
- Once development is stable, roll the same commit out to production without
  asking again.
- Always ask first when development cannot actually prove the change:
  - the behavior only exists on a node and was not exercised through the hub,
  - the change migrates, rewrites, or deletes stored state,
  - development verification was inconclusive, or
  - the rollout is not reversible with `agentic-remote rollback`.
- After a production update, verify node health, hub connectivity, and the
  behavior the change affected. A node answers `404` on `/`, so check it
  through the hub's computer list.
- If production verification fails, roll production back and report rather than
  leaving the two hosts diverged.

## Branch and worktree hygiene

- Keep the primary checkout on `main` and clean after each change is pushed or
  merged.
- Use temporary branches and worktrees for feature work. After testing and
  pushing or merging the change, delete the local temporary branch and
  worktree.
- Never discard unrelated uncommitted changes without explicit approval.
