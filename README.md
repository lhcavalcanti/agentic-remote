# Agentic Remote

A mobile-first web interface for running and supervising GitHub Copilot CLI
sessions across multiple computers.

One **hub** serves the browser UI. Each paired computer keeps ownership of its
Copilot processes, authentication, repositories, tools, and conversation
history. Agentic Remote routes commands to the owning computer instead of
copying projects or creating detached sessions.

## Highlights

- Control local and remote Copilot CLI sessions from one responsive UI.
- Create tmux-backed sessions that remain accessible through SSH.
- Resume persisted Copilot conversations from any paired computer.
- Send, queue, edit, remove, cancel, clear, restart, and rename sessions.
- Answer `ask_user` questions and terminal permission prompts from the browser.
- Follow running tools and retain completed tool and agent-launch history.
- Configure model, reasoning effort, context tier, and status-line fields.
- Record microphone audio directly into a private local transcription.
- Browse session files with Markdown, PDF, search, and saved Knowledge views.
- Install as an iPhone/iPad PWA with push notifications and in-app updates.
- Deploy immutable releases with systemd, rollback, and automatic restart.

## How it works

```text
Browser / installed PWA
          |
          v
       Hub server
       /        \
local sessions   authenticated node API
                         |
                         v
                  remote Copilot sessions
```

- A **hub** serves the UI, owns local sessions, and stores the paired-computer
  registry.
- A **node** exposes only its authenticated machine API; it does not serve the
  UI.
- A hub is also a node, so local and remote sessions share the same routing
  model.
- Repositories, Copilot credentials, and execution remain on the computer that
  owns each session.

See [Multi-computer architecture](docs/architecture.md) for routing,
authentication, ownership, and failure behavior.
See [Application specification](docs/app-spec.md) for the durable product,
mobile UX, privacy, lifecycle, and release contracts.

## Requirements

- Linux with systemd user services for managed deployment
- Node.js 22 or newer
- pnpm
- tmux for terminal-backed sessions
- An installed and authenticated GitHub Copilot CLI

Confirm that Copilot starts successfully before installing Agentic Remote:

```bash
copilot
```

## Quick start

Clone the repository on the computer that will serve the UI, then run:

```bash
./bin/agentic-remote setup --role hub --name development
```

For access from a trusted LAN, bind to that computer's LAN address:

```bash
./bin/agentic-remote setup \
  --role hub \
  --name development \
  --host 10.0.0.181 \
  --port 4317
```

Setup:

1. Installs dependencies.
2. Builds the production app.
3. Creates an immutable release.
4. Installs and enables a systemd user service.
5. Attempts to enable user lingering for startup at boot.
6. Links `agentic-remote` into `~/.local/bin`.

Open the URL printed by setup.

## Add another computer

On the remote computer:

```bash
./bin/agentic-remote setup \
  --role node \
  --name homelab-prod \
  --host 10.0.0.233 \
  --port 4317

agentic-remote pair-info
```

On the hub:

1. Open **Sessions → Manage computers**.
2. Enter the node URL.
3. Paste the pairing token from `pair-info`.

The Sessions sidebar always shows every configured computer and its open
sessions. Selecting or creating a session does not hide the other computer
groups.

Pairing tokens grant control of Copilot sessions on that node. They are stored
with user-only permissions and are intended for a trusted LAN. Use TLS, an
encrypted overlay, or an upstream access layer before exposing either service
outside the trusted network.

## Sessions

### Create a session

Choose **New session**, select a computer, and browse from `~` to the desired
folder. Directory browsing is restricted to that computer's home directory.

New sessions use these defaults:

- **Create in tmux**: enabled
- **Allow all permissions**: enabled

> [!CAUTION]
> Allow-all runs tools without individual approval. Clear the checkbox when you
> want the agent to ask before protected operations.

A tmux-backed session opens a window in the preferred existing tmux session.
Attach over SSH with:

```bash
tmux attach
```

