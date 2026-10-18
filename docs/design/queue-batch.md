# Queueing several prompts at once

Queue a list of prompts to a session in one request. Each prompt stays its own
queue item and its own turn, delivered in order. Nothing is combined. It works
for every provider that advertises it (Copilot SDK, Copilot in tmux, Claude),
from the composer, from Oracle, and through the API.

## Why

Queueing N prompts today costs N of everything:
- N requests, each a separate round trip from a phone;
- N writes of the whole session store;
- N full-session broadcasts to every open device.

The client also has to wait for each acknowledgement before sending the next,
or the order is not guaranteed. A batch costs one of each.

## What a batch is

| | Batch |
|---|---|
| Admission | One request, all or nothing |
| Queue | N ordinary items appended after the existing queue, each tagged `batch: {id, index, size}` |
| Delivery | Unchanged: the existing drain runs each item as its own turn, exactly once, in FIFO order |
| Per item | Edit, remove, reorder, and Send now work on each item as before |

A batch never becomes one model prompt. Combining prompts would change their
context, turn boundaries, tool execution, permissions and recovery. A user who
wants that writes one message.

## API

`POST /api/computers/:computerId/sessions/:sessionId/queue/batch`

```json
{ "batchId": "client-generated id", "prompts": ["first", "second"] }
```

| Rule | Limit |
|---|---|
| Prompts | 1 to 50 |
| Each prompt | Not blank after trimming; at most 200,000 characters, like a message; does not start with `/` (commands are sent on their own) |
| Whole batch | At most 1,000,000 characters |
| `batchId` | 8 to 100 characters of `A-Z a-z 0-9 _ -` |

| Response | Meaning |
|---|---|
| `201 {session, batch: {id, promptIds, duplicate: false}}` | Admitted |
| `200 {…, duplicate: true}` | This `batchId` was already admitted with the same prompts. Nothing new is queued, and the original item IDs are returned. |
| `400` | Malformed or over a limit. Nothing is queued. |
| `409` | Nothing is queued. Causes: the `batchId` was used for different prompts; the session is closed, suspended, resuming, stopping or deleting; its terminal is not connected yet or still settling a delivery; or the owning computer is too old to batch. |
| `404` | Unknown session |

## Exactly once

Validation runs before anything is written. One store mutation then:
- appends every item;
- records `{id, digest, promptIds, admittedAt}` in the session's last 20
  batches.

The write persists before the response.

- **A failed write** leaves nothing queued, so a retry admits the batch.
- **A lost response** after a committed write is safe: the retry carries the
  same `batchId`, matches the digest, and gets the original items back.
- **The same `batchId` with different prompts** is refused, not merged.

Delivery after admission is the existing drain:
- items are reserved one at a time, persisted, and dispatched;
- the queue holds behind a running turn, a pending permission or question, a
  failed prompt awaiting recovery, or an unconfirmed dispatch;
- one item failing, being retried, edited or removed leaves its neighbours as
  they are.

## Session states

| State | Admission | Delivery |
|---|---|---|
| Running turn | Admitted | Items wait behind it |
| Idle | Admitted | The first item starts at once |
| Permission or question pending | Admitted | Held until it is answered, then in order |
| Failed prompt or unconfirmed dispatch | Admitted | Held until it is resolved |
| Resuming or reopening | Refused | — |
| Suspended | Refused; resume first | Items already queued run after resume |
| Closed | Refused; reopen first (Oracle does) | Items already queued run after reopen |
| Terminal not connected yet (hub restart, discovery pending) | Refused; retry shortly | — |
| Hub restart with items queued | — | Kept; a tmux session whose pane is gone closes and runs them after reopen |

- **Terminal sessions** are recognised by stored backend as well as discovery.
  Items go to the app's durable queue, never to Copilot's own in-terminal
  queue, so each stays visible, editable, and restart-safe. A batch never
  attaches an SDK owner to a terminal session.
