# Agentic Remote native shell

A small native shell around an Agentic Remote hub, targeting macOS, iOS,
Windows, and Linux from one project. It loads the hub's own UI over HTTPS
rather than bundling a copy, so there is exactly one interface to maintain and
the page stays same-origin with the API it calls.

`docs/native-shell.md` in the repository root records why the architecture is
shaped this way. Read it before changing the security or window model.

## What the shell adds

| Integration | Desktop | iOS |
| --- | --- | --- |
| Opens straight to your hub, no address bar | Yes | Yes |
| Persistent login across restarts | Yes, within the hub's Access session policy | Yes |
| Badge of sessions awaiting input | Yes | Not yet, arrives with APNs |
| Native notifications from session events | Yes | Foreground only until APNs lands |
| Notification action buttons | Not yet | Supported by the platform, not yet wired |
| `agentic://` deep links | Yes | Needs the scheme in the Xcode project |
| Tray / menu-bar item | Yes | Not applicable |
| Global shortcut (`CmdOrCtrl+Shift+A`) | Yes | Not applicable |

## Install a build without a toolchain

You do not need Rust or Node to install the app.

**Any commit.** Open the repository's Actions tab, pick a run of the `CI`
workflow, and download the artifact for your platform from the run summary:
`agentic-remote-macos` (`.dmg`), `agentic-remote-windows` (`.exe` installer), or
`agentic-remote-linux` (`.deb` and `.AppImage`). Artifacts are kept for 14 days
and are attached to pull request runs too, so a change can be tried before it
merges.

From the command line, always download into a fresh directory:

```bash
gh run download <run-id> -n agentic-remote-macos -D ./build
```

**A published version.** Releases carry the same bundles and do not expire. The
macOS build in a release is a universal binary, so one download runs on both
Apple Silicon and Intel. Publish one by pushing a tag:

```bash
git tag shell-v0.1.0 && git push origin shell-v0.1.0
```

The `Shell release` workflow also accepts a manual run if you would rather not
push a tag.

### macOS: the first open

The builds are not signed or notarized yet, so Gatekeeper refuses a plain
double-click. Open it once with **right-click → Open**, then **Open** in the
dialog. macOS remembers the choice.

If macOS reports the app is damaged, the quarantine flag needs clearing:

```bash
xattr -dr com.apple.quarantine "/Applications/Agentic Remote.app"
```

Signing and notarization remove this step entirely and are planned; see
`docs/native-shell.md` §5.1.

### Linux

```bash
sudo apt install ./agentic-remote_0.1.0_amd64.deb
# or make the AppImage executable and run it
chmod +x Agentic\ Remote_0.1.0_amd64.AppImage
```

### iOS

There is no downloadable iOS build yet. It needs signing credentials, and
distribution goes through TestFlight or ad-hoc provisioning rather than a file
you can install directly. See `docs/native-shell.md` §5.2.

## Prerequisites

- Node 24 and pnpm 10
- The Rust stable toolchain (<https://rustup.rs>)
- Platform build dependencies listed at
  <https://v2.tauri.app/start/prerequisites/>
- For iOS: macOS, Xcode, and
  `rustup target add aarch64-apple-ios aarch64-apple-ios-sim`

## Develop

```bash
cd shell
pnpm install
pnpm icons          # generates src-tauri/icons from public/icons/icon-512.png
pnpm dev:desktop
```

For iOS, once on a Mac with Xcode:

```bash
pnpm ios:init       # generates src-tauri/gen/apple
pnpm dev:ios
```

The first launch opens the settings window. Enter the hub URL you normally open
in a browser. The address is stored in the platform config directory, never in
this repository, because host topology belongs to the machine.

## Build

```bash
pnpm icons
pnpm build:desktop
pnpm build:ios      # macOS only, needs signing credentials
```

Bundles land in `src-tauri/target/release/bundle/`. Bundles cannot be
cross-compiled; each platform builds its own.

Sign and notarize macOS builds with a Developer ID Application certificate.
Without notarization, Gatekeeper requires a manual first open (right-click,
Open). See `docs/native-shell.md` §5.1.

iOS is distributed through TestFlight internal testing or ad-hoc provisioning,
not the App Store — see `docs/native-shell.md` §5.2.

## How the shell and the web app talk

The shell injects `window.__AGENTIC_SHELL__` into the hub page. The web app's
`src/shell.ts` feature-detects every method on it, so:

- a browser or installed PWA is completely unaffected;
- an older shell paired with a newer hub silently loses only the capabilities it
  lacks;
- a platform that cannot do something (no tray on iOS) simply does not expose
  it.

Web to native calls use Tauri IPC, which is granted only to the configured hub
origins through a runtime capability. Native to web events are delivered by
evaluating `__emit` in the page and need no capability at all.

When adding a capability, change `src/shell.ts` and this shell together, and
keep every method optional on the web side.

## Security boundaries

- IPC is granted to the configured hub origins only. There are no wildcards, and
  no filesystem, shell, or process permission is ever granted to a remote origin.
- The hub is granted a named list of commands and nothing else. `hub_config` and
  `save_hub_config` are **not** in it, so the hub cannot read or change which hub
  the app points at; only the local settings page can.
- Only `http` and `https` hub URLs are accepted.
- Switching hubs destroys the previous window so one hub's Access session is
  never presented to another.
- The shell stores no provider credentials, pairing tokens, or session content.
  It holds a hub URL, an optional direct address, and a shortcut.

## Known gaps

**Notification actions.** Answering a permission directly from a notification is
the highest-value integration and is not wired up yet. On iOS the platform
supports it (the plugin uses `UNUserNotificationCenter`); on desktop the plugin
uses `notify-rust`, which cannot register notification categories, so macOS
needs a direct `UNUserNotificationCenter` implementation.

**iOS background notifications need APNs.** A Tauri iOS app is an embedded
WKWebView, so the existing Web Push path does not reach it. Until an APNs
transport is added to the hub, iOS notifies only while the app is in the
foreground.

**The iOS badge is not reachable yet.** `set_badge_count` is `#[cfg(desktop)]`
in Tauri 2.11 despite its documentation mentioning iOS, so `set_badge` is a
no-op on mobile. It arrives with the APNs work, which can carry a badge in the
payload.

When adding a native call, check the enclosing `impl` block's `cfg` rather than
the doc comment, and let the `shell-ios` CI job confirm it.

The bridge already carries `actions` and an `onNotificationReply` channel, so
both can be finished in the shell without changing the web app.
