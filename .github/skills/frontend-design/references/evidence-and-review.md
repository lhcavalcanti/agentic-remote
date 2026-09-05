# Evidence and review

Use for audits, critiques, review comments, and improvement proposals.
Adapted from the evidence discipline in [UI-SKILLS.md](../UI-SKILLS.md), not
from another skill's blanket execution restrictions.

## Match the user's intent

An audit or plan request stays read-only unless changes are authorized.
A request to fix/build/improve in code proceeds through implementation.
Do not silently replace that request with plans for another agent. Write
planning files only when requested.

Choose one coherent product surface or flow. Use the existing specification,
accepted decisions, and relevant PR history. Draft mockups and open PRs are
not proof of shipped behavior. Confirm which component, token, state owner,
and responsive variant actually govern the selected surface.

## Turn candidates into supported findings

For each proposed change establish:

1. The governing contract, contradiction, or stated user need.
2. The actual path to the affected UI, using source and rendered/reproduction
   evidence as appropriate. File proximity or a graph edge alone is not proof.
3. The user impact and a bounded correction, naming reusable owners/tokens
   when the evidence identifies them.

Source can establish a missing label or conflicting selector; claims about
clutter, prominence, or perceived coherence need rendered or user evidence.
Separate observed defects, design proposals, and unverified hypotheses.
Recheck counterexamples and deliberate exceptions, and deduplicate root
causes rather than reporting every repeated selector as a new issue.

Accessibility and interaction correctness remain quality requirements for
the affected UI. Do not discard them merely because a borrowed audit skill
narrows its own remit. Likewise, do not present unrelated backend findings as
visual-design defects.

## Review the result, not only the diff

Use relevant states: desktop and phone, narrow/resized panes, keyboard-open
layouts, long content, empty/loading/offline/error, waiting questions,
permissions, queued drafts, and returning to a document. Use synthetic or
redacted fixtures; do not upload private live content to outside tools.

For an audit, report a concise finding, impact, exact source/reproduction,
proposed scope, and justified confidence. Say when no supported findings
remain. For implemented work, use the existing test/build/browser workflow
and distinguish exercised behavior from coverage that was unavailable.
Never claim an approval or compliance level broader than the evidence.
