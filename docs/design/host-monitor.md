# Host monitor

Status: Linux sampling, on-demand process inventory, authenticated hub/node transport, and Oracle's read-only status tool are implemented behind `AGENTIC_REMOTE_FEATURE_HOST_MONITOR=on` (default off). Optional resource alert records additionally require `AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER=on`. The client is available through the independent default-off `hostMonitorView` preview.

## Lifecycle and transport

Each enabled computer, hub or node, constructs one sampler inside `buildApp`. It starts in `onReady` under startup phase `hostTelemetry.start` and stops in `onClose`. The shared flag parser reads the environment once at startup; client preview settings cannot activate collection. With the flag off, no sampler is constructed, no scans run, and host routes return 404.

The hub exposes the following origin-enforced, uncached endpoints:

| Route | Result |
| --- | --- |
| `GET /api/computers/:computerId/host` | `HostSnapshot`, with nullable information/latest sample before the first successful collection |
| `GET /api/computers/:computerId/host/history?range=24h` | Up to 1,440 one-minute min/avg/max aggregates; the current minute may be partial |
| `GET /api/computers/:computerId/host/processes` | `{ rows, truncated, othersCount, scannedAt }`, scanned on demand on the owning computer |
| WebSocket `/api/computers/:computerId/host/live` | Receive-only `{ type: "host.snapshot", snapshot }` messages, initially and after each accepted sample |

WebSockets reuse the application's existing event transport and authenticated node upgrade pattern rather than introducing SSE. A dedicated per-computer route isolates high-frequency telemetry and its viewer lifetime from the global session event socket; opening an ordinary session does not start active sampling. Each viewer calls `setViewers`; the last disconnect restores the 15-second idle interval. The owning computer and each hub proxy cap concurrent viewers at 32; excess upgraded viewers close with code 1013. A consumer may have at most two pending frames and 128 KiB buffered output. A write stalled for five seconds closes with 1013, releases its viewer immediately, and is forcibly terminated after a further second if it does not close cooperatively. Incoming client messages are rejected.

Nodes provide the same routes under `/node-api/host`, `/node-api/host/history`, `/node-api/host/processes`, and `/node-api/host/live`, all requiring the existing bearer token. `ComputerManager` resolves local telemetry or proxies to the registered owning node; credentials are not forwarded to the browser. Node HTTP reads and upgrades have five-second timeouts, streaming frames are size/schema checked, and a remote stream with no samples for 20 seconds is disconnected. Disconnect, shutdown, removal, and re-pairing release subscriptions. The sampler's existing two-second abort timeout and non-overlap rule remain authoritative.

Authenticated `/node-api/info` advertises `hostTelemetry: { version: 1, enabled }` even when collection is off. This small capability metadata addition is necessary to distinguish a supported-but-disabled node from an older release; all telemetry routes remain absent while disabled. The hub returns an actionable 409 saying “Update this computer” when the capability/version is missing or unsupported, or “turned off on this computer” when disabled. Connection failures return 503; malformed peer telemetry returns 502, including JSON decoding failures and schema-invalid JSON. Host-read failures do not mark the computer offline or invalidate session reads. History accepts only `24h` (also the default); other ranges return 400.

## Process inventory

`scanProcesses(context)` in `server/host-telemetry/processes.ts` returns `{ rows, truncated, othersCount, scannedAt }`. Transport reuses one context per computer for CPU deltas. There is no scanning timer: only a Processes HTTP request or an explicit Oracle status read can request a scan. Requests are limited to once every five seconds per owning computer, even with live viewers; concurrent or early requests return 429 rather than starting extra work. No provider startup, process control, or persistence is involved.

The scanner inspects at most 4,096 numeric `/proc` entries in PID order, using batches of 32 and yielding to the event loop between batches. Its default reader uses synchronous calls only for tiny per-process kernel metadata, avoiding the measured thread-pool overhead of thousands of asynchronous filesystem operations without holding the event loop for the whole scan. It filters by the process directory's UID against the current user's UID before reading details. `othersCount` counts other-user entries encountered within that bound, not an estimate of all processes on a truncated or permission-restricted host. Processes that vanish, become inaccessible, change UID, or change identity during a read are skipped. A scan is a bounded best-effort snapshot, not an atomic kernel view.

Rows retain only PID, start ticks, executable basename, CPU percentage, RSS bytes, and proven ownership metadata. No command line, arguments, working directory, environment, or provider history is read. `/proc/<pid>/exe` supplies the executable basename; an inaccessible symlink falls back to `comm` for display only. Deleted executable suffixes and control characters are removed. Only page size and clock frequency are retained from `/proc/self/auxv`; no addresses or other auxiliary entries leave that reader.

