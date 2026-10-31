import { createHash } from 'node:crypto'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const area = dirname(fileURLToPath(import.meta.url))
const script = join(area, 'manage.py')
const scope = JSON.parse(readFileSync(join(area, 'scope.json'), 'utf8'))
const artifacts = ['graph.json', 'graph.html', 'GRAPH_REPORT.md', 'communities.json']
const temporary: string[] = []
const python = spawnSync('python3', ['-c', 'import sys; sys.exit(sys.version_info < (3, 12))'])
const pythonAvailable = python.status === 0

function hash(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

function temp(): string {
  const path = mkdtempSync(join(tmpdir(), 'agentic-graphify-'))
  temporary.push(path)
  return path
}

function git(root: string, ...args: string[]) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr)
}

function pythonCall(root: string, expression: string) {
  return spawnSync('python3', ['-c', `
import importlib.util, json, sys
from pathlib import Path
spec = importlib.util.spec_from_file_location("maintenance", sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
root = Path(sys.argv[2])
${expression}
`, script, root], { encoding: 'utf8' })
}

function fixture(): string {
  const root = temp()
  mkdirSync(join(root, 'src'))
  mkdirSync(join(root, 'graphify/vendor'), { recursive: true })
  writeFileSync(join(root, 'src/example.ts'), 'export const value = 1\n')
  writeFileSync(join(root, 'graphify/scope.json'), JSON.stringify(scope))
  copyFileSync(script, join(root, 'graphify/manage.py'))
  for (const name of ['requirements.in', 'requirements.lock', 'vendor/vis-network.min.js']) {
    writeFileSync(join(root, 'graphify', name), 'fixture')
  }
  git(root, 'init', '--quiet')
  git(root, 'add', 'src/example.ts')
  return root
}

function stamp(root: string) {
  const result = pythonCall(root, 'print(json.dumps(module.snapshot(root)))')
  if (result.status !== 0) throw new Error(result.stderr)
  const outputs: Record<string, string> = {}
  for (const name of artifacts) {
    writeFileSync(join(root, 'graphify', name), 'fixture artifact')
    outputs[name] = hash('fixture artifact')
  }
  writeFileSync(join(root, 'graphify/metadata.json'), JSON.stringify({
    ...JSON.parse(result.stdout),
    schema_version: 1,
    source_commit: 'fixture',
    working_tree_changes: [],
    nodes: 2,
    edges: 1,
    code_files: ['src/example.ts'],
    outputs,
  }))
}

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true })
})

describe('maintained graph artifacts', () => {
  it('ships a directed graph with valid endpoints, confidence, and portable sources', () => {
    const data = JSON.parse(readFileSync(join(area, 'graph.json'), 'utf8'))
    const ids = new Set(data.nodes.map((node: { id: string }) => node.id))
    expect(data.directed).toBe(true)
    expect(ids.size).toBe(data.nodes.length)
    expect(ids.size).toBeGreaterThan(0)
    for (const edge of data.links) {
      expect(ids.has(edge.source)).toBe(true)
      expect(ids.has(edge.target)).toBe(true)
      expect(['EXTRACTED', 'INFERRED', 'AMBIGUOUS']).toContain(edge.confidence)
    }
    for (const node of data.nodes) {
      expect(node.source_file || '').not.toMatch(/^(\/|[A-Za-z]:\\)|(^|\/)\.\.(\/|$)/)
    }
  })

  it('binds every generated output to its recorded hash', () => {
    const metadata = JSON.parse(readFileSync(join(area, 'metadata.json'), 'utf8'))
    for (const name of artifacts) {
      expect(hash(readFileSync(join(area, name)))).toBe(metadata.outputs[name])
    }
    expect(metadata.mode).toBe('local-ast-only')
    expect(metadata.graphify_version).toBe(scope.graphify_version)
  })

  it('lists only graph-represented files as semantically extracted', () => {
    const metadata = JSON.parse(readFileSync(join(area, 'metadata.json'), 'utf8'))
    const graph = JSON.parse(readFileSync(join(area, 'graph.json'), 'utf8'))
    const represented = new Set(graph.nodes.map((node: { source_file?: string }) => node.source_file))
    for (const file of metadata.code_files) expect(represented.has(file)).toBe(true)
  })

  it('configures the offline viewer for the maintained graph size', () => {
    const metadata = JSON.parse(readFileSync(join(area, 'metadata.json'), 'utf8'))
    const result = pythonCall(area, `
print(module.environment().get("GRAPHIFY_VIZ_NODE_LIMIT", ""))
`)
    expect(result.status, result.stderr).toBe(0)
    expect(Number(result.stdout.trim())).toBeGreaterThan(metadata.nodes)
  })

  it('ships an integrity-checked, self-contained viewer with connections disabled', () => {
    const html = readFileSync(join(area, 'graph.html'), 'utf8')
    const integrity = 'sha384-' + createHash('sha384')
      .update(readFileSync(join(area, scope.javascript_asset.file))).digest('base64')
    expect(integrity).toBe(scope.javascript_asset.integrity)
    expect(html).not.toMatch(/<script\b[^>]*\bsrc=/i)
    expect(html).toContain("connect-src 'none'")
    expect(html).toContain("default-src 'none'")
    expect(html).toContain('randomSeed: 42')
  })
})

