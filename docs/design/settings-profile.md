# Settings profile

Settings that describe how you like to work follow you to every device that opens the same hub. Settings that describe a device, or hold content, stay on that device.

## Why

Before this design, nothing a browser chose reached the hub:

- The accent lived in `sessionStorage`, so it was per tab and reset when the
tab closed.
- Appearance, the status line, new-session defaults, the session sort and the
computer order lived in that browser's `localStorage`.
- The first visit ignored the OS light/dark preference, and appearance was
applied only after React mounted, so a Light user saw a dark flash.

A phone and a computer therefore never matched.

## Identity

The hub has no login. It's a single trusted-administrator interface behind an authenticated proxy (README → Security), and every `/api/` request passes the existing Host/Origin policy. **The profile belongs to the hub.**

- Every device that opens the same hub shares it.
- Different hubs, such as development and production, keep separate profiles.
- Anyone who can reach the hub already controls every session, so sharing
these preferences adds no exposure.
- With no in-app sign-out, "signing out" means clearing the browser's storage.
The profile then reloads from the hub.

## Classification

| Scope | Settings | Why |
|---|---|---|
| **Synced** (hub profile) | Appearance, accent, status line, new-session runtimes (model, effort, context, mode), new-session folders, session sort, computer order, Oracle's response style, what notifies you, preview features | How you work, not what the device is |
| **This device** | Keyboard shortcuts, sidebar, Knowledge and Oracle panel widths, Oracle's Ask/Delegate mode, Knowledge reading positions, notification permission and push subscription | Depend on the keyboard, viewport, browser, or local file being read |
| **Never stored in the profile** | Drafts, queued prompts, transcripts, credentials, push subscriptions, machine capabilities | Content or secrets |

Some related state is already hub-owned and is unchanged:

- the custom session order, suspended-session visibility, and hidden and
unread sessions (`/api/session-order`);
- Oracle's model and folder (`/api/manager/settings`).

"Follow latest" is per-view state, not a setting.

## Values

| Key | Value | Default |
|---|---|---|
| `appearance` | `system` \| `graphite` \| `light` | `system` |
| `accent` | `agentic` \| `ocean` \| `violet` \| `ember` \| `rose` \| `teal` | `agentic` |
| `statusline` | Partial map of the known status-line items to booleans | all shown except session ID |
| `newSessionRuntimes` | `{copilot?, claude?}`, each `{model, reasoningEffort, contextTier, mode}` | provider defaults |
| `newSessionFolders` | Computer ID → folder, at most 64 entries | home directory |
| `newSessionBackend` | `terminal` \| `sdk` — where New Session starts; one session can still override it | `terminal` |
| `sessionSort` | `custom` \| `recent` \| `attention` \| `name` | `custom` |
| `computerOrder` | Unique computer IDs, at most 200 | pairing order |
| `oracleResponseStyle` | `concise` \| `balanced` \| `detailed` | `balanced` |
| `notificationScope` | `all` \| `oracle` \| `off` | `all` |
| `previewFeatures` | Partial map of known preview feature names to booleans | all off |

Preview preferences sync through the same revision and conflict rules as other settings. Unknown preview names are ignored field by field, preserving known opt-ins when an older build reads a newer profile; known names still require boolean values. Loading an existing profile does not rewrite it. Previews that became standard behavior (`composerRefresh`, `settingsNavigation`, `healthCard` and `skillToggles` in 1.58.0) are ignored the same way: their stored values stay in the file until the profile is next saved by any settings change, which writes only known names. Rolling back before that save restores those opt-ins; after it, the older build shows them off. Preferences never enable hub behavior. The effective hub flags come from `GET /api/features` (`{hubFlags: {notificationCenter, hostMonitor, scheduler}}`), are read once at hub startup, and are not persisted by the browser. The browser refreshes them on hub reconnect and authoritative refresh, as well as focus and online events. It retains the last successful flags in memory when a refresh fails, so a transient network failure does not close an open Scheduler or discard its draft. Before any successful response, defaults remain off. A successful response turning a hub flag off still makes its dependent preview unavailable without discarding the user's preference. These are hub-owned rollout controls, so nodes do not report them; future node-specific services must negotiate their own capabilities.

Hub rollout environment values accept only `on` or `off`, case-insensitively with surrounding whitespace ignored. Unset variables default off; any other value stops startup and names the variable.

`newSessionBackend` covers sessions you create. Oracle's sessions follow its own hub setting (`/api/manager/settings` `sessionBackend`).

Oracle runs on the hub, so it reads `oracleResponseStyle` from the same store as each turn's prompt is built; no browser relays it.

