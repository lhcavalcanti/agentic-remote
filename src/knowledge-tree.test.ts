import { describe, expect, it } from 'vitest'
import {
  collapseKnowledgeFolder,
  expandKnowledgeFolder,
  knowledgeAncestors,
  knowledgeCrumbs,
  knowledgePathChain,
  knowledgeTreeRows,
  type KnowledgeFolders,
} from './knowledge-tree'

const folders: KnowledgeFolders = {
  '.': {
    listing: {
      path: '.',
      entries: [
        { name: 'guides', path: 'guides', kind: 'directory' },
        { name: 'readme.md', path: 'readme.md', kind: 'markdown', size: 12 },
      ],
    },
  },
  guides: {
    listing: {
      path: 'guides',
      parent: '.',
      entries: [
        { name: 'deep', path: 'guides/deep', kind: 'directory' },
        { name: 'setup.md', path: 'guides/setup.md', kind: 'markdown', size: 8 },
      ],
    },
  },
  'guides/deep': {
    listing: {
      path: 'guides/deep',
      parent: 'guides',
      entries: [
        { name: 'note.md', path: 'guides/deep/note.md', kind: 'markdown' },
      ],
    },
  },
}

describe('knowledge tree', () => {
  it('derives ancestors and the chain that must be open', () => {
    expect(knowledgeAncestors('.')).toEqual([])
    expect(knowledgeAncestors('guides')).toEqual([])
    expect(knowledgeAncestors('guides/deep/note.md')).toEqual([
      'guides',
      'guides/deep',
    ])
    expect(knowledgePathChain('guides/deep')).toEqual(['guides', 'guides/deep'])
  })

  it('lists only expanded branches', () => {
    expect(knowledgeTreeRows(folders, []).map((row) => row.path)).toEqual([
      'guides',
      'readme.md',
    ])

    const opened = knowledgeTreeRows(folders, ['guides'])
    expect(opened.map((row) => row.path)).toEqual([
      'guides',
      'guides/deep',
      'guides/setup.md',
      'readme.md',
    ])
    // Children sit one level deeper so the sidebar can indent them.
    expect(opened.map((row) => row.depth)).toEqual([0, 1, 1, 0])
    expect(
      opened.find((row) => row.path === 'guides' && row.type === 'entry'),
    ).toMatchObject({ expandable: true, expanded: true })

    expect(
      knowledgeTreeRows(folders, ['guides', 'guides/deep']).map(
        (row) => row.path,
      ),
    ).toEqual([
      'guides',
      'guides/deep',
      'guides/deep/note.md',
      'guides/setup.md',
      'readme.md',
    ])
  })

  it('reports per-folder loading, empty, and error states', () => {
    const pending: KnowledgeFolders = {
      ...folders,
      guides: { loading: true },
    }
    expect(knowledgeTreeRows(pending, ['guides'])[1]).toMatchObject({
      type: 'status',
      variant: 'loading',
      depth: 1,
      path: 'guides',
    })

    const failed: KnowledgeFolders = {
      ...folders,
      guides: { error: 'offline' },
    }
    expect(knowledgeTreeRows(failed, ['guides'])[1]).toMatchObject({
      type: 'status',
      variant: 'error',
      message: 'offline',
    })

    const empty: KnowledgeFolders = {
      ...folders,
      guides: { listing: { path: 'guides', parent: '.', entries: [] } },
    }
    expect(knowledgeTreeRows(empty, ['guides'])[1]).toMatchObject({
      type: 'status',
      variant: 'empty',
    })

    // An unreachable branch must not blank the folders around it.
    expect(knowledgeTreeRows(failed, ['guides']).map((row) => row.path)).toEqual(
      ['guides', 'guides', 'readme.md'],
    )
  })

  it('expands a whole chain and collapses descendants with the folder', () => {
    expect(expandKnowledgeFolder([], 'guides/deep')).toEqual([
      'guides',
      'guides/deep',
    ])
    // Already-open ancestors are not duplicated.
    expect(expandKnowledgeFolder(['guides'], 'guides/deep')).toEqual([
      'guides',
      'guides/deep',
    ])
    expect(
      collapseKnowledgeFolder(['guides', 'guides/deep', 'other'], 'guides'),
    ).toEqual(['other'])
  })

  it('refuses to follow a folder that contains itself', () => {
    // A symlink loop, or a listing that simply repeats its own path, must not
    // be able to recurse the renderer to death.
    const looping: KnowledgeFolders = {
      '.': {
        listing: {
          path: '.',
          entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
        },
      },
      guides: {
        listing: {
          path: 'guides',
          parent: '.',
          entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
        },
      },
    }
    const rows = knowledgeTreeRows(looping, ['guides'])
    expect(rows.map((row) => `${row.depth}:${row.path}`)).toEqual([
      '0:guides',
      '1:guides',
    ])
  })

  it('builds breadcrumbs rooted at the knowledge root', () => {
    expect(knowledgeCrumbs('.', 'docs')).toEqual([{ name: 'docs', path: '.' }])
    expect(knowledgeCrumbs('guides/deep', 'docs')).toEqual([
      { name: 'docs', path: '.' },
      { name: 'guides', path: 'guides' },
      { name: 'deep', path: 'guides/deep' },
    ])
  })
})
