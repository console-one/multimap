import { Heap } from 'heap-js'

export type Comparator<V> = (a: V, b: V) => number

export class HeapMultimap<K, V> {

  private map: Map<K, Heap<V>>

  constructor(public comparator: Comparator<V>) {
    this.map = new Map<K, Heap<V>>()
  }

  has(key: K): boolean {
    return !(!this.map.has(key) || this.map.get(key).length === 0)
  }

  get(key: K): Heap<V> {
    if (!this.map.has(key)) return new Heap<V>()
    return this.map.get(key)
  }

  set(key: K, value: V): HeapMultimap<K, V> {
    if (!this.has(key)) {
      this.map.set(key, new Heap<V>(this.comparator))
    }

    const queue: Heap<V> = this.map.get(key)
    queue.push(value)
    this.map.set(key, queue)
    return this
  }

  delete(key: K): HeapMultimap<K, V> {
    this.map.delete(key)
    return this
  }

  setAll(key: K, values: Iterable<V>): HeapMultimap<K, V> {
    for (const value of values) this.set(key, value)
    return this
  }

  keys(): K[] {
    return Array.from(this.map.keys())
  }

  merge(other: HeapMultimap<K, V>): HeapMultimap<K, V> {
    for (const key of other.keys()) this.setAll(key, other.get(key).toArray())
    return this
  }

  toString() {
    const obj: any = {}
    for (const key of this.keys()) {
      obj[key] = this.get(key).toArray()
    }
    return JSON.stringify(obj, null, 1)
  }

  public static combine<K, V>(comparator: Comparator<V>, a: HeapMultimap<K, V>, b: HeapMultimap<K, V>): HeapMultimap<K, V> {
    const mMap = new HeapMultimap<K, V>(comparator)
    for (const key of a.keys()) mMap.setAll(key, a.get(key).toArray())
    for (const key of b.keys()) mMap.setAll(key, b.get(key).toArray())
    return mMap
  }

  public static fromList<K, V, Q>(
    comparator: Comparator<V>,
    list: Q[],
    categorizer: ((item: Q) => K),
    operator: ((item: any) => V) = (item => item)): HeapMultimap<K, V> {
    return list.reduce((map: HeapMultimap<K, V>, item: Q) => {
      return map.set(categorizer(item), operator(item))
    }, new HeapMultimap<K, V>(comparator))
  }
}
