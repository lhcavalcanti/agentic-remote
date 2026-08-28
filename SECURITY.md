# Security policy

## Reporting a vulnerability

Report vulnerabilities privately through this repository's GitHub Security
Advisories. Do not open a public issue containing exploit details, credentials,
tokens, private URLs, or session data.

## Deployment boundary

Agentic Remote is a trusted-administrator control plane. Anyone who can access
the hub can control agent sessions and, through those agents, may read or change
files and run commands on connected computers.

- The hub does not provide built-in user authentication.
- Put the entire hub, including WebSocket routes, behind an authenticated
  reverse proxy or private encrypted network.
- Never expose paired nodes directly to the public internet.
- Treat pairing tokens as administrator credentials.
- Use a dedicated operating-system account with only the filesystem and tool
  access the agents require.
- Review allow-all permission settings before admitting additional users.

Host/Origin validation reduces browser rebinding risk but is not an
authentication or authorization boundary.
