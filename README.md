# Agentic Remote

A focused, mobile-first hub for GitHub Copilot CLI sessions across multiple
computers. Each computer owns its Copilot process, files, and history; one hub
serves the UI and routes commands to paired nodes.

The sidebar contains only currently open sessions. Use **New session → Open
previous** to browse persisted history by computer and resume a closed session.
New sessions start at `~`; browse folders by tapping them instead of typing
paths. Browsing is restricted to the selected computer's user home directory.
Computer groups and sessions can be reordered by dragging their handles; order
is retained in the browser. Open transcripts synchronize from Copilot's event
logs so terminal- and UI-originated messages stay consistent.

Composer controls follow Copilot CLI conventions:

- **Enter** sends
- **Shift+Enter** inserts a newline
- **Ctrl/Cmd+Enter** queues behind the active turn
- Typing `/` opens autocomplete populated from the session's real Copilot
  command list

On phones, the composer grows to a compact maximum height and shrinks further
when the virtual keyboard reduces the viewport.

For Copilot sessions running in tmux, Agentic Remote routes prompts, queued
input, slash commands, and cancel actions into the owning terminal pane. This
keeps the CLI and web timeline on the same agent instead of creating a detached
SDK turn. `/statusline` configures the web status line. Command abbreviations
follow Copilot CLI completion behavior: typing `/aa` expands to `/allow-all`
before the canonical command is sent to Copilot.

## Why this architecture

- **React + Vite** produces a small production bundle and fast responsive UI.
- **Fastify** serves the API, WebSocket event stream, and production assets from
  one local Node.js process.
- **`@github/copilot-sdk`** is GitHub's supported Node SDK. It provides
  structured session events, so the UI does not scrape terminal escape codes.
- **Hub/node roles** keep execution on the computer that owns each session. The
  hub stores paired node addresses and tokens, but never copies repositories.
- Session metadata and rendered messages are stored in
  `~/.agentic-remote/state.json` with user-only permissions.

The server binds to `127.0.0.1` by default. Direct access is intended for a
trusted LAN; use an upstream layer such as Cloudflare Access externally.

See [Multi-computer architecture](docs/architecture.md) for ownership,
authentication, routing, and failure semantics.

## Requirements

- Node.js 22 or newer
- pnpm
- An authenticated GitHub Copilot CLI installation

Check authentication with:

```bash
copilot
```

## Development

```bash
pnpm install
pnpm dev
```

Open <http://127.0.0.1:4317>. Vite proxies API and WebSocket traffic to the
Fastify server on port `4318`.

## Production

```bash
pnpm build
pnpm start
```

Open <http://127.0.0.1:4318>.

## User service

Run the management command directly from a fresh clone. On the computer that
will serve the UI:

```bash
./bin/agentic-remote setup --role hub --name development
```

For LAN access:

```bash
./bin/agentic-remote setup \
  --role hub \
  --name development \
  --host 10.0.0.181 \
  --port 4317
```

On another computer:

```bash
./bin/agentic-remote setup \
  --role node \
  --name homelab-prod \
  --host 10.0.0.233 \
  --port 4317

agentic-remote pair-info
```

Setup installs dependencies, creates the production build, installs an enabled
systemd user service, attempts to enable boot-time user lingering, and links the
command to `~/.local/bin/agentic-remote`.

Production UI assets are copied into immutable release directories under
`~/.config/agentic-remote/releases`. The running service never serves directly
from the development `dist/` directory, so local builds cannot invalidate its
hashed JavaScript or CSS assets. Backend source and dependencies are pinned in
the same release. `agentic-remote rollback` atomically activates the previous
release and restarts the service.

Use the URL and token from `pair-info` in the hub's **Computers** dialog. Pairing
tokens grant control of Copilot sessions on that node and are stored with mode
`0600`. The current transport is intended for a trusted LAN; use an encrypted
network layer before exposing a node outside it.

After setup:

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

The service restarts after failures. With systemd user lingering enabled, it
also starts during boot without waiting for an interactive login. `uninstall`
removes the service but preserves conversation data in `~/.agentic-remote`.
`update` also migrates older service environments and backfills missing role
settings.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | HTTP bind address |
| `PORT` | `4318` | HTTP port |
| `COPILOT_BIN` | `/usr/local/bin/copilot` | Copilot CLI executable |
| `AGENTIC_REMOTE_DATA_DIR` | `~/.agentic-remote` | Local application state |
| `AGENTIC_REMOTE_ROLE` | `hub` | Run the UI hub or a headless node |
| `AGENTIC_REMOTE_NODE_NAME` | hostname | Friendly computer name |

## Checks

```bash
pnpm check
```

This runs linting, unit tests, type checking, and the production build.