Clear **Create in tmux** to create an SDK-only session.

### Resume history

Choose **New session → Open previous** to browse and reopen persisted sessions
for a computer.

### Rename, clear, restart, and close

- **Rename** updates Agentic Remote, Copilot metadata, and the tmux window.
- **Clear** (`/clear`) removes Copilot context and UI history while keeping the
  folder, title, and tmux window. Internally it replaces the Copilot session ID
  so deleted history cannot return.
- **Restart** (`/restart`) restarts the owning process while preserving the
  session ID, transcript, queue, title, folder, and runtime settings.
- **Close** permanently deletes the Copilot session and its history from the
  owning computer.

## Chat and queue behavior

Composer shortcuts follow Copilot CLI conventions:

| Action | Shortcut |
| --- | --- |
| Send on desktop | `Enter` |
| Insert newline on desktop | `Shift+Enter` |
| Insert newline on phone | Keyboard Return/Enter |
| Send on phone | Send button |
| Queue behind the active turn | `Ctrl+Enter` or `Cmd+Enter` |
| Open command completion | Type `/` |

Drafts are stored independently for each computer/session and return when you
switch back.

UI-originated queued prompts appear above the composer:

- **Remove** deletes the selected queued prompt.
- **Edit** removes it from the queue and restores it to the composer.

Agentic Remote owns this FIFO queue. Prompts queued directly inside Copilot CLI
cannot be edited individually from the web UI.

## CLI synchronization

For tmux-backed sessions, prompts, commands, queue dispatch, cancellation, and
answers are sent to the owning terminal pane. The web UI and attached CLI
therefore control the same process.

State-changing CLI commands synchronize back to the browser:

- `/cwd` updates the working directory shown in the sidebar, header, and status
  line.
- Copilot title changes update the UI and tmux window.
- Model, effort, context, mode, and allow-all changes update runtime status.
- `/statusline` opens the web status-line configuration.

Command completion uses the session's real Copilot command list. Abbreviations
follow CLI behavior; for example, `/aa` expands to `/allow-all`.

## Tools, questions, and permissions

- The running root-agent tool is animated in chronological chat flow.
- Completed and failed tools remain as compact timeline history.
- Root-level agent launches are logged without exposing subagent internals.
- Raw tool output and hidden reasoning are not rendered.
- SDK and tmux `ask_user` prompts support choices and freeform replies.
- Ephemeral tmux permission dialogs appear with **Yes** and **Stop** actions.

The runtime row below the composer configures model, reasoning effort, numeric
context capacity, and agent mode (**Interactive**, **Plan**, or **Autopilot**).
SDK sessions switch live; tmux sessions restart the same pane and resume the
same session ID.

## File attachments

Use the paperclip to upload PDF, CSV/TSV, Excel, Word, text, Markdown, JSON,
YAML, OFX/QFX, or common image files up to 25 MiB. The file is stored with
user-private permissions on the computer that owns the selected session. Its
absolute path is appended to the draft and is never sent automatically.
You can select or drop multiple files; they are processed sequentially in
selection order.

Uploads live under `~/.agentic-remote/uploads/<session-id>/` on the owning
computer. They are removed when the session is cleared or deleted. Treat
uploaded financial documents as sensitive local data and avoid copying their
paths into unrelated sessions.

## Audio transcription

Use the microphone button to record directly in the installed app. **Cancel**
discards the browser-memory recording; **Stop & transcribe** sends it to the
same private transcription service and appends only the resulting text to the
draft. The app does not save a phone-side recording.
The text field and action toolbar use separate panels. While recording, the
bottom action toolbar becomes a compact **Cancel · timer · Stop & transcribe**
strip without covering the text field.

The paperclip also transcribes selected audio instead of storing it as an
attachment. You can drop a file onto the composer on desktop. The development hub
accepts AAC, FLAC, M4A,
MP3, MP4, OGG, WAV, and WebM files up to 25 MiB and 15 minutes. It converts the
recording with the packaged FFmpeg runtime and transcribes it with a local
multilingual whisper.cpp model. The resulting text is appended to the draft
that initiated the upload and is never sent automatically.