- **Concurrency:** the batch shares the queue lock with single sends, edits,
  and the drain, so a concurrent send lands wholly before or after the batch,
  never inside it.
- **Notifications:** a session that is still draining its queue is not
  finished, so a batch raises one "Finished" notification at the end, not one
  per prompt.

## When one item fails

Admission is all or nothing. Delivery is per item:
- **Definitely refused** (nothing was handed over): the item returns to its
  place. **Send now** retries it.
- **Unconfirmed** (it may have arrived): the queue holds, and nothing behind
  it moves. After checking the provider, the user picks one of two buttons:
  - **Retry here** puts the item back where it was, and the drain carries on
    in order.
  - **Discard unconfirmed queue item** drops it.
- Either way its neighbours stay as they were.

`POST …/queue/:promptId/retry {acknowledgesDispatch}` names the unconfirmed
attempt it answers, so a stale retry is refused with `409`.

## UI

**Queue several** (composer actions) opens a dialog.
- One field per prompt, with Add, Remove, Move up, and Move down. The
  composer's text moves into the first field.
- The submit button reads **Queue N prompts**. The dialog belongs to the
  session it was opened from and cannot be closed while a batch is being sent.
- **On success:** one acknowledgement, "Queued N prompts". The composer is
  cleared if its text was taken, however that field was edited, moved, or
  removed.
- **On refusal:** "Nothing was queued", with the reason. The prompts stay in
  the dialog. The server marks every refusal raised before the write
  `uncertainDelivery: false`.
- **On an unconfirmed result**, including a success whose answer was cut off:
  the prompts lock, and **Retry** resends the same `batchId`, which cannot queue
  them twice. The batch is kept for that session in this tab's
  `sessionStorage`, at most 20, so closing the dialog or reloading the page
  brings it back locked.

Each queued item shows **Batch k of N**. The existing queue controls and
dispatch states apply to each item.

**Oracle** has `queue_prompts`. It takes a session and a list of prompts,
reopens a closed session or resumes a suspended one first, answers a
folder-trust prompt, and queues the list as one batch.

## Capability and rollout

- Providers advertise `supportsQueueBatch` and `supportsQueueRetry`.
- The hub refuses either action for a computer whose provider lacks it, before
  sending anything there, and the UI hides the control.
- Older nodes are unaffected.

## Measured

`scripts/queue-batch-benchmark.ts` runs the hub in process, with either a fake
SDK runtime or a fake tmux pane. It compares N awaited Queue requests with one
batch and reports the median of 3 runs. `tmux 20 ms` charges each pane probe
about what `terminal.has` and `terminal.capture` cost on the development host
(p50 19 and 26 ms). Every run checks that each prompt was delivered exactly
once, in order.

| Case | N | Individual | Batch |
|---|---|---|---|
| Terminal, busy, tmux 20 ms, 80 ms round trip: admission | 10 | 1,231 ms, 20 pane reads | 82 ms, 0 |
| Same, admission | 50 | 6,162 ms, 100 pane reads | 82 ms, 0 |
| Same, until all 50 have run | 50 | 8.4 s | 2.3 s |
| Terminal, busy, 9.5 MB store, tmux 20 ms: admission | 50 | 3,877 ms, 50 writes | 31 ms, 1 write |
| SDK, busy, 80 ms round trip: admission | 10 | 827 ms | 82 ms |
| SDK, busy, empty store: admission | 50 | 142 ms, 50 writes, 527 KB broadcast | 3 ms, 1 write, 26 KB |
| SDK, idle, 9.5 MB store: until all 50 have run | 50 | 17.1 s | 8.0 s |

- Admission becomes one round trip and one store write, whatever N is. On a
  terminal session it also needs no pane reads.
- Delivery is unchanged: each prompt is still one turn through the same drain.
- A single prompt gains nothing, so ordinary Send and Queue stay as they are.
- On an idle session the drain starts while admission is being measured, so
  small idle batches show the first turn's writes too.
