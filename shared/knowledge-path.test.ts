import { describe, expect, it } from 'vitest'
import {
  joinKnowledgeRelativePath,
  knowledgeAbsolutePath,
  knowledgeRelativePathFromAbsolute,
  normalizeKnowledgeRelativePath,
  rebaseKnowledgeRelativePath,
} from './knowledge-path.js'

describe('Knowledge root paths', () => {
  it('normalizes safe relative paths and rejects escape paths', () => {
    expect(normalizeKnowledgeRelativePath('projects/./remote/')).toBe('projects/remote')
    expect(normalizeKnowledgeRelativePath('')).toBe('.')
    expect(() => normalizeKnowledgeRelativePath('../private')).toThrow('cannot escape')
    expect(() => normalizeKnowledgeRelativePath('/home/private')).toThrow('must be relative')
    expect(() => normalizeKnowledgeRelativePath('.git/config')).toThrow('hidden folders')
  })

  it('joins and rebases paths within a scoped root', () => {
    expect(joinKnowledgeRelativePath('projects/remote', 'docs/api')).toBe(
      'projects/remote/docs/api',
    )
    expect(rebaseKnowledgeRelativePath('projects/remote', 'projects/remote')).toBe('.')
    expect(rebaseKnowledgeRelativePath('projects/remote', 'projects/remote/docs')).toBe('docs')
    expect(rebaseKnowledgeRelativePath('projects/remote', 'projects/other')).toBeUndefined()
  })

  it('converts chooser paths without allowing navigation above the base', () => {
    expect(knowledgeAbsolutePath('/home/demo/projects', 'remote/docs')).toBe(
      '/home/demo/projects/remote/docs',
    )
    expect(
      knowledgeRelativePathFromAbsolute(
        '/home/demo/projects',
        '/home/demo/projects/remote/docs',
      ),
    ).toBe('remote/docs')
    expect(() =>
      knowledgeRelativePathFromAbsolute('/home/demo/projects', '/home/demo/private'),
    ).toThrow('outside')
  })
})
