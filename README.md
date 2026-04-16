# @console-one/multimap

Minimal multimap collections: `ListMultimap<K, V>` and `SetMultimap<K, V>`. No dependencies.

A multimap is a map where each key holds a collection of values rather than a single value. `ListMultimap` uses an array per key (preserves insertion order, allows duplicates). `SetMultimap` uses a `Set` per key (deduplicates, unordered).

## Install

```bash
npm install @console-one/multimap
```

## Usage

```ts
import { ListMultimap, SetMultimap } from '@console-one/multimap'

// ListMultimap — order-preserving, allows duplicates
const subscribers = new ListMultimap<string, Function>()
subscribers.set('user.created', onCreate).set('user.created', logCreate)
subscribers.get('user.created')  // [onCreate, logCreate]

// SetMultimap — deduplicating, unordered
const tags = new SetMultimap<string, string>()
tags.set('post-1', 'typescript').set('post-1', 'typescript')
tags.count('post-1')  // 1 (deduped)
```

## API

Both classes share the same shape. The only differences: `ListMultimap`'s values are arrays, `SetMultimap`'s values are `Set`s and deduplicate automatically.

### Common methods

| Method | Description |
|---|---|
| `set(key, value)` | Add a value under a key. Chainable. |
| `get(key)` | Return the collection for a key. Returns an empty collection (not undefined) if the key is missing. |
| `has(key)` | True iff the key has at least one value. |
| `delete(key)` | Remove the entire key and all its values. Chainable. |
| `setAll(key, iterable)` | Add every value in the iterable under the key. Chainable. |
| `keys()` | Array of all keys with at least one value. |
| `merge(other)` | Add all entries from another multimap into this one (in place). |

### `ListMultimap` extras

| Method | Description |
|---|---|
| `static combine(a, b)` | New multimap containing all entries from both inputs (pure). |
| `static fromList(items, categorizer, operator?)` | Group an array by a key function. |

### `SetMultimap` extras

| Method | Description |
|---|---|
| `count(key)` | Number of distinct values under the key. |
| `copy()` | Independent clone. |
| `toJSON(serializer?)` | Plain-object JSON form; key serialization is customizable. |
| `static fromJSON(obj, deserializer?)` | Inverse of `toJSON`. |
| `static combine(a, b)` | Pure union of two multimaps. |
| `static fromList(items, categorizer, operator?)` | Group an array by a key function. |

## When to pick which

- Use `ListMultimap` when order matters, duplicates are meaningful, or values aren't comparable by identity. Example: ordered event handlers.
- Use `SetMultimap` when you want automatic deduplication and don't care about order. Example: tags, unique membership.

## Notes

- No dependencies. Pure TypeScript, single file per class.
- Both classes are chainable for every mutating method.
- `get()` never returns undefined — it returns the empty collection, so `for (let x of mm.get(k))` is always safe.
