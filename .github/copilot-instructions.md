# Agentic Remote repository instructions

## Production rollout

- Implement, validate, and deploy fixes to the development hub first.
- After every validated fix, explicitly ask the user whether the production
  node should be updated.
- Never infer production approval from development approval or a previous
  rollout.
- Update production only after the user explicitly approves that specific
  rollout.
- After an approved production update, verify node health, connectivity, and
  the behavior affected by the fix.

## Branch and worktree hygiene

- Keep the primary checkout on `main` and clean after each change is pushed or
  merged.
- Use temporary branches and worktrees for feature work. After testing and
  pushing or merging the change, delete the local temporary branch and
  worktree.
- Never discard unrelated uncommitted changes without explicit approval.