`notificationScope` works the same way:
- The hub's push service reads it for every notification, so the choice
reaches all devices at once (see app-spec §10).
- A later per-session or per-project scope becomes its own key, applied after
this one. The existing hub-side session mute already works that way. See [Oracle → Prompt composition](session-manager.md#prompt-composition).

`system` follows the device's `prefers-color-scheme` live, and an unset appearance means the same thing. Choosing Graphite or Light pins the appearance on every device.

Validators live in `shared/settings-profile.ts`, so the hub and the browser agree on them.

## Hub protocol

The hub stores the profile in `<data>/settings-profile.json`:

```json
{"version":1,"profileId":"uuid","revision":7,"values":{},"keyRevisions":{},"keyWriters":{},"keySeqs":{}}
```

| Request | Effect |
|---|---|
| `GET /api/settings` | `{settings: {profileId, revision, values}}` |
| `PATCH /api/settings` `{deviceId, changes: {key: {value, baseRevision, seq}}}` | Applies each change. `value: null` resets the key to its default. |
| `POST /api/settings/import` `{deviceId, values}` | Fills only keys that were never set, so the first device wins per setting |

- A change conflicts when `keyRevisions[key] > baseRevision` and
`keyWriters[key]` is another device, meaning someone else committed that key after this device last saw the profile.
  - `deviceId` is a random ID each browser keeps in its cache and shares with
    its tabs.
  - A device's retry of its own write is therefore not a conflict, even when
    the first response was lost.
  - A request without a `deviceId` treats every newer write as another
    device's.
- `seq` is the device's own edit number: the edit's time, and at least one
more than the last number in the shared copy.
  - The hub keeps each key's latest `seq` with its writer and ignores an older
    or repeated edit from that same device. A late request from one tab
    therefore cannot replace a newer edit from another.
  - An edit that picks the value already there still records its device and
    `seq`, without a new revision or a broadcast.
  - The newer value is kept, and the key is returned in `conflicts`.
  - The browser shows "changed on another device", so nothing is lost
    silently.
  - Changes to other keys in the same request still apply, so two devices
    editing different settings never conflict.
- A reset keeps its key revision as a tombstone, so a later import cannot
bring an old value back.
- Validation:
  - An unknown top-level setting key or a malformed value refuses the whole request with `400`.
  - The profile is limited to 32 KB (`413`).
  - Commits are serialized and persisted with an atomic rename before the
    response is sent.
- Every commit that changes something broadcasts
`{type: 'settings.updated', settings}`. A commit that changes nothing keeps its revision.
- `profileId` changes only when the file is recreated. A browser that sees a
new ID treats the hub as reset and offers its cached values as an import.

## Browser

- **Cache.** `agentic-remote:settings-profile` in `localStorage` holds
`{deviceId, nextSeq, profileId, revision, values, pending}`.
  - Tabs share it. Every change reads it first and writes it straight back,
    so one tab never drops another's unsent edit.
  - The `storage` event shows another tab's change at once.
  - Startup applies it synchronously, so returning devices render the right
    theme at once.
  - It is then reconciled with `GET /api/settings`.
- **Edits.** An edit applies immediately and is recorded in `pending` with the
revision this device had seen. It is then sent in a `PATCH`.
  - Requests are sent one at a time.
  - An edit made while a request is in flight is rebased onto that request's
    result.
- **Offline.** Network failures and `5xx` responses keep `pending` and show
"saved on this device".
  - Retries happen on the websocket reconnect, the `online` event and a
    bounded backoff.
  - A `4xx` response to a batch retries its keys one at a time. Only the
    refused setting is dropped, and the notice names it. Imports work the same
    way.
- **Live updates.** `settings.updated` events apply when they are newer than
the cached revision. A key with a pending local edit keeps showing that edit until its request settles.
- **Migration.** A device with no cache imports the legacy keys it actually
holds (`agentic-remote:appearance`, the tab accent, `statusline`, `default-models`, `default-session-folders`, `session-sort`, `computer-order`).
  - The legacy keys are left untouched, so rolling back restores the old
    behaviour.
- **No flash.** An inline script in `index.html` applies `data-appearance` and
`theme-color` from the cache, the legacy key, or `prefers-color-scheme` before the bundle loads.

## Navigation and confirmation focus

On narrow screens, All settings returns focus to the selected category so keyboard navigation can continue without falling back to the document body. Skill changes move focus into their confirmation; cancel, success, and failure return it to the originating skill control. The control is identified by its source/location rather than name alone. If the refreshed skill is absent or no longer manageable, Search skills receives focus instead. Focus targets are local UI state and are never stored in the profile.

## Tests

- **Store:** commit and persist, conflicts per key, resets and tombstones,
import fills only unset keys, bounds and malformed input, concurrent commits, reload, unreadable file, and a recreated profile.
- **Routes:** each request, `400`/`413`, a foreign Origin (`403`), and the
broadcast.
- **Client sync:**
  - first visit, an explicit choice, reload, and a closed and reopened tab;
  - cleared storage ("sign out and back in");
  - two devices, offline then online, and stale writes;
  - migration and a hub reset.
- **App:** both appearances follow the OS when unset, an explicit choice pins
them, live events apply, and the sync status and contract copy show.
- **Inline bootstrap:** runs against the same cases as the resolver.
- **Contrast:** every accent in both appearances.
- **Playwright:** desktop and phone, in both appearances.

## Limitations

- There is no per-user identity. People who share a hub share its profile.
- The development and production hubs don't share settings.
- A device that has never loaded the app on a hub, or whose storage was
cleared, renders from the OS preference until the profile loads.
- Keyboard shortcuts stay per device, because modifier keys differ between
operating systems.
- `localStorage` has no cross-tab lock. Each change is one synchronous read
and write, so only two tabs writing in the same instant can still race.
