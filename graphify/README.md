# Agentic Remote code graph

This folder is a maintained [Graphify](https://github.com/Graphify-Labs/graphify)
snapshot of the repository. It is a navigation aid, not a replacement for
`docs/app-spec.md` or the implementation.

| File | Purpose |
| --- | --- |
| `graph.html` | Self-contained, offline interactive graph: search, inspect neighbors, filter communities |
| `graph.json` | Full directed graph, with source locations and confidence labels |
| `GRAPH_REPORT.md` | Graphify's communities, central symbols, cross-file connections, and suggested questions |
| `communities.json` | Stable community membership and local, deterministic labels |
| `metadata.json` | Input hashes, tool/generator fingerprint, provenance, coverage, and artifact hashes |
| `scope.json` | Version pin and input exclusions |
| `manage.py` | Safe setup, refresh, freshness, and query commands |
| `requirements.lock` | Exact tool and parser versions; separate from application dependencies |

Open `graph.html` directly in a browser. GitHub displays HTML source rather
than running it, so download the file or open it from a local checkout.
Everything needed by the viewer is embedded; it does not load a CDN or contact
an API.

## First use

The generated files can be read without installing anything. CLI queries and
regeneration require Git and Python **3.12+** on Linux/macOS.

```bash
python3 graphify/manage.py setup
python3 graphify/manage.py check
python3 graphify/manage.py query "KnowledgeRoot KnowledgeReader"
python3 graphify/manage.py explain "KnowledgeStore"
python3 graphify/manage.py path "App.tsx" "KnowledgeReader"
```

Setup downloads the locked public Python packages into `graphify/.venv`.
It does not change the system Python, install global skills/hooks, or read
provider credentials. The official package name is `graphifyy` (two `y`s).

`check` uses only the Python standard library, so it also works before setup.
Queries require a current snapshot and stop with an update instruction if the
inputs, generator, or generated artifacts have changed.
The query budget is a target, not a hard ceiling: Graphify may retain a complete
edge set above it and reports that overrun. Prefer focused symbol questions.

## Maintain the graph

After changing tracked code, documentation, manifests, or repository settings:

```bash
# Stage any intended NEW source files first; untracked files are never indexed.
git add path/to/new-source.ts
python3 graphify/manage.py update
python3 graphify/manage.py check
git add graphify/graph.json graphify/graph.html graphify/GRAPH_REPORT.md \
  graphify/communities.json graphify/metadata.json
```

Ordinary update is a no-op when inputs and artifacts already match. To
recompute the same snapshot, use `update --force`. The graph uses Graphify's
AST extractor, directed graph builder, Louvain clustering with seed 42,
deterministic structural labels, report generator, and HTML exporter.

Freshness is based on file contents, **not HEAD equality**. Committing the
generated graph changes HEAD without changing what was indexed. The metadata
records the checkout commit and any tracked working-tree differences at
generation, then verifies every input and output hash on subsequent checks.
It also detects deletions, scope changes, and corrupt or missing artifacts.

An update stages all outputs before publication and rejects empty, incomplete,
or dangling-edge graphs. It rechecks inputs before publishing and uses a
worktree-local lock. `metadata.json` is written last; an interrupted publication
fails freshness checks instead of being mistaken for a current snapshot.
Git retains the preceding committed snapshot.

## Scope and privacy

- Only Git-tracked, regular, in-repository files are considered. Symlinks,
  non-regular files, and escaping paths fail closed rather than reading a
  different location.
- Graphify parses supported **code** locally, including TypeScript/TSX,
  JavaScript, Rust, shell scripts, JSON, and supported package manifests.
  Tests are included because they document and exercise behavior.
- Documentation, styles, images, and unsupported files are inventoried and
  hashed, but **not semantically extracted**. No claim is made that the graph
  understands prose requirements, dynamic HTTP routing, or runtime state.
- Dependency locks, generated/build/cache directories, `.env*`, keys, logs,
  this folder, and untracked files are excluded. No provider/session state,
  user Knowledge roots, live machine profile, or external repository is read.
- Generation and queries use no LLM backend. Python network connections,
  DNS lookups, and binds are denied during those operations; query logging
  is disabled. Setup is the only package-download step.
- The HTML embeds the integrity-checked `vis-network` asset and graph data.
  Its content security policy disallows network connections and external
  scripts. Do not publish this private repository graph to a hosted service.

`EXTRACTED` means the relationship was present in syntax; `INFERRED` means
Graphify resolved it. Neither guarantees runtime reachability. Some import
references use package identifiers such as `mermaid` instead of local paths.
Use the returned source locations to inspect the actual implementation before
editing or drawing conclusions.
Type-only imports can form structural cycles without creating runtime import
cycles; do not treat a graph cycle alone as a bug.

## Maintenance validation

The existing Vitest runner covers artifact integrity and the standard-library
maintenance helpers:

```bash
pnpm vitest run graphify/manage.test.ts
```

The Python-specific cases explicitly skip when Python 3.12+ is unavailable;
the application itself does not require Graphify to be installed. Source
freshness is intentionally checked by the maintenance command, not made a new
application deployment gate.

With the repository's existing Playwright dependency and Chromium runtime
libraries installed, exercise search and community controls with networking
disabled:

```bash
node graphify/viewer-smoke.mjs
```

Its local screenshot is written to ignored `graphify/.cache/viewer.png`.

## Tool updates

Graphify is pinned to `0.9.54`; the upstream source reviewed for integration is
recorded in `scope.json`. The standalone viewer is pinned to `vis-network`
`9.1.6` and verified against the integrity string used by Graphify.

Upgrade deliberately: review upstream changes, update `requirements.in` and
the complete lock, update `scope.json` and the viewer if required, then rebuild
and exercise query/path/explain plus offline browsing. Do not install optional
LLM or alternate-clustering extras into the locked environment.

Do not use native `graphify update`, `graphify install`, or `graphify hook
install` for this maintained snapshot: the repository wrapper owns tracked-only
scope, offline policy, freshness checks, and publication. No scheduled job is
installed. Future agents follow the repository's navigation skill.

See [third-party notices](THIRD_PARTY_NOTICES.md) for tool/template and viewer
licensing.