Start time is the kernel's `/proc/<pid>/stat` start tick count, not a wall-clock timestamp. CPU uses the change in `utime + stime` divided by elapsed monotonic time and the host's clock frequency. One busy core is 100%, so multithreaded processes may exceed 100%. The first scan, a new/reused PID, a reset counter, or non-positive elapsed time reports zero because the current process-row contract requires a number. RSS uses resident pages multiplied by the host's page size. Baselines are scoped to the caller's context and retained weakly.

## Conservative attribution

- **Session:** A terminal controller observation proves the session-to-pane binding using its existing owner resolution. Discovery captures the owner's start ticks before a fresh session-identity check and carries them through the terminal controller's cache. `SessionPaneRoots` compares those proven ticks when observing a pane binding; it never trusts a replacement PID by learning its identity after the lookup. It records the pane's start ticks but does not rediscover sessions from process arguments or infer ownership from tmux session/window names. Those names are user configurable and multiple session windows can share a tmux session. The read-only `listSessionPaneRoots()` accessor verifies that tmux still reports the same pane ID/PID and that the observed session process retains its identity and ancestry beneath the pane. A surviving shell is not attributed after its session process exits, detaches from the pane ancestry, or its PID is reused. The scanner compares the recorded pane start ticks to both the inventory and a fresh root read. A missing, conflicting, stale, or unverifiable root is not attributed. Valid roots and descendants carry the local `sessionId`.
- **Agentic Remote:** The service's own PID and verified descendants are attributed to the service, except a subtree proven to belong to a terminal session or a shared runtime. Service identity is checked before and after the scan.
- **Shared runtime:** Outside a proven terminal subtree, a verified service descendant whose actual executable basename is exactly `copilot`, `copilot-runtime` (the bundled SDK executable), or `claude` anchors a shared runtime subtree, labeled “Shared Copilot runtime” or “Claude runtime”. Descendants inherit that label and never receive a `sessionId`. The session service shares one runtime client among multiple SDK sessions; Claude query owners provide no supported per-session PID. An interpreter named `node`, a mutable `comm` string, an unrelated executable with the same name, or a wrapper is not sufficient runtime evidence. Unsupported executable layouts remain service-owned or other rather than guessing.
- **Other:** Anything without a complete verified ancestry chain to one of these roots. Missing parents, cycles, and a parent that started after its child break ancestry. PID alone never establishes identity.

Attribution does not initialize providers or call SDK APIs. Terminal observation adds only best-effort stat reads when a newly proven pane/owner binding appears; it does not change tmux commands, launch behavior, readiness, or ownership decisions. Its failure cannot reject a terminal operation. The accessor only lists panes, with a timeout, and rechecks the recorded session process identity; it returns values rather than mutable controller state. It prunes retired pane bindings and exited, reused, detached, or unverifiable session owners. At most 4,096 recently observed bindings are retained, evicting the least recently observed entry at capacity. All roots share a total budget of 4,096 ancestry stat reads per accessor scan, yielding after every 32 reads. A root whose proof exceeds the remaining budget stays unattributed in that scan without losing its retained observation. Existing sessions not yet observed by this controller remain unattributed until normal terminal interaction proves their binding.

## Oracle status reads

`get_host_status({ computerId? })` uses `ComputerManager.hostTelemetryTarget`, the same path as the hub API; it never reads `/proc` directly. A computer ID or name selects one computer. Without it, the tool reads at most eight computers and reports omissions; the entire result is capped at 16,000 characters, with bounded names and a truncation notice. It reports hostname, hub/node role, the explicit WSL VM label, CPU, used/available memory, free space on the data mount, 1/5/15-minute load, and sample age. Samples older than 30 seconds are marked stale.

Paired-computer ages use the supplied monotonic sample age, never a blind comparison of node and hub wall clocks. Legacy payloads without sample age retain their metrics but explicitly report unknown sample age and current health, with an update instruction; they are not labeled current or fresh.

The five highest-CPU visible processes include executable basename, PID, CPU, RSS, and conservative ownership. Only proven session-owned rows receive session links; shared runtimes never receive inferred session IDs. Partial inventories are labeled. The first process scan has no CPU baseline and therefore reports zero, as above. The existing five-second scan admission remains in force: a rate-limited or failed inventory is explicitly unavailable without discarding the host summary. Reads neither subscribe viewers nor change sampler cadence.