Only the hub receives audio. Temporary source and converted files use
user-private permissions and are deleted after every successful or failed job.
Remote computers receive only text after the user presses Send. One recording
is processed at a time to keep Copilot sessions responsive.

## Session files and Knowledge

Use the folder button in a session header to browse that session's working
directory without granting write access. Hidden files are omitted, symlinks
cannot escape the session directory, text previews are limited to 2 MiB, and
PDF previews are limited to 25 MiB. Remote-session browsing and search execute
on the owning computer through its authenticated node API.

Markdown files support rendered and raw views. PDF files render locally in the
browser with PDF.js. Search checks filenames and bounded text content while
skipping generated dependency/build directories. **Insert path** adds the
absolute path to the draft; **Ask agent about file** adds a review prompt, but
neither action sends automatically.

Save the current folder or individual useful files to
**Sessions → Knowledge**. Knowledge acts as central access to those paths across
sessions and computers: folder bookmarks reopen directly in the read-only
browser, while file bookmarks reopen the preview. Bookmarks are stored privately
on the hub and retain the computer, session, type, and relative path. File
content remains on the owning computer and is loaded only when opened.
Knowledge also lists each unique available session workspace folder
automatically, so central browsing works before any path has been saved.

The hub requires `whisper-cli` and `ggml-small.bin`. This homelab provisions
their pinned releases with
`~/homelab/development/install-agentic-transcription.sh`. Other installations
can provide compatible paths through the configuration variables below.

## Install as a phone app

Agentic Remote is an installable PWA.

On iPhone or iPad:

1. Open the HTTPS hub URL in Safari.
2. Choose **Share → Add to Home Screen**.
3. Open Agentic Remote from the Home Screen.

Mobile behavior includes:

- Swipe right anywhere in the conversation to open Sessions.
- Swipe left to close Sessions.
- Horizontal code and table scrolling is excluded from the drawer gesture.
- Browser Safari retains its native Back gesture.
- Safe-area and visual-viewport handling keep controls clear of the Dynamic
  Island and on-screen keyboard.

## Notifications

Open **Sessions → App settings** to enable push notifications.

Agentic Remote can notify the installed app when:

- An agent asks for input.
- An agent requests permission.
- An agent finishes its current work.

Use **Send test notification** to verify delivery. The bell in a session header
mutes or unmutes that session without disabling global notifications. Opening a
related chat clears its ask and completion notifications from Notification
Center.

Questions and permissions are sent at high urgency with the computer, session
title, and a concise action brief. Completion notices are low urgency and state
that no action is needed.

## App updates

The installed app checks for updates:

- On launch
- Hourly while open
- When returning to the foreground
- On demand through **App settings → Check for updates**

Update detection compares the running bundle with the uncached deployed
version, including releases where `sw.js` itself is unchanged. **Update now**
activates or reloads into the new version. The update toast can be dismissed
without discarding the update from App settings.

## Service operations

```bash
agentic-remote start
agentic-remote stop
agentic-remote restart
agentic-remote status
agentic-remote logs
agentic-remote pair-info
agentic-remote update
agentic-remote rollback
agentic-remote uninstall
```

`update` pulls the current branch with fast-forward only, installs dependencies,
builds an immutable release, and restarts the service.

### Host reboot and power-loss recovery

Agentic Remote persists session metadata under `~/.agentic-remote/state.json`
on each owning computer. The state records whether an open session is SDK- or
tmux-backed, together with its Copilot session ID, working directory, title,
permission mode, runtime configuration, transcript cache, and prompt queue.

tmux processes cannot survive a host power loss. When the systemd user service
starts after reboot, Agentic Remote:

1. Discovers any Copilot processes already running in tmux.
2. Recreates only previously open tmux-backed sessions that are missing.
3. Launches them with their original Copilot session IDs and runtime flags so
   Copilot resumes its persisted history.
