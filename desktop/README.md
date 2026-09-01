# Agentic Remote desktop shell

A small native shell around an Agentic Remote hub. It loads the hub's own UI
over HTTPS rather than bundling a copy, so there is exactly one interface to
maintain and the page stays same-origin with the API it calls.

`docs/desktop-app.md` in the repository root records why the architecture is
shaped this way. Read it before changing the security or window model.

## What the shell adds

| Integration | Status |
| --- | --- |
| Opens straight to your hub, no address bar | Yes |
| Persistent login across restarts | Yes, within the hub's Access session policy |
| Tray / menu-bar item | Yes |
| Dock, taskbar, or launcher badge of sessions awaiting input | Yes |
| Global shortcut to show or hide the window | Yes, `CmdOrCtrl+Shift+A` by default |
| Native notifications | Yes |
| Notification action buttons | Not yet, see below |
| `agentic://` deep links | Yes |

## Prerequisites

- Node 24 and pnpm 10
- The Rust stable toolchain (<https://rustup.rs>)
- Platform build dependencies listed at
  <https://v2.tauri.app/start/prerequisites/>

## Develop

```bash
cd desktop
pnpm install
pnpm icons          # generates src-tauri/icons from public/icons/icon-512.png
pnpm tauri:dev
```

The first launch opens the settings window. Enter the hub URL you normally open
in a browser. The address is stored in the platform config directory, never in
this repository, because host topology belongs to the machine.

## Build

```bash
pnpm icons
pnpm tauri:build
```

Bundles land in `src-tauri/target/release/bundle/`. macOS bundles can only be
built on macOS; each platform builds its own.

Without Apple notarization, macOS Gatekeeper requires a manual first open
(right-click, Open). The Tauri updater does not depend on Apple signing, so
notarization can be added later without changing the architecture.

## How the shell and the web app talk

The shell injects `window.__AGENTIC_DESKTOP__` into the hub page. The web app's
`src/desktop.ts` feature-detects every method on it, so:

- a browser or installed PWA is completely unaffected;
- an older shell paired with a newer hub silently loses only the capabilities it
  lacks.

Web to native calls use Tauri IPC, which is granted only to the configured hub
origins through a runtime capability. Native to web events are delivered by
evaluating `__emit` in the page and need no capability at all.

When adding a capability, change `src/desktop.ts` and this shell together, and
keep every method optional on the web side.

## Security boundaries

- IPC is granted to the configured hub origins only. There are no wildcards, and
  no filesystem, shell, or process permission is ever granted to a remote origin.
- Only `http` and `https` hub URLs are accepted.
- Switching hubs destroys the previous window so one hub's Access session is
  never presented to another.
- The shell stores no provider credentials, pairing tokens, or session content.
  It holds a hub URL, an optional direct address, and a shortcut.

## Known gap: notification actions

Answering a permission directly from a notification is the highest-value
integration and is not implemented yet. On desktop `tauri-plugin-notification`
uses `notify-rust`, which cannot register the notification categories macOS
requires for inline action buttons; that needs a direct
`UNUserNotificationCenter` implementation.

The bridge already carries `actions` and an `onNotificationReply` channel, so
this can be added in the shell without changing the web app.
