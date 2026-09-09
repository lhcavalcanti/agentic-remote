# Agentic Remote reference

Agentic Remote is a phone-first workspace for supervising Copilot and Claude
Agent sessions on trusted computers. A hub serves the application; each session
and its provider runtime stay on the computer that owns them.

## Specifications

| Document | Use it for |
| --- | --- |
| [Application specification](app-spec.md) | Normative product decisions and detailed behavior invariants |
| [UI/UX specification](specs/ui-ux.md) | Screens, navigation, state ownership, keyboard/touch behavior, reading and acceptance criteria |
| [Functional requirements](specs/functional-requirements.md) | Entities, providers, lifecycle, delivery, permissions, tasks, files and recovery |
| [Machine setup specification](specs/machine-setup.md) | Prerequisites, hub/node setup, private state, services, promotion, rollback and native-client boundaries |
| [Architecture](architecture.md) | Implementation ownership, routing, concurrency and commit boundaries |
| [Provider compatibility](provider-compatibility.md) | Supported provider/backend combinations and deliberate differences |
| [Deployment and promotion](deployment-promotion.md) | The machine-local profile and operational procedure |

The three topic specifications are focused views of the application contract,
not competing designs. `app-spec.md` remains the product authority.
[Repository instructions](../.github/copilot-instructions.md) govern operational
authorization. A proposed improvement or an open issue is not evidence that a
feature exists, and an implementation gap is not permission to weaken a
requirement.

## Review and improvement evidence

| Document | Status |
| --- | --- |
| [Code review, gaps and open issues](reviews/2026-09-09/code-and-issues.md) | September 9 core review at `15a043e`, plus the v1.1.1 publication delta and seven issue dispositions |
| [Performance investigation](performance.md) | Repeated synthetic measurements, supported bottlenecks and prioritized improvements |
| [SDK and architecture roadmap](sdk-architecture-roadmap.md) | Proposed sequencing; recheck its older issue/PR references before implementation |
| [Workspace design](design/agent-workspace.md) | Design rationale and synthetic review flows |
| [Native shell](native-shell.md) | Native-client decisions, implementation phases and unverified platform gates |

The dated review is historical evidence. It does not certify that every path was
executed, that a live deployment passed, or that an issue remains open after the
review date. Source references, reproduction commands, measurement limits and
issue dispositions are recorded in the review rather than hidden in chat.

## Maintaining this reference

For an intentional behavior change, update the relevant topic specification and
the detailed application contract together. Keep stable acceptance IDs in the
topic files; link their regression coverage instead of copying test bodies.
Update architecture and setup documentation when ownership, persistence,
transport, capabilities or operations change.

Keep measured facts separate from proposed budgets. Record the source commit,
workload, runtime, sample count and limitations with performance results. Never
commit live session transcripts, machine-local profiles, tokens or credentials
as evidence. Refresh the maintained [code graph](../graphify/README.md) after
tracked documentation or source changes.
