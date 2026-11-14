# Host telemetry sampler

`shared/host-telemetry.ts` defines capability version 1, validated host information, samples, disk space, minute aggregates, and the future process-row contract. Missing metrics and rates without a previous reading are `null`, not zero. Before the first sample, snapshot information and the latest sample are also `null`. Process start times are Linux start ticks; process CPU can exceed 100% across cores. No process collection is implemented here.

`HostTelemetrySampler` in `server/host-telemetry/` is inert until `start()`. `setViewers(n)` switches between a 1-second interval with viewers and 15 seconds otherwise. `snapshot()` returns copied information, the latest reading, up to 61 samples from the last 60 seconds, and disk space for the data directory's mount. `history()` returns up to 1,440 UTC-aligned minute buckets, including the current partial minute, with per-metric min/avg/max calculated only from available readings. History is memory-only and disappears on restart; missing minutes are not fabricated.

The thin Linux reader uses `fs/promises`, native OS metadata, and `statfs` (space available to this user). It caches static metadata and reads only the five metric files and disk space each interval. Partial `/proc` availability yields partial samples and diagnostics in `status()`. WSL detection considers both kernel strings and `WSL_DISTRO_NAME`; consumers must label these metrics **“WSL VM, not the Windows host.”**

CPU utilization excludes duplicate guest counters and treats idle/I/O wait as non-busy. Network totals exclude `lo`. Disk totals include whole `sd*`, `vd*`, `xvd*`, `nvme<n>n<n>`, and `mmcblk<n>` devices, using 512-byte sectors. Partitions, loop/ram/zram devices, device-mapper, software RAID, and NVMe controller-path aliases are excluded to avoid counting stacked I/O twice. Devices added since the previous read establish a baseline; removed devices contribute nothing. Counter resets contribute no negative traffic, while near-boundary 32/64-bit rollover is handled per device. Rates use monotonic elapsed time, not the wall clock.

The default per-sample timeout is 2 seconds. It aborts the reader, increments diagnostics, and discards late results. A reader that ignores abort retains the sampling slot until it settles: timeouts must never permit overlapping I/O. `stop()` clears timers, aborts an in-flight read, and prevents late publication. Inject a reader and clock to test without accessing a real host.

## Integration boundary

This module is exported but deliberately not connected to server startup. In `server/app.ts`, the transport owner must construct it inside `buildApp` **only when the effective `hostMonitor` hub flag is on**, call `start()` from the existing `onReady` hook under startup phase **`hostTelemetry.start`**, and call `stop()` from `onClose`. Pass the already-resolved `dataDirectory` to its constructor. The environment flag is `AGENTIC_REMOTE_FEATURE_HOST_MONITOR=on|off`, default off; the shared flags layer owns parsing and setup preservation. No client preview may activate the sampler. Construction and sampling must both remain absent while the flag is off.

Transport, viewer caps/slow-consumer handling, authenticated hub/node routes, capability negotiation and older-node “update this computer” states, UI, process attribution, and Oracle tools belong to later layers.
