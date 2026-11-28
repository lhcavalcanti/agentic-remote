#!/usr/bin/env python3
"""Maintain a local, tracked-source Graphify snapshot without model/API calls."""

from __future__ import annotations

import argparse
import base64
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
import tempfile
import venv

ROOT = Path(__file__).resolve().parent.parent
OUTPUTS = ("graph.json", "graph.html", "GRAPH_REPORT.md", "communities.json")
# The viewer draws every node up to this many; past it, only communities.
VIZ_NODE_LIMIT = 15_000
GENERATOR_INPUTS = (
    "manage.py", "scope.json", "requirements.in", "requirements.lock",
    "vendor/vis-network.min.js",
)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def json_bytes(value: object) -> bytes:
    return (json.dumps(value, sort_keys=True, indent=2, ensure_ascii=False) + "\n").encode()


def git(root: Path, *args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=root, text=True)


def scope_for(root: Path) -> dict:
    scope = json.loads((root / "graphify/scope.json").read_text())
    if scope.get("tracked_files_only") is not True:
        raise ValueError("Graphify must remain restricted to tracked files.")
    for field in ("excluded_directories", "excluded_names", "excluded_suffixes"):
        if not isinstance(scope.get(field), list) or not all(
            isinstance(value, str) for value in scope[field]
        ):
            raise ValueError(f"Invalid Graphify scope field: {field}")
    return scope


def source_inventory(root: Path, scope: dict) -> dict[str, str]:
    """Hash working-tree contents, not HEAD, without reading untracked files."""
    result = {}
    for name in sorted(filter(None, git(root, "ls-files", "-z").split("\0"))):
        relative = Path(name)
        if (
            set(relative.parts[:-1]) & set(scope["excluded_directories"])
            or relative.name in scope["excluded_names"]
            or relative.name.startswith(".env.")
            or relative.suffix.lower() in scope["excluded_suffixes"]
        ):
            continue
        path = root / relative
        try:
            mode = path.lstat().st_mode
        except FileNotFoundError:
            continue  # Tracked deletions must disappear from the next snapshot.
        if stat.S_ISLNK(mode) or not stat.S_ISREG(mode):
            raise ValueError(f"Refusing non-regular tracked input: {name}")
        if not path.resolve().is_relative_to(root.resolve()):
            raise ValueError(f"Refusing tracked input outside the repository: {name}")
        result[name] = digest(path.read_bytes())
    return result


def snapshot(root: Path) -> dict:
    scope = scope_for(root)
    inputs = source_inventory(root, scope)
    generator = {
        name: digest((root / "graphify" / name).read_bytes())
        for name in GENERATOR_INPUTS
    }
    return {
        "inputs": inputs,
        "source_fingerprint": digest(json_bytes(inputs)),
        "generator_fingerprint": digest(json_bytes(generator)),
    }


def read_metadata(root: Path) -> dict | None:
    path = root / "graphify/metadata.json"
    if not path.exists():
        return None
    value = json.loads(path.read_text())
    required = {
        "inputs": dict, "outputs": dict, "source_commit": str,
        "working_tree_changes": list, "source_fingerprint": str,
        "generator_fingerprint": str, "nodes": int, "edges": int, "code_files": list,
    }
    if not isinstance(value, dict) or any(
        not isinstance(value.get(key), kind) for key, kind in required.items()
    ):
        raise ValueError("Invalid Graphify metadata. Restore it from Git before updating.")
    return value


def artifacts_match(root: Path, metadata: dict) -> bool:
    return all(
        (root / "graphify" / name).is_file()
        and digest((root / "graphify" / name).read_bytes()) == metadata.get("outputs", {}).get(name)
        for name in OUTPUTS
    )


def check_snapshot(root: Path) -> dict:
    metadata = read_metadata(root)
    if metadata is None:
        raise ValueError("Graph is missing. Run: python3 graphify/manage.py setup, then update.")
    current = snapshot(root)
    if any(metadata.get(key) != current[key] for key in current):
        changed = sorted(
            name for name in metadata.get("inputs", {}).keys() | current["inputs"].keys()
            if metadata.get("inputs", {}).get(name) != current["inputs"].get(name)
        )
        detail = ", ".join(changed[:8]) or "generator, scope, or tool lock changed"
        raise ValueError(
            f"Graph is stale ({detail}). Run: python3 graphify/manage.py update"
        )
    for name in OUTPUTS:
        path = root / "graphify" / name
        if not path.is_file() or digest(path.read_bytes()) != metadata.get("outputs", {}).get(name):
            raise ValueError(f"Graph artifact is missing or modified: {name}. Run update.")
    return metadata