describe.skipIf(!pythonAvailable)('Graphify maintenance helpers (standard-library Python)', () => {
  it('never indexes untracked, generated, environment, or key files', () => {
    const root = fixture()
    writeFileSync(join(root, 'untracked.ts'), 'export const untracked = true\n')
    writeFileSync(join(root, '.env'), 'FIXTURE_VALUE=not-a-credential\n')
    writeFileSync(join(root, 'fixture.key'), 'not a key')
    writeFileSync(join(root, 'graphify/generated.ts'), 'export const generated = true\n')
    git(root, 'add', '--force', '.env', 'fixture.key', 'graphify/generated.ts')
    const result = pythonCall(root, 'print(json.dumps(module.source_inventory(root, module.scope_for(root))))')
    expect(result.status, result.stderr).toBe(0)
    expect(Object.keys(JSON.parse(result.stdout))).toEqual(['src/example.ts'])
  })

  it('tracks content changes rather than the commit that stores the graph', () => {
    const root = fixture()
    stamp(root)
    git(root, '-c', 'user.name=Graphify Fixture', '-c', 'user.email=graphify@example.invalid',
      'commit', '--quiet', '-m', 'fixture')
    expect(pythonCall(root, 'module.check_snapshot(root)').status).toBe(0)
    writeFileSync(join(root, 'src/example.ts'), 'export const value = 2\n')
    const changed = pythonCall(root, 'module.check_snapshot(root)')
    expect(changed.status).not.toBe(0)
    expect(changed.stderr).toContain('Graph is stale')
  })

  it('detects deleted sources, changed generators, and modified artifacts', () => {
    const root = fixture()
    stamp(root)
    rmSync(join(root, 'src/example.ts'))
    expect(pythonCall(root, 'module.check_snapshot(root)').stderr).toContain('Graph is stale')
    writeFileSync(join(root, 'src/example.ts'), 'export const value = 1\n')
    writeFileSync(join(root, 'graphify/graph.html'), 'modified')
    expect(pythonCall(root, 'module.check_snapshot(root)').stderr).toContain('artifact is missing or modified')
    stamp(root)
    writeFileSync(join(root, 'graphify/manage.py'), 'changed generator')
    expect(pythonCall(root, 'module.check_snapshot(root)').stderr).toContain('generator, scope, or tool lock changed')
  })

  it('refuses a tracked path that escapes through a symlinked directory', () => {
    const root = fixture()
    const outside = temp()
    renameSync(join(root, 'src'), join(outside, 'src'))
    symlinkSync(join(outside, 'src'), join(root, 'src'), 'dir')
    const result = pythonCall(root, 'module.source_inventory(root, module.scope_for(root))')
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('outside the repository')
  })

  it('denies network attempts before a connection can be made', () => {
    const root = fixture()
    const result = pythonCall(root, `
module.block_network()
import socket
socket.create_connection(("example.invalid", 443))
`)
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Graphify network access is disabled')
  })

  it('inventories unrepresented data JSON without hiding missing code', () => {
    const root = fixture()
    mkdirSync(join(root, 'config'))
    writeFileSync(join(root, 'config/profiles.json'), '{"profiles":[]}\n')
    writeFileSync(join(root, 'src/missing.ts'), 'export const missing = true\n')
    const result = pythonCall(root, `
code = [root / "src/example.ts", root / "config/profiles.json", root / "src/missing.ts"]
parsed, inventory, missing = module.partition_extraction_results(
    root, code, {"src/example.ts"}, {"config/profiles.json"}
)
print(json.dumps({
    "parsed": [path.relative_to(root).as_posix() for path in parsed],
    "inventory": inventory,
    "missing": missing,
}))
`)
    expect(result.status, result.stderr).toBe(0)
    expect(JSON.parse(result.stdout)).toEqual({
      parsed: ['src/example.ts'],
      inventory: ['config/profiles.json'],
      missing: ['src/missing.ts'],
    })
  })
})
