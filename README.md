# Agentic Remote

A focused, mobile-first web interface for local GitHub Copilot CLI sessions.
Agentic Remote keeps the first version intentionally small: choose a folder,
discover existing sessions, start or resume a session in any folder, read the
conversation, send messages, stop a turn, and answer permission prompts.

## Why this architecture

- **React + Vite** produces a small production bundle and fast responsive UI.
- **Fastify** serves the API, WebSocket event stream, and production assets from
  one local Node.js process.
- **`@github/copilot-sdk`** is GitHub's supported Node SDK. It provides
  structured session events, so the UI does not scrape terminal escape codes.
- Session metadata and rendered messages are stored in
  `~/.agentic-remote/state.json` with user-only permissions.

The server binds to `127.0.0.1` by default. Remote access and authentication are
deliberately outside the initial scope.

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

The repository includes a systemd user-service template. Install it with:

```bash
mkdir -p ~/.config/systemd/user ~/.config/agentic-remote
cp deploy/agentic-remote.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now agentic-remote
```

To change the bind address or port, create
`~/.config/agentic-remote/environment`:

```text
HOST=10.0.0.181
PORT=4317
```

The service restarts after failures and starts with the user's systemd session.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | HTTP bind address |
| `PORT` | `4318` | HTTP port |
| `COPILOT_BIN` | `/usr/local/bin/copilot` | Copilot CLI executable |
| `AGENTIC_REMOTE_DATA_DIR` | `~/.agentic-remote` | Local application state |

## Checks

```bash
pnpm check
```

This runs linting, unit tests, type checking, and the production build.
