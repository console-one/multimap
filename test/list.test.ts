import { describe, it, expect } from 'vitest'
import { ListMultimap } from '../src/list'

describe('ListMultimap', () => {
  it('stores multiple values under the same key', () => {
    const mm = new ListMultimap<string, number>()
    mm.set('a', 1).set('a', 2).set('a', 3)
    expect(mm.get('a')).toEqual([1, 2, 3])
  })

  it('preserves insertion order within a key', () => {
    const mm = new ListMultimap<string, string>()
    mm.set('k', 'first').set('k', 'second').set('k', 'third')
    expect(mm.get('k')).toEqual(['first', 'second', 'third'])
  })

  it('allows duplicate values under the same key (unlike SetMultimap)', () => {
    const mm = new ListMultimap<string, number>()
    mm.set('a', 1).set('a', 1).set('a', 1)
    expect(mm.get('a')).toEqual([1, 1, 1])
  })

  it('has() returns true only when the key has at least one value', () => {
    const mm = new ListMultimap<string, number>()
    expect(mm.has('missing')).toBe(false)
    mm.set('present', 1)
    expect(mm.has('present')).toBe(true)
  })

  it('get() on a missing key returns an empty array, not undefined', () => {
    const mm = new ListMultimap<string, number>()
    expect(mm.get('nope')).toEqual([])
  })

  it('delete() removes the whole key', () => {
    const mm = new ListMultimap<string, number>()
    mm.set('a', 1).set('a', 2)
    mm.delete('a')
    expect(mm.has('a')).toBe(false)
    expect(mm.get('a')).toEqual([])
  })

  it('setAll() appends an iterable of values', () => {
    const mm = new ListMultimap<string, number>()
    mm.set('a', 0).setAll('a', [1, 2, 3])
    expect(mm.get('a')).toEqual([0, 1, 2, 3])
  })

  it('keys() returns all keys that have been set', () => {
    const mm = new ListMultimap<string, number>()
    mm.set('a', 1).set('b', 2).set('c', 3)
    expect(new Set(mm.keys())).toEqual(new Set(['a', 'b', 'c']))
  })

  it('merge() appends values from another multimap', () => {
    const a = new ListMultimap<string, number>()
    a.set('k', 1).set('k', 2)
    const b = new ListMultimap<string, number>()
    b.set('k', 3).set('j', 99)
    a.merge(b)
    expect(a.get('k')).toEqual([1, 2, 3])
    expect(a.get('j')).toEqual([99])
  })

  it('static combine() produces a new map without mutating either source', () => {
    const a = new ListMultimap<string, number>()
    a.set('k', 1)
    const b = new ListMultimap<string, number>()
    b.set('k', 2)
    const combined = ListMultimap.combine(a, b)
    expect(combined.get('k')).toEqual([1, 2])
    expect(a.get('k')).toEqual([1])
    expect(b.get('k')).toEqual([2])
  })

  it('static fromList() groups items by categorizer', () => {
    const items = [
      { kind: 'fruit', name: 'apple' },
      { kind: 'veg', name: 'carrot' },
      { kind: 'fruit', name: 'mango' },
    ]
    const mm = ListMultimap.fromList(items, item => item.kind, item => item.name)
    expect(mm.get('fruit')).toEqual(['apple', 'mango'])
    expect(mm.get('veg')).toEqual(['carrot'])
  })

  it('setter methods are chainable', () => {
    const mm = new ListMultimap<string, number>()
    const result = mm.set('a', 1).set('b', 2).setAll('a', [3]).delete('b')
    expect(result).toBe(mm)
    expect(mm.get('a')).toEqual([1, 3])
    expect(mm.has('b')).toBe(false)
  })
})
