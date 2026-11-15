import { describe, expect, it } from 'vitest'
import { parseSkillSettings, replaceDisabledSkills } from './skill-settings-jsonc.js'

describe('comment-preserving disabledSkills edits', () => {
  it.each([
    ['before', '[/* before */"first", "keep"]'],
    ['after', '["first"/* after */, "keep" /* keep note */]'],
    ['between', '["first", /* between */ "keep", /* next */ "last"]'],
    ['trailing comma', '["first", /* keep note */ "keep", /* tail */]'],
    ['line comments', '[\n  // first note\n  "first", // after first\n  // keep note\n  "keep", // after keep\n]'],
    ['empty comments', '[/* empty array note */]'],
  ])('adds and removes names without losing %s comments', (_name, array) => {
    const raw = `{\n  "untouched": {"disabledSkills": ["nested"],},\n  "disabledSkills": ${array}, // outside\n}\n`
    const before = parseSkillSettings(raw).disabledSkills as string[]
    const desired = [...before.filter((name) => name !== 'first'), 'new-skill']
    const changed = replaceDisabledSkills(raw, desired)
    expect(new Set(parseSkillSettings(changed).disabledSkills as string[])).toEqual(new Set(desired))
    for (const comment of array.match(/\/\*.*?\*\/|\/\/[^\r\n]*/g) ?? []) expect(changed).toContain(comment)
    expect(changed.startsWith(raw.slice(0, raw.indexOf(array)))).toBe(true)
    expect(changed.endsWith(raw.slice(raw.indexOf(array) + array.length))).toBe(true)
    if (before.includes('keep')) expect(changed).toContain('"keep"')
  })

  it.each(['first', 'middle', 'last'])('removes the %s element and its separator while retaining every comment', (removed) => {
    const raw = '{"disabledSkills":[/* first */"first",/* middle */"middle",/* last */"last",/* tail */]}'
    const changed = replaceDisabledSkills(raw, ['first', 'middle', 'last'].filter((name) => name !== removed))
    expect(parseSkillSettings(changed).disabledSkills).toEqual(['first', 'middle', 'last'].filter((name) => name !== removed))
    for (const name of ['first', 'middle', 'last', 'tail']) expect(changed).toContain(`/* ${name} */`)
  })

  it('can empty a commented array and populate it again without moving or dropping notes', () => {
    const raw = '{"disabledSkills":[// before\n"only"/* after */, // tail\n]}'
    const empty = replaceDisabledSkills(raw, [])
    expect(parseSkillSettings(empty).disabledSkills).toEqual([])
    expect(empty).toBe(raw.replace('"only"', '').replace(',', ''))
    const populated = replaceDisabledSkills(empty, ['new'])
    expect(parseSkillSettings(populated).disabledSkills).toEqual(['new'])
    expect(populated).toContain('// before')
    expect(populated).toContain('/* after */')
    expect(populated).toContain('// tail')
  })

  it('preserves surviving element spelling, order, and comments instead of rewriting the array', () => {
    const raw = '{"disabledSkills":["z\\u0065bra", /* keep */ "keep"]}'
    const changed = replaceDisabledSkills(raw, ['keep', 'new', 'zebra'])
    expect(changed).toContain('"z\\u0065bra", /* keep */ "keep"')
    expect(parseSkillSettings(changed).disabledSkills).toEqual(['zebra', 'keep', 'new'])
    expect(replaceDisabledSkills(changed, ['new', 'keep', 'zebra'])).toBe(changed)
  })
})