The tool is read-only in Ask, Delegate, voice, and proactive turns. The production resolver returns a disabled response when the hub flag is off, without constructing a sampler or contacting nodes; Oracle can explain that status is “not available on this computer.” Older/disabled nodes receive the same explicit unavailable state with an update/enable instruction, and offline computers remain unavailable. Runtime errors and pairing details never enter the result. No process control or provider startup is involved.

## Optional resource notifications

Only a hub with both `hostMonitor` and `notificationCenter` enabled constructs `HostAlertMonitor`. It starts under `hostAlerts.start` and stops before notification storage is flushed. It polls snapshots through ComputerManager every 15 seconds after the previous poll settles, with at most four concurrent node reads. It never requests process inventories, opens live viewers, or raises idle sampling to one second. Missing capabilities, disabled nodes, connection failures, and offline computers provide unavailable observations rather than invented resource readings.

Resource observations enter `NotificationCenterService.host` and the canonical notification classifier/store. They create warning-severity `host.alert` records only; they do not add a new push/native delivery path or change existing error-severity health alerts.

Freshness is evaluated at classification time, adding elapsed hub queue time to the sample age captured when the hub received the snapshot. The receipt timestamp belongs to the hub, so paired-computer clock skew cannot make queued data look newer.

- Memory must stay strictly above 90% for at least two minutes of fresh readings. A below-trigger reading resets a pending interval. An active episode recovers at or below 85%.
- Disk free space on the data mount must be strictly below 5%; an active episode recovers at or above 7%.
- Repeated samples and out-of-order samples cannot advance an episode. Samples older than 30 seconds or more than five seconds in the future are unusable. Missing readings or a gap over 45 seconds reset pending memory pressure.
- One record is admitted per computer, condition, and episode. An episode's first qualifying sample anchors its stable identity. Recovery must occur before another episode can begin; a 30-minute per-computer/per-condition cooldown also prevents renewed episodes from alerting immediately. If pressure persists through the cooldown, the new episode may alert on the next fresh breached reading.
- Episode, recovery, and cooldown cursors persist atomically with notification records. Hub restart, duplicate reads, and node reconnect do not resurrect read or dismissed records. Disabling either flag stops collection for these alerts; existing records remain intact.

## Client preview

The rail (or existing drawer footer with the rail preview off) opens a computer picker with hostname and hub/node role, only when this view's preview and hub flag are both enabled. WSL is explicitly “WSL VM, not the Windows host”. CPU, memory, network, disk I/O, 1/5/15-minute load, and disk capacity use current values and small SVG trends. The live window is 60 seconds; the 24-hour toggle reads the existing minute aggregates and refreshes once per minute. Charts position samples by timestamp across the selected time window, breaking paths at missing readings or gaps over 1.5 seconds live and 90 seconds in minute history.

The telemetry contract does not retain historical disk capacity. The client therefore collects a 60-second disk-capacity trend only while open, and explicitly labels the missing 24-hour capacity history rather than inventing values. Retained CPU/memory/network/I/O history is unchanged.

Processes requests run sequentially at most every five seconds only while that tab and document are visible. All, Agentic Remote, and Agent sessions filters retain shared-runtime labels; only proven session ownership enables an Open session link. No arguments or process-control actions are shown. Pause freezes presentation, not collection or subscription. Closing the view, switching computers, going offline, or hiding the document releases the stream and timers; reopening refetches authoritative data. Compatibility, disabled-computer and offline failures retain their actionable messages.

An open monitor retries failed initial snapshots and lost streams with bounded exponential backoff from 1 to 30 seconds; hiding or closing it cancels pending work. Invalid snapshots/frames and explicit version-conflict responses remain in the actionable update-required state without automatic retries. Reopening the view allows a fresh compatibility check.

## Remaining integration

Final overhead gates and the 48-hour soak remain planned. Isolated scan measurements do not establish the full sampler's overhead budget.

Browser fixtures recognize every host endpoint and the live message. `setupWorkspaceFixture(..., { hostMonitor: true })` provides fictional Studio/Build node snapshots, a 60-second ring, 24-hour history, and conservative process attribution; omitted/false keeps all host surfaces unavailable.

The opt-in capture `pnpm screens -- --output-dir <directory> --scene oracle-panel --viewport desktop --viewport phone --oracle-host-status` shows Oracle answering “Why is the hub slow?” from fictional resource-pressure data formatted by the real read tool, without contacting any host. It produces `desktop-oracle-host-status.png` and `phone-oracle-host-status.png`; the default visual-lock scenes remain unchanged. `e2e/oracle-host-status.pw.ts` checks the answer, WSL scope, read-only wording, and proven session link at both sizes.
