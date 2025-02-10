/* unless explicitly stated, all generators can take iterator arguments as well as iterable ones.
 */

export function* range(start, stop, step = 1) {
    /* generates a (finite) sequence of numbers
     *
     * range(stop) generates 0, 1, 2, ..., stop-1
     * range(start, stop) generates start, start+1, start+2, ... stop-1
     * range(start, stop, step) generates start, start+step, start+2*step
     *    until this exceeds stop-1, when step>0, or exceeds stop+1, when step<0
     *    Thus, range(-2,2,1) is [-2,-1,0,1] and range(2,-2,-1) is [2,1,0,-1]
     *
     * Not as useful in javascript as python, but can be used to e.g. initialize an
     * array:
     *
     * [...range(5)] produces the array [0,1,2,3,4]
     */
    if (stop === undefined) {
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

export function* zip(...iterables) {
    /* combines the outputs of a number of iterables into arrays,
     * stopping when any iterable is exhausted.
     *
     *   zip('ABC', [1,2,3,4]) yields ['A',1], ['B',2], ['C',3]
     *
     * Any arguments that are repeated iterators won't zip properly. For example
     *   let x = range(3)
     *   [...zip(x, x)]
     * will produce [[0,1]] instead of the expected [[0,0], [1,1], [2,2] ]
     */
    // first, we convert the iterables into iterators
    let iterators = iterables.map((i) => i[Symbol.iterator]())
    while (true) {
        let result = iterators.map((i) => i.next())
        if (result.every((r) => !r.done)) {
            yield result.map((r) => r.value)
        } else {
            return
        }
    }
}

export function* count(start = 0, step = 1) {
    /* generates an infinite sequence of numbers
     *
     * count() generates 0, 1, 2, ...
     * count(start) generates start, start+1, start+2, ...
     * count(start, step) generates start, start+step, start+2*step, ...
     */
    while (true) {
        yield start
        start += step
    }
}

export function* repeat(item, n = Infinity) {
    /* repeats an item a fixed number of times
     *
     * repeat(1) yields 1, 1, 1, ...
     * repeat({a:1}) yields {a:1}, {a:1}, ... (all the objects are the same one)
     * repeat(x, 5) yields x, x, x, x, x
     *
     * You can generate a ten element array of zeros by [...repeat(0,10)]
     */
    while (n-- > 0) {
        yield item
    }
}

export function* enumerate(iterable, start = 0) {
    /* generates a numbered sequence from an iterable
     *
     * enumerate('ABC') yields [0, 'A'], [1, 'B'], [2, 'C']
     * enumerate('ABC', 10) yields [10, 'A'], [11, 'B'], [12, 'C']
     *
     * The yielded values of enumerate are like the arguments passed to
     * the callback in map, foreach, filter, etc, just reversed.
     */
    yield* zip(count(start), iterable)
}

export function* cycle(iterable, n = Infinity) {
    /* repeats an iterable a fixed or infinite number of times
     *
     * cycle([1,2,3]) yields 1, 2, 3, 1, 2, 3, 1, 2, 3, ...
     * cycle([1,2,3], 2) yields 1, 2, 3, 1, 2, 3
     *
     * cycle doesn't work with iterators. For example, [...cycle(range(3),2)] will
     * only result in [0,1,2] and not [0,1,2,0,1,2] as expected. If you want to
     * use an iterator, use the spread operator: cycle([...range(3)]) will work
     * as expected.
     */
    while (n-- > 0) {
        yield* iterable
    }
}

export function* chain(...iterables) {
    /* yields the elements of one iterable after another
     * until all are used up.
     *
     * chain('ABC', [1,2]) yields 'A', 'B', 'C', 1, 2
     *
     * chain also works on iterators so long as they aren't repeated. For example
     *     let x = range(3)
     *     [...chain(x,x)]
     * will only produce [0,1,2] and not [0,1,2,0,1,2] as expected. However
     *     [...chain(range(3), range(3))]
     * does produce the expected result, because the two range() calls are separate
     * iterators.
     */
    for (let it of iterables) {
        yield* it
    }
}

export function* take(iterable, indices) {
    /* yield the elements of an iterable in a range or index set
     * take('abcdef', range(0, 6, 2)) yields 'a', 'c', 'e'
     * take('abcdef', [1,2,4]) yields 'b', 'c', 'e'
     *
     * take will produce unexpected results if the slice sequence is not increasing
     */
    indices = indices[Symbol.iterator]()
    let idx = indices.next()
    if (idx.done) {
        return
    }
    idx = idx.value
    for (let [i, v] of enumerate(iterable)) {
        if (i == idx) {
            yield v
            idx = indices.next()
            if (idx.done) {
                return
            }
            idx = idx.value
        }
    }
}

function* prefix(item, iterable) {
    /* prefixes the output of an iterable with a value.
     * each value from the iterable must be spreadable e.g. an array.
     */
    for (let p of iterable) {
        yield [item, ...p]
    }
}

function* itermap(iterable, callbackFn) {
    /* each item in iterable is fed to the callback function
     */
    for (let item of iterable) {
        yield callbackFn(item)
    }
}

export function* product(...iterables) {
    /* yields the cartesian product of the iterables
     *
     * product('ABC', [1,2]) will yield
     *     ['A', 1], ['A', 2], ['B', 1], ['B', 2], ['C', 1], ['C', 2]
     *
     * product also works on iterators so long as they aren't repeated.
     *
     * All iterators (i.e. object with .next method) in the arguments are first spread into arrays.
     */
    yield* array_product(iterables.map((i) => (i.next ? [...i] : i)))

    function* array_product(arrays) {
        if (arrays.length == 1) {
            yield* itermap(arrays[0], (item) => [item])
        } else {
            for (let item of arrays[0]) {
                yield* prefix(item, array_product(arrays.slice(1)))
            }
        }
    }
}

export function* permutations(iterable) {
    /* yields all permutations of an iterable. If the iterable isn't an array
     * it is turned into one using the spread operator, so an iterator is also
     * acceptable.
     *
     * permutations([1,2,3]) yields
     *   [1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]
     *
     */
    yield* array_permutations(Array.isArray(iterable) ? iterable : [...iterable])

    function* array_permutations(array) {
        if (array.length <= 1) {
            yield array
        } else {
            // the splicing here seems inefficient but it works as fast
            // as an in-place algorithm.
            for (let i = 0; i < array.length; i++) {
                let item = array.splice(i, 1)
                yield* prefix(item[0], array_permutations(array))
                array.splice(i, 0, item[0])
            }
        }
    }
}

export function* combinations(iterable, n, return_unused = false) {
    /* returns all combinations of n elements from an iterable. If the iterable isn't an array
     * it is turned into one using the spread operator, so an iterator is also
     * usable.
     *
     * combinations([1,2,3,4], 2) yields [1,2], [1,3], [1,4], [2,3], [2,4], [3,4]
     *
     * If return_unused is true, the items of the iterable that *aren't* in the combination
     * are also returned as an array. Thus
     * combinations([1,2,3,4], 2, true) yields
     *      [1,2, [3,4]], [1,3, [2,4]], [1,4, [2,3]], [2,3, [1,4]], [2,4, [1,3]], [3,4, [1,2]]
     *
     * The return_unused feature is mostly for partitions, below.
     */

    yield* array_combinations(
        Array.isArray(iterable) ? iterable : [...iterable],
        n,
        return_unused && []
    )

    function* array_combinations(array, n, unused) {
        if (n <= 0 || n > array.length) {
            throw new RangeError(
                'n must be greater than 0 and less than the iteratable length'
            )
        }
        if (n == 1 && unused) {
            yield* array.map((item, i) => [item, [...unused, ...array.toSpliced(i, 1)]])
        } else if (n == 1 && !unused) {
            yield* array.map((item) => [item])
        } else if (n == array.length) {
            yield unused ? [...array, unused] : array
        } else {
            let [item, ...rest] = array
            // first, all combinations that contain item
            yield* prefix(item, array_combinations(rest, n - 1, unused))
            // next, all combinations that don't contain item
            unused?.push?.(item)
            yield* array_combinations(rest, n, unused)
            unused?.pop?.(item)
        }
    }
}

export function* partitions(iterable, sizes) {
    /* returns all partitions of the iterable with given sizes
     *
     * A partition is a group of subsets such that
     * a) they are disjoint
     * b) their union is the iterable
     * c) they have the sizes specified.
     *
     * For example, partitions([1,2,3,4,5], [2,2,1]) yields
     *
     * [[1,2],[3,4],[5]], [[1,2],[3,5],[4]], [[1,2],[4,5],[3]], [[1,3],[2,4],[5]], ...
     *
     * Each partition (e.g. [[1,2],[3,4],[5]]) has sets of size 2,2,1
     */
    yield* array_partitions(Array.isArray(iterable) ? iterable : [...iterable], sizes)

    function* array_partitions(array, sizes) {
        if (sizes.length == 1) {
            if (sizes[0] != array.length) {
                throw new RangeError('sum of sizes must be equal to the iterator length')
            }
            yield [array]
        } else {
            for (let c of combinations(array, sizes[0], true)) {
                let unused = c.pop()
                yield* prefix(c, array_partitions([...unused], sizes.slice(1)))
            }
        }
    }
}
