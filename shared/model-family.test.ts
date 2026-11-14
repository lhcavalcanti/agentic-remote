import { describe, expect, it } from 'vitest'
import { modelFamily, type ModelFamily } from './model-family.js'

// Model IDs found in fixtures, tests and docs. Provider catalogs are discovered,
// not embedded; these examples are classification coverage, not an offer list.
const repositoryModels: Record<ModelFamily, readonly string[]> = {
  anthropic: [
    'claude-agent-model', 'claude-sonnet-5.5', 'claude-x', 'node-claude-model',
    'claude-new-model', 'fixture-claude-99', 'sonnet',
  ],
  openai: ['gpt', 'gpt-test', 'gpt-5-mini', 'gpt-6-sol', 'gpt-6.1-sol', 'fixture-gpt-99'],
  google: [],
  xai: [],
  meta: [],
  mistral: [],
  generic: [
    '', 'before', 'changed-model', 'configured-model', 'discarded', 'effective-model', 'env-model',
    'fixture', 'fixture-boot', 'fixture-broken', 'fixture-configurable', 'fixture-default', 'fixture-fast',
    'fixture-fresh', 'fixture-long', 'fixture-model', 'fixture-next', 'fixture-no-effort', 'fixture-resume',
    'fixture-test', 'hub-default', 'hub-model', 'imaginary-model', 'missing', 'missing-model', 'model', 'model-1',
    'model-a', 'model-b', 'model-z', 'new-provider-model', 'node-model', 'original-model', 'provider-model',
    'queued-model', 'recovered-provider-model', 'resolved-provider-model', 'copilot-new-model',
    'control-model-001', 'treatment-model-001', 'refused', 'remote-model', 'removed-model',
    'replacement-model', 'retired-model', 'stale-model', 'synthetic', 'unknown', 'updated-model', 'v5',
  ],
}

describe('modelFamily', () => {
  it.each(Object.entries(repositoryModels).flatMap(([family, ids]) =>
    ids.map((id) => [id, family] as const),
  ))('classifies repository model %j as %s', (id, family) => {
    expect(modelFamily(id)).toBe(family)
  })

  it.each([
    ['ANTHROPIC/fixture-model', 'anthropic'],
    ['fixture-opus-99', 'anthropic'],
    ['SONNET', 'anthropic'],
    ['haiku', 'anthropic'],
    ['GPT-5.6 Sol', 'openai'],
    ['GPT-6.1 Sol', 'openai'],
    ['gpt4o', 'openai'],
    ['OpenAI/fixture', 'openai'],
    ['fixture-o1-preview', 'openai'],
    ['o1', 'openai'],
    ['o3', 'openai'],
    ['fixture_o3_mini', 'openai'],
    ['o4-mini', 'openai'],
    ['CODEX', 'openai'],
    ['chatgpt-fixture', 'openai'],
    ['Gemini-99-fixture', 'google'],
    ['GOOGLE/fixture', 'google'],
    ['grok-99-fixture', 'xai'],
    ['XAI/fixture', 'xai'],
    ['llama3-fixture', 'meta'],
    ['META/fixture', 'meta'],
    ['mistral-fixture', 'mistral'],
    ['MIXTRAL-fixture', 'mistral'],
    ['codestral-fixture', 'mistral'],
  ] as const)('recognizes delimited or versioned alias %j', (id, family) => {
    expect(modelFamily(id)).toBe(family)
    expect(modelFamily('opaque-fixture-id', id)).toBe(family)
  })

  it.each([
    'foo3', 'foo1', 'foo4', 'o30', 'o10', 'o40', 'o3d', 'o4ever', 'o123',
    'neo3', 'studio3', 'radio1', 'metadata', 'metaphor', 'megpt', 'gptastic',
    'octopus', 'sonnetteer', 'haikule', 'claudette', 'anthropicture', 'googler',
    'geminify', 'groking', 'xaires', 'llamazing', 'mistralized', 'mixtralian',
    'codestralian', 'copilot', 'sdk', 'tmux',
  ])('does not infer a family from unrelated text %j', (value) => {
    expect(modelFamily(value)).toBe('generic')
    expect(modelFamily('fixture-model', value)).toBe('generic')
  })

  it('keeps recognized model identity ahead of a conflicting display name', () => {
    expect(modelFamily('fixture-claude-99', 'GPT fixture')).toBe('anthropic')
    expect(modelFamily('fixture-gpt-99', 'Claude fixture')).toBe('openai')
    expect(modelFamily('', 'Claude fixture')).toBe('anthropic')
  })
})