4. Republishes them to the Sessions UI on the hub or paired node.

Active legacy tmux sessions are migrated into this recovery set automatically
on the first discovery after upgrading. SDK-backed sessions stay visible and
resume lazily when opened. Deleted/closed sessions are not recreated.

No NFS share is required or recommended. Session state, repositories, Copilot
authentication, and `~/.copilot/session-state/` remain on the owning computer's
persistent local disk. Ensure the host filesystem is persistent, the service is
enabled, and user lingering reports `yes`.

Releases are stored under:

```text
~/.config/agentic-remote/releases/
```

The active service never serves assets from the development `dist/` directory.
`rollback` atomically activates the previous release. The current release plus
two rollback candidates are retained.

`uninstall` removes the service but preserves application data in
`~/.agentic-remote`.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | HTTP bind address |
| `PORT` | `4318` | HTTP port for direct/manual startup |
| `COPILOT_BIN` | `/usr/local/bin/copilot` | Copilot CLI executable |
| `AGENTIC_REMOTE_DATA_DIR` | `~/.agentic-remote` | Local application state |
| `AGENTIC_REMOTE_ROLE` | `hub` | `hub` or headless `node` |
| `AGENTIC_REMOTE_NODE_NAME` | hostname | Friendly computer name |
| `AGENTIC_REMOTE_VAPID_SUBJECT` | project URL | Web Push contact URL or `mailto:` address |
| `AGENTIC_REMOTE_WHISPER_BIN` | `~/.local/bin/whisper-cli` | Absolute whisper.cpp CLI path |
| `AGENTIC_REMOTE_WHISPER_MODEL` | `<data-dir>/models/ggml-small.bin` | Multilingual GGML model path |
| `AGENTIC_REMOTE_WHISPER_THREADS` | `3` | CPU threads per transcription, from 1 through 16 |
| `AGENTIC_REMOTE_FFMPEG_BIN` | packaged binary | Optional FFmpeg override |
| `AGENTIC_REMOTE_FFPROBE_BIN` | packaged binary | Optional FFprobe override |

Managed setup defaults to port `4317` and writes its environment under
`~/.config/agentic-remote`.

## Development

Install dependencies and start Fastify plus Vite:

```bash
pnpm install
pnpm dev
```

Open <http://127.0.0.1:4317>. Vite proxies API and WebSocket traffic to Fastify
on port `4318`.

Run all project checks:

```bash
pnpm check
```

This runs linting, unit tests, type checking, and the production build.

For a direct production build without the management command:

```bash
pnpm build
pnpm start
```

The direct server listens on <http://127.0.0.1:4318> by default.

## Data and security

Important local files include:

| Path | Contents |
| --- | --- |
| `~/.agentic-remote/state.json` | Rendered session state and UI-managed queues |
| `~/.agentic-remote/computers.json` | Paired node URLs and tokens on the hub |
| `~/.agentic-remote/node.json` | Stable node identity and pairing token |
| `~/.agentic-remote/push-notifications.json` | VAPID keys and push subscriptions |

Sensitive state files use mode `0600`; the data directory uses mode `0700`.

The hub UI relies on the trusted network or an upstream authentication layer.
Remote `/node-api` REST and WebSocket routes additionally require the node's
pairing token. Do not expose a node directly to the public internet.

## Troubleshooting

### A session looks stuck

Check the UI for an `ask_user` card or permission prompt. For a tmux-backed
session, inspect the owning pane:

```bash
tmux attach
```

Also inspect service logs:

```bash
agentic-remote logs
```

### A remote computer is offline

Verify its service and health endpoint:

```bash
agentic-remote status
curl http://NODE_ADDRESS:4317/health
```

The hub retains last-known summaries while a node is offline, but commands fail
explicitly rather than being silently queued.

### The installed app is stale

Open **App settings → Check for updates**. If necessary, close and reopen the
installed app so iOS reloads its active PWA window.