def environment() -> dict[str, str]:
    env = {
        key: value for key, value in os.environ.items()
        if not key.startswith("GRAPHIFY_") and key not in ("PYTHONPATH", "PYTHONHOME")
    }
    env.update({
        "GRAPHIFY_OUT": "graphify",
        "GRAPHIFY_QUERY_LOG_DISABLE": "1",
        "GRAPHIFY_NO_BACKUP": "1",
        "GRAPHIFY_VIZ_NODE_LIMIT": str(VIZ_NODE_LIMIT),
        "PYTHONNOUSERSITE": "1",
        "PYTHONHASHSEED": "0",
    })
    return env


def require_tool_environment() -> None:
    prefix = ROOT / "graphify/.venv"
    python = prefix / "bin/python"
    if not python.is_file():
        raise ValueError("Graphify is not installed. Run: python3 graphify/manage.py setup")
    expected = environment()
    controlled = ("GRAPHIFY_OUT", "GRAPHIFY_QUERY_LOG_DISABLE", "GRAPHIFY_NO_BACKUP",
                  "GRAPHIFY_VIZ_NODE_LIMIT", "PYTHONNOUSERSITE", "PYTHONHASHSEED")
    if (
        Path(sys.prefix).resolve() != prefix.resolve()
        or any(os.environ.get(key) != expected[key] for key in controlled)
        or "PYTHONPATH" in os.environ or "PYTHONHOME" in os.environ
    ):
        os.execve(str(python), [str(python), str(Path(__file__).resolve()), *sys.argv[1:]], environment())
    for requirement in (ROOT / "graphify/requirements.lock").read_text().splitlines():
        if not requirement.strip() or requirement.startswith("#"):
            continue
        name, version = requirement.split("==", 1)
        try:
            installed = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError as error:
            raise ValueError(f"Missing {name}. Run Graphify setup again.") from error
        if installed != version:
            raise ValueError(f"Tool version mismatch for {name}. Run Graphify setup again.")
    for optional in ("graspologic", "graspologic-native"):
        try:
            importlib.metadata.distribution(optional)
        except importlib.metadata.PackageNotFoundError:
            continue
        raise ValueError(f"Remove optional {optional} from .venv; the locked graph uses Louvain.")


def setup() -> None:
    minimum = tuple(map(int, scope_for(ROOT)["python_minimum"].split(".")))
    if sys.version_info[:2] < minimum:
        raise ValueError("Graphify's locked dependencies require Python 3.12 or later.")
    prefix = ROOT / "graphify/.venv"
    venv.EnvBuilder(with_pip=True).create(prefix)
    subprocess.run([
        str(prefix / "bin/python"), "-m", "pip", "install", "--disable-pip-version-check",
        "-r", str(ROOT / "graphify/requirements.lock"),
    ], cwd=ROOT, env=environment(), check=True)
    print("Graphify installed locally. Next: python3 graphify/manage.py update")


def block_network() -> list[str]:
    attempts: list[str] = []

    def audit(event: str, _args: tuple) -> None:
        if event in ("socket.connect", "socket.bind", "socket.getaddrinfo"):
            attempts.append(event)
            raise PermissionError("Graphify network access is disabled for generation and queries.")

    sys.addaudithook(audit)
    return attempts


def validate_graph(data: dict) -> None:
    nodes = data.get("nodes", [])
    links = data.get("links", [])
    ids = [node["id"] for node in nodes]
    if not nodes or len(ids) != len(set(ids)) or data.get("directed") is not True:
        raise ValueError("Graph must be nonempty, directed, and have unique node IDs.")
    known = set(ids)
    for edge in links:
        if edge["source"] not in known or edge["target"] not in known:
            raise ValueError("Graph contains an edge with a missing endpoint.")
        if edge.get("confidence") not in ("EXTRACTED", "INFERRED", "AMBIGUOUS"):
            raise ValueError("Graph contains an edge without a supported confidence label.")
    for node in nodes:
        source = node.get("source_file", "")
        if Path(source).is_absolute() or ".." in Path(source).parts:
            raise ValueError("Graph contains a non-portable source path.")


def partition_extraction_results(
    root: Path,
    code: list[Path],
    represented: set[str],
    data_json: set[str],
) -> tuple[list[Path], list[str], list[str]]:
    names = {path: path.relative_to(root).as_posix() for path in code}
    inventory = sorted(name for name in names.values() if name in data_json)
    parsed = [path for path, name in names.items() if name in represented]
    missing = sorted(
        name for name in names.values()
        if name not in represented and name not in data_json
    )
    return parsed, inventory, missing


