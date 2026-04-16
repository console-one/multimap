import { describe, it, expect } from 'vitest'
import { SetMultimap } from '../src/set'

describe('SetMultimap', () => {
  it('stores multiple distinct values under the same key', () => {
    const mm = new SetMultimap<string, number>()
    mm.set('a', 1).set('a', 2).set('a', 3)
    expect(Array.from(mm.get('a')).sort()).toEqual([1, 2, 3])
  })

  it('deduplicates values within a key (unlike ListMultimap)', () => {
    const mm = new SetMultimap<string, number>()
    mm.set('a', 1).set('a', 1).set('a', 1)
    expect(Array.from(mm.get('a'))).toEqual([1])
    expect(mm.count('a')).toBe(1)
  })

  it('has() returns false when key is absent or empty', () => {
    const mm = new SetMultimap<string, number>()
    expect(mm.has('missing')).toBe(false)
    mm.set('present', 1)
    expect(mm.has('present')).toBe(true)
  })

  it('get() on a missing key returns an empty Set, not undefined', () => {
    const mm = new SetMultimap<string, number>()
    const s = mm.get('nope')
    expect(s).toBeInstanceOf(Set)
    expect(s.size).toBe(0)
  })

  it('count() returns the size of the value set for a key', () => {
    const mm = new SetMultimap<string, number>()
    expect(mm.count('missing')).toBe(0)
    mm.set('a', 1).set('a', 2).set('a', 1)
    expect(mm.count('a')).toBe(2)
  })

  it('delete() removes the whole key', () => {
    const mm = new SetMultimap<string, number>()
    mm.set('a', 1).set('a', 2)
    mm.delete('a')
    expect(mm.has('a')).toBe(false)
    expect(mm.count('a')).toBe(0)
  })

  it('setAll() adds an iterable of values', () => {
    const mm = new SetMultimap<string, number>()
    mm.setAll('a', [1, 2, 3, 2, 1])
    expect(Array.from(mm.get('a')).sort()).toEqual([1, 2, 3])
  })

  it('merge() unions values from another multimap', () => {
    const a = new SetMultimap<string, number>()
    a.set('k', 1).set('k', 2)
    const b = new SetMultimap<string, number>()
    b.set('k', 2).set('k', 3).set('j', 99)
    a.merge(b)
    expect(Array.from(a.get('k')).sort()).toEqual([1, 2, 3])
    expect(Array.from(a.get('j'))).toEqual([99])
  })

  it('copy() produces an independent clone', () => {
    const original = new SetMultimap<string, number>()
    original.set('a', 1).set('a', 2)
    const cloned = original.copy()
    cloned.set('a', 3)
    expect(Array.from(original.get('a')).sort()).toEqual([1, 2])
    expect(Array.from(cloned.get('a')).sort()).toEqual([1, 2, 3])
  })

  it('toJSON() serializes keys with a customizable serializer', () => {
    const mm = new SetMultimap<string, number>()
    mm.set('a', 1).set('a', 2).set('b', 3)
    const json = mm.toJSON()
    expect(json.a.sort()).toEqual([1, 2])
    expect(json.b).toEqual([3])
  })

  it('fromJSON() round-trips with toJSON()', () => {
    const original = new SetMultimap<string, string>()
    original.set('fruit', 'apple').set('fruit', 'mango').set('veg', 'carrot')
    const json = original.toJSON()
    const restored = SetMultimap.fromJSON(json)
    expect(new Set(restored.get('fruit'))).toEqual(new Set(['apple', 'mango']))
    expect(new Set(restored.get('veg'))).toEqual(new Set(['carrot']))
  })

  it('static combine() unions two multimaps without mutating either', () => {
    const a = new SetMultimap<string, number>()
    a.set('k', 1)
    const b = new SetMultimap<string, number>()
    b.set('k', 2)
    const combined = SetMultimap.combine(a, b)
    expect(Array.from(combined.get('k')).sort()).toEqual([1, 2])
    expect(Array.from(a.get('k'))).toEqual([1])
    expect(Array.from(b.get('k'))).toEqual([2])
  })

  it('static fromList() groups items by categorizer and dedupes within group', () => {
    const items = [
      { kind: 'fruit', name: 'apple' },
      { kind: 'fruit', name: 'apple' },
      { kind: 'fruit', name: 'mango' },
      { kind: 'veg', name: 'carrot' },
    ]
    const mm = SetMultimap.fromList(items, item => item.kind, item => item.name)
    expect(Array.from(mm.get('fruit')).sort()).toEqual(['apple', 'mango'])
    expect(Array.from(mm.get('veg'))).toEqual(['carrot'])
  })
})
