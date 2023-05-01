/** python-like generators for javascript.
 */

/** range
 * generate a series of numbers
 * range(stop) yield 0, 1, 2, ... stop-1
 * range(start, stop) yields start, start+1, start+2, ... stop-1
 * range(start, stop, step) yields start, start+step, ... and finishes
 *     before getting to stop.
 * @example [...range(0,5,1)] is [0,1,2,3,4],
 * 	        [...range(0,-5,-1)] is [0,-1,-2,-3,-4]
 */
function* range(start, stop, step = 1) {
    if (stop == undefined) {
        ;[start, stop] = [0, start]
    }
    if (step > 0) {
        for (let i = start; i < stop; i += step) {
            yield i
        }
    } else {
        for (let i = start; i > stop; i += step) {
            yield i
        }
    }
}

/** count
 * yield an infinite series of numbers
 * count() yields, 0, 1, 2, ...
 * count(n) yields n, n+1, n+2
 * count(n, -1) yields n, n-1, n-2, ...
 */
function* count(start = 0, step = 1) {
    yield* range(start, Math.sign(step) * Infinity, step)
}

/** islice
 * yield the elements of an iterable in a range or index set
 * islice('abcdef', range(0, 6, 2)) yields 'a', 'c', 'e'
 * islice('abcdef', [1,2,4]) yields 'b', 'c', 'e'
 *
 * islice will fail if the slice sequence is not increasing
 */
function* islice(iterable, indices) {
    let iterator = indices[Symbol.iterator](),
        idx = iterator.next().value
    for (let [i, v] of enumerate(iterable)) {
        if (i == idx) {
            yield v
            idx = iterator.next().value
        }
    }
}

/** zip
 * iterate over iterables in parallel
 * zip('abc', [1,2,3]) yields ['a',1], ['b',2], ['c',3]
 *
 * zip stops when the shortest iterable is exhausted.
 */
function* zip(...iterables) {
    let iterators = iterables.map((i) => i[Symbol.iterator]())
    while (true) {
        let next = iterators.map((i) => i.next())
        if (next.some((a) => a.done)) {
            break
        }
        yield next.map((a) => a.value)
    }
}

/* enumerate yields [count, value] pairs for the iterable
 * Much like Object.entries except that returns the indices as strings (keys).
 */
function* enumerate(iterable) {
    yield* zip(count(), iterable)
}

function to_indexable(obj) {
    // if obj is an iterator, it is run to completion
    // to produce an array.
    if (obj.length!=undefined) {
        return obj
    }
    return [...obj]
}

/** reverse
 * iterate over an iterable in reverse.
 * The iterable is completely consumed
 */
function* reverse(iterable) {
    iterable = to_indexable(iterable)
    for (let i = iterable.length - 1; i >= 0; i--) {
        yield iterable[i]
    }
}

/** cycle
 * repeat an iterator or iterable a number of times
 * Iterators are completely consumed the first time.
 */
function* cycle(iterable, count = Math.infinity) {
    iterable = to_indexable(iterable)
    for (let i = 0; i < count; i++) {
        yield* iterable
    }
}

/** repeat
 * repeats a single value a number of times, if count not given
 * it repeats infinitely
 */
function* repeat(value, count = Math.infinity) {
    for (let i = 0; i < count; i++) {
        yield value
    }
}

/** chain
 * yields iterables one after another
 */
function* chain(...iterables) {
    for (let i of iterables) {
        yield* i
    }
}

/** product
 * cartesian product of iterables
 */
function* product(...iterables) {
    iterables = iterables.map(to_indexable)
    if (iterables.length == 1) {
        for (let a of iterables[0]) {
            yield [a]
        }
    } else {
        for (let a of iterables[0]) {
            for (let b of product(...iterables.slice(1))) {
                yield [a, ...b]
            }
        }
    }
}

function pick_array(array, idx) {
    let result = new Array(idx.length)
    for (let i = 0; i < result.length; i++) {
        result[i] = array[idx[i]]
    }
    return result
}

function omit_array(array, idx) {
    let omit = [],
        pos = 0
    for (let i = 0; i < array.length; i++) {
        if (i == idx[pos]) {
            pos++
        } else {
            omit.push(array[i])
        }
    }
    return omit
}

// this code taken from the python itertools docs & translated:

function* combination_indices(n, r) {
    if (r > n) {
        return
    }
    let indices = [...range(r)]
    yield indices
    while (true) {
        let idx = -1
        for (let i = r - 1; i >= 0; i--) {
            if (indices[i] != i + n - r) {
                idx = i
                break
            }
        }
        if (idx == -1) {
            return
        }
        indices[idx] += 1
        for (let j = idx + 1; j < r; j++) {
            indices[j] = indices[j - 1] + 1
        }
        yield indices
    }
}

/** combinations
 * combinations(iterable, r) returns all combinations of length r from the iterable
 */
function* combinations(iterable, r) {
    let pool = to_indexable(iterable)
    for (let idx of combination_indices(pool.length, r)) {
        yield pick_array(pool, idx)
    }
}

/** partitions
 * This is an extension of combinations.
 * partitions(iterable, r, n-r) returns all partitions of data into sizes r and n-r
 */
function* partitions(iterable, ...sizes) {
    let pool = to_indexable(iterable),
        n = sizes.reduce((a, x) => a + x)
    if (n != pool.length) {
        return
    }
    if (sizes.length == 1) {
        yield [pool]
    } else {
        for (let idx of combination_indices(pool.length, sizes[0])) {
            let p0 = pick_array(pool, idx)
            for (let rest of partitions(omit_array(pool, idx), ...sizes.slice(1))) {
                yield [p0, ...rest]
            }
        }
    }
}

/** permutations
 * permutations('ABCD', 2) --> AB AC AD BA BC BD CA CB CD DA DB DC
 * permutations(range(3)) --> 012 021 102 120 201 210
 * code taken from python
 */
function* permutations(iterable, r) {
    let pool = [...iterable],
        n = pool.length
    r = r || n
    if (r > n) {
        return
    }
    let indices = [...range(n)],
        cycles = [...range(n, n - r, -1)]
    yield pick_array(pool, indices.slice(0, r))
    while (n) {
        let ok = false
        for (let i = r - 1; i >= 0; i--) {
            cycles[i] -= 1
            if (cycles[i] == 0) {
                let indices_i = indices[i]
                for (let k = i; k < n - 1; k++) {
                    indices[k] = indices[k + 1]
                }
                indices[n - 1] = indices_i
                cycles[i] = n - i
            } else {
                let j = cycles[i]
                ;[indices[i], indices[n - j]] = [indices[n - j], indices[i]]
                yield pick_array(pool, indices.slice(0, r))
                ok = true
                break
            }
        }
        if (!ok) {
            return
        }
    }
}

// nothing to do with itertools really.

function shuffle_in_place(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)) // random index from 0 to i
        // swap elements array[i] and array[j]
        ;[array[i], array[j]] = [array[j], array[i]]
    }
}