def offline_html(path: Path, scope: dict, fingerprint: str) -> None:
    asset = scope["javascript_asset"]
    vendor = (ROOT / "graphify" / asset["file"]).read_bytes()
    integrity = "sha384-" + base64.b64encode(hashlib.sha384(vendor).digest()).decode()
    if integrity != asset["integrity"]:
        raise ValueError("The vendored visualization library failed its integrity check.")
    html = path.read_text()
    pattern = r'<script\s+src="' + re.escape(asset["source"]) + r'"[^>]*>\s*</script>'
    script = vendor.decode().replace("</script", r"<\/script")
    html, count = re.subn(pattern, lambda _: f"<script>\n{script}\n</script>", html)
    if count != 1:
        raise ValueError("Graphify's HTML template changed; review the offline viewer integration.")
    html = re.sub(r"<title>[^<]*</title>", "<title>Agentic Remote | Graphify</title>", html, count=1)
    policy = (
        "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; "
        "img-src data:; font-src data:; connect-src 'none'; object-src 'none'; "
        "base-uri 'none'; form-action 'none'"
    )
    html = html.replace("<head>", (
        '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<meta name="referrer" content="no-referrer">\n'
        f'<meta http-equiv="Content-Security-Policy" content="{policy}">'
    ), 1)
    network = "const network = new vis.Network(container, { nodes: nodesDS, edges: edgesDS }, {"
    if html.count(network) != 1:
        raise ValueError("Graphify's network initialization changed; review layout seeding.")
    html = html.replace(network, network + "\n  layout: { randomSeed: 42 },", 1)
    html = html.replace(
        '<div id="stats">', f'<div id="stats">Snapshot {fingerprint[:12]} &middot; ', 1,
    )
    path.write_text(html)


def update(force: bool) -> None:
    require_tool_environment()
    attempts = block_network()
    from graphify.analyze import god_nodes, suggest_questions, surprising_connections
    from graphify.build import build_from_json
    from graphify.cluster import cluster, label_communities_by_hub, score_all
    from graphify.detect import FileType, classify_file
    from graphify.export import to_html, to_json
    from graphify.extract import extract, extract_json
    from graphify.report import generate
    import fcntl

    area = ROOT / "graphify"
    cache = area / ".cache"
    cache.mkdir(exist_ok=True)
    with (cache / "update.lock").open("w") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as error:
            raise ValueError("Another Graphify update is running in this worktree.") from error
        before = snapshot(ROOT)
        previous = read_metadata(ROOT)
        same = previous is not None and all(previous.get(key) == before[key] for key in before)
        if same and not force and artifacts_match(ROOT, previous):
            check_snapshot(ROOT)
            print(f"Graph is current: {previous['nodes']} nodes, {previous['edges']} edges.")
            return
        scope = scope_for(ROOT)
        code = []
        not_parsed = []
        for name in before["inputs"]:
            kind = classify_file(ROOT / name)
            if kind == FileType.CODE:
                code.append(ROOT / name)
            else:
                not_parsed.append(name)
        if not code:
            raise ValueError("No tracked code files found; previous graph left unchanged.")
        extraction = extract(code, root=ROOT, cache_root=ROOT, parallel=False)
        if extraction.get("failed_sources"):
            raise ValueError(f"AST extraction failed: {extraction['failed_sources']}")
        graph = build_from_json(extraction, root=ROOT, directed=True)
        represented = {data.get("source_file") for _, data in graph.nodes(data=True)}
        unrepresented = {
            path.relative_to(ROOT).as_posix() for path in code
        } - represented
        data_json = {
            name for name in unrepresented
            if Path(name).suffix.lower() == ".json"
            and str(extract_json(ROOT / name).get("skipped", "")).startswith("data json")
        }
        code, json_inventory, missing = partition_extraction_results(
            ROOT, code, represented, data_json,
        )
        code_names = {path.relative_to(ROOT).as_posix() for path in code}
        not_parsed.extend(json_inventory)
        if missing:
            raise ValueError(f"Tracked code files missing from the graph: {', '.join(missing)}")
        communities = cluster(graph)
        labels = label_communities_by_hub(graph, communities)
        questions = suggest_questions(graph, communities, labels)
        commit = previous["source_commit"] if same else git(ROOT, "rev-parse", "HEAD").strip()
        changes = previous["working_tree_changes"] if same else sorted(
            set(filter(None, git(ROOT, "diff", "--name-only", "HEAD", "-z").split("\0")))
            & before["inputs"].keys()
        )
        with tempfile.TemporaryDirectory(prefix="build-", dir=cache) as temporary:
            stage = Path(temporary)
            if not to_json(graph, communities, str(stage / "graph.json"),
                           community_labels=labels, built_at_commit=commit):
                raise ValueError("Graphify refused to export the graph.")
            data = json.loads((stage / "graph.json").read_text())
            data["nodes"].sort(key=lambda node: str(node["id"]))
            data["links"].sort(key=lambda edge: (
                str(edge["source"]), str(edge["target"]), edge.get("relation", ""),
            ))
            validate_graph(data)
            (stage / "graph.json").write_bytes(json_bytes(data))
            if not to_html(graph, communities, str(stage / "graph.html"),
                           community_labels=labels, node_limit=VIZ_NODE_LIMIT):
                raise ValueError("Graphify did not generate a visualization.")
            offline_html(stage / "graph.html", scope, before["source_fingerprint"])
            report = generate(
                graph, communities, score_all(graph, communities), labels,
                god_nodes(graph), surprising_connections(graph, communities),
                {"total_files": len(code), "total_words": sum(
                    len(path.read_text().split()) for path in code
                )},
                {"input": 0, "output": 0}, "agentic-remote",
                suggested_questions=questions,
            )
            header = (
                "# Agentic Remote - Graphify code map\n\n"
                f"Snapshot: `{before['source_fingerprint']}`\n\n"
                f"Source checkout: `{commit}`; working-tree contents are hashed in "
                "`metadata.json`. Check freshness by content, not by comparing HEAD.\n\n"
                "Run `python3 graphify/manage.py check` before querying and "
                "`python3 graphify/manage.py update` after source changes.\n\n"
                f"All {len(code)} tracked code files in scope have source nodes. "
                "Parsing, resolution, community labels, and queries are local; "
                "no model or external API is used. Imports can point to external "
                "package identifiers rather than local files.\n\n"
                "Documentation, styles, images, and other non-code files are "
                "inventoried but **not semantically extracted**. Runtime routing "
                "and dynamic behavior must still be confirmed in source.\n\n"
            )
            report = header + report.split("\n", 1)[1]
            report += "\n## Non-code inventory (not semantically extracted)\n\n"
            report += "\n".join(f"- `{name}`" for name in not_parsed) + "\n"
            (stage / "GRAPH_REPORT.md").write_text(report)
            (stage / "communities.json").write_bytes(json_bytes({
                str(cid): {"label": labels[cid], "nodes": sorted(members)}
                for cid, members in communities.items()
            }))
            if snapshot(ROOT) != before:
                raise ValueError("Sources or generator changed during extraction; rerun update.")
            if attempts:
                raise ValueError("Graphify attempted network access; outputs were not published.")
            metadata = {
                "schema_version": 1,
                **before,
                "source_commit": commit,
                "working_tree_changes": changes,
                "graphify_version": scope["graphify_version"],
                "mode": "local-ast-only",
                "community_algorithm": "louvain-seed-42",
                "code_files": sorted(code_names),
                "not_semantically_extracted": not_parsed,
                "nodes": graph.number_of_nodes(),
                "edges": graph.number_of_edges(),
                "communities": len(communities),
                "outputs": {name: digest((stage / name).read_bytes()) for name in OUTPUTS},
            }
            (stage / "metadata.json").write_bytes(json_bytes(metadata))
            # Metadata is the completion marker: interrupted publication fails
            # the content checks rather than treating mixed outputs as current.
            for name in (*OUTPUTS, "metadata.json"):
                os.replace(stage / name, area / name)
        print(f"Graphified {len(code)} code files: {metadata['nodes']} nodes, "
              f"{metadata['edges']} edges, {metadata['communities']} communities.")
        print("Open graphify/graph.html locally. Non-code inventory is listed in the report.")


