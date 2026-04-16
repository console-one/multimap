import { describe, it, expect } from 'vitest'
import { HeapMultimap } from '../src/heap'

const asc = (a: number, b: number) => a - b
const desc = (a: number, b: number) => b - a

describe('HeapMultimap', () => {
  it('stores values under a key with min-heap ordering', () => {
    const mm = new HeapMultimap<string, number>(asc)
    mm.set('k', 5).set('k', 1).set('k', 3)
    expect(mm.get('k').peek()).toBe(1)
  })

  it('supports max-heap via reverse comparator', () => {
    const mm = new HeapMultimap<string, number>(desc)
    mm.set('k', 5).set('k', 1).set('k', 3)
    expect(mm.get('k').peek()).toBe(5)
  })

  it('has() returns true only when the key has at least one value', () => {
    const mm = new HeapMultimap<string, number>(asc)
    expect(mm.has('absent')).toBe(false)
    mm.set('present', 1)
    expect(mm.has('present')).toBe(true)
  })

  it('get() on a missing key returns a fresh empty Heap, not undefined', () => {
    const mm = new HeapMultimap<string, number>(asc)
    const h = mm.get('nope')
    expect(h.length).toBe(0)
  })

  it('delete() removes the key entirely', () => {
    const mm = new HeapMultimap<string, number>(asc)
    mm.set('k', 1).set('k', 2)
    mm.delete('k')
    expect(mm.has('k')).toBe(false)
  })

  it('setAll() adds every value under the same key', () => {
    const mm = new HeapMultimap<string, number>(asc)
    mm.setAll('k', [9, 2, 7])
    expect(mm.get('k').peek()).toBe(2)
  })

  it('keys() lists every inserted key', () => {
    const mm = new HeapMultimap<string, number>(asc)
    mm.set('a', 1).set('b', 2).set('c', 3)
    expect(new Set(mm.keys())).toEqual(new Set(['a', 'b', 'c']))
  })

  it('merge() pulls values from another HeapMultimap', () => {
    const a = new HeapMultimap<string, number>(asc)
    a.set('k', 5)
    const b = new HeapMultimap<string, number>(asc)
    b.set('k', 1).set('k', 3)

    a.merge(b)
    expect(a.get('k').peek()).toBe(1)
  })

  it('combine() builds a new HeapMultimap from two inputs', () => {
    const a = new HeapMultimap<string, number>(asc)
    a.set('k', 9)
    const b = new HeapMultimap<string, number>(asc)
    b.set('k', 2)

    const c = HeapMultimap.combine(asc, a, b)
    expect(c.get('k').peek()).toBe(2)
    expect(a.get('k').peek()).toBe(9)
  })

  it('fromList() partitions a flat list into a heap per category', () => {
    const items = [
      { color: 'red', value: 7 },
      { color: 'blue', value: 2 },
      { color: 'red', value: 3 },
      { color: 'blue', value: 8 }
    ]
    const mm = HeapMultimap.fromList(asc, items, i => i.color, i => i.value)
    expect(mm.get('red').peek()).toBe(3)
    expect(mm.get('blue').peek()).toBe(2)
  })
})
