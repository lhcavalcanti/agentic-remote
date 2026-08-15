# Multi-computer architecture

## Roles

Every installation runs the same server in one of two roles:

- **Hub** owns the browser UI, a local Copilot session service, and the registry
  of paired computers.
- **Node** owns only its local Copilot session service and exposes an
  authenticated machine API. It does not serve the UI.

A hub is also a node, so local and remote sessions follow the same routing
contract.

## Ownership

Sessions never move between computers. The owning node retains:

- Copilot authentication and runtime processes
- Working directories and repository access
- Copilot session history
- Tool permissions and execution

The hub stores remote node IDs, names, URLs, and pairing tokens in
`~/.agentic-remote/computers.json` with mode `0600`. It decorates session IDs
with their computer ID in the UI but does not copy repositories.

Closing a session routes deletion to its owning node. That node disconnects any
active SDK session, deletes the session from Copilot storage, removes its local
rendered-history cache, and emits a removal event.

## Transport and authentication

The browser communicates only with the hub. The hub is a single trusted-admin
control plane, not a multi-tenant boundary. Every page, REST route, and
WebSocket upgrade must remain behind TLS and a deny-by-default upstream access
layer such as Cloudflare Access. Node REST and WebSocket routes retain a
separate random pairing token and must not be publicly reachable.

Pairing credentials are generated locally and displayed only by explicit
management commands. Use Cloudflare Access, an encrypted overlay, or TLS before
exposing the hub outside the trusted network.

## Routing

The hub exposes computer-aware routes under:

```text
/api/computers/:computerId/sessions/:sessionId
```

Local requests call the in-process session service. Remote requests are sent to
the paired node's `/node-api` routes. The node streams its native session events
over WebSocket; the hub adds computer identity and forwards them to browsers.

## Failure behavior

- A failed node request marks that computer offline.
- WebSocket connections retry with backoff.
- Last-known remote session summaries remain visible while a node is offline.
- Commands against an offline node fail explicitly; they are not queued.
- The systemd user service restarts after failure and starts at boot when user
  lingering is enabled.
- Each node persists open-session backend ownership in
  `~/.agentic-remote/state.json`.
- A service restart reuses existing tmux processes. A full host reboot
  recreates missing previously open tmux windows with the same Copilot session
  IDs, allowing Copilot to resume from its local session database.
- Repositories, credentials, and Copilot session databases remain on the
  owning computer's persistent local filesystem; recovery does not use NFS.

## Pairing flow

1. Install the second computer with `--role node`.
2. Run `agentic-remote pair-info` on that computer.
3. Open **Computers** on the hub and enter the node URL and pairing token.
4. The hub authenticates to `/node-api/info`, records the stable node ID, opens
   the event stream, and aggregates its sessions.

Removing a computer from the hub deletes only its registry entry. It does not
delete sessions or configuration on that node.