def query(args: argparse.Namespace) -> None:
    require_tool_environment()
    check_snapshot(ROOT)
    attempts = block_network()
    from graphify.__main__ import main as graphify_main
    command = [args.command, *args.terms, "--graph", str(ROOT / "graphify/graph.json")]
    if args.command == "query":
        command += ["--budget", str(args.budget)]
    sys.argv = ["graphify", *command]
    graphify_main()
    if attempts:
        raise ValueError("Graphify attempted network access during a local query.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("setup", help="Install the locked tool locally; downloads packages only.")
    commands.add_parser("check", help="Check content freshness without Graphify or network access.")
    refresh = commands.add_parser("update", help="Rebuild tracked-source graph artifacts locally.")
    refresh.add_argument("--force", action="store_true", help="Regenerate even when inputs match.")
    for name in ("query", "explain", "path", "affected"):
        command = commands.add_parser(name, help=f"Run a local Graphify {name} on the current graph.")
        command.add_argument("terms", nargs=2 if name == "path" else 1)
        if name == "query":
            command.add_argument("--budget", type=int, default=1500)
    args = parser.parse_args()
    if args.command == "query" and args.budget <= 0:
        parser.error("--budget must be a positive integer")
    os.chdir(ROOT)
    if args.command == "setup":
        setup()
    elif args.command == "check":
        metadata = check_snapshot(ROOT)
        print(f"Graph is current: {metadata['nodes']} nodes, {metadata['edges']} edges, "
              f"{len(metadata['code_files'])} code files.")
    elif args.command == "update":
        update(args.force)
    else:
        query(args)


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(f"Graphify: {error}", file=sys.stderr)
        sys.exit(1)
