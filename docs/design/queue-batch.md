# Queueing several prompts at once

Queue a list of prompts to a session in one request. Each prompt stays its own
queue item and its own turn, delivered in order. Nothing is combined.

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
| `409` | Nothing is queued. Causes: the `batchId` was used for different prompts; the session is suspended, resuming, stopping or deleting; or the owning computer is too old to batch. |
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

## Interaction with the session

- **Running turn:** items wait behind it.
- **Idle session:** the drain starts the first item at once.
- **Terminal sessions:** items go to the app's durable queue, never to
  Copilot's own in-terminal queue, so each stays visible, editable, and
  restart-safe.
- **Concurrency:** the batch shares the queue lock with single sends, edits,
  and the drain, so a concurrent send lands wholly before or after the batch,
  never inside it.

## UI

**Queue several** (composer actions) opens a dialog.
- One field per prompt, with Add, Remove, Move up, and Move down. It starts
  with what is in the composer.
- The submit button reads **Queue N prompts**.
- **On success:** one acknowledgement, "Queued N prompts", and the composer is
  cleared.
- **On refusal:** "Nothing was queued", with the reason. The prompts stay in
  the dialog.
- **On an unconfirmed result:** the prompts lock, and **Retry** resends the
  same `batchId`, which cannot queue them twice.

Each queued item shows **Batch k of N**. The existing queue controls and
dispatch states apply to each item.

## Capability and rollout

- Providers advertise `supportsQueueBatch`.
- The hub refuses a batch for a computer whose provider lacks it, and the UI
  hides **Queue several** there.
- Older nodes are unaffected.

## Measured

`scripts/queue-batch-benchmark.ts` runs the hub in process with a fake SDK
runtime and compares N Queue requests, each awaited, with one batch (median of
3).

| Case | N | Individual | Batch |
|---|---|---|---|
| Admission, busy, empty store | 10 | 27 ms, 10 writes, 28 KB broadcast | 3 ms, 1 write, 6 KB |
| Admission, busy, empty store | 50 | 172 ms, 50 writes, 527 KB | 4 ms, 1 write, 26 KB |
| Admission, busy, 80 ms round trip | 10 | 823 ms | 83 ms |
| Admission, busy, 80 ms round trip | 50 | 4,129 ms | 84 ms |
| Admission, busy, 9.5 MB store | 50 | 1,926 ms | 35 ms |
| Until all have run, idle, 9.5 MB store | 50 | 18.3 s | 9.3 s |

- Admission cost becomes one round trip and one store write, whatever N is.
- Delivery is unchanged: each prompt is still one turn through the same drain.
- A single prompt gains nothing, so ordinary Send and Queue stay as they are.
