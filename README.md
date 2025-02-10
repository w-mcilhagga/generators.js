# generators.js
Implementing some of python's itertools in javascript.

Iterators and generators have been a part of python for a long while, but are more recent in javascript. As such, there are more iterator/generator examples in python. One such is [itertools](https://docs.python.org/3/library/itertools.html), which is a collection of (actually) generators that help with certain iteration tasks.

This repo is an implementation of some of these generators in javascript. Note that there is also an implementation of itertools for node, also called [itertools](https://www.npmjs.com/package/itertools). 

# Iterables, Iterators, and Generators.

Recall 

* An **iterable** is an object that can be iterated over. If `X` is an iterable, it can appear in a for-of loop as `for (let x of X) {}` and in spread syntax, e.g. `[...X]`. Javascript requires iterables to have a `Symbol.iterator` method which returns an iterator object when it is called. Iteratables can be iterated over many times if they return different iterator objects each time the `Symbol.iterator` method is called.
* An **iterator** is the object that actually visits the elements of an iterable. An iterator must have a `next()` method which is called repeatedly to obtain the next element in the iteration. Iterators are typically single-use: once finished, they can do nothing.
* A **generator** is a function-like syntax for creating an object which is both an iterable and an iterator. That is, the `Symbol.iterator` method returns the generator itself. Generators, like most iterators, are single use.

For further details, see [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)

# Usage.

Download the file `generators.js` and `import` any needed generators into your script. The generators provided in `generators.js` are

* **Standard generators:** These are part of the python standard library.
  * [`enumerate`](#enumerateiterable)
  * [`range`](#rangestart-stop-step)
  * [`zip`](#zipiterables)
* **Infinite generators:** These can create infinite sequences. `cycle` and `repeat` can also create finite sequences.
  * [`count`](#countstart-step)
  * [`cycle`](#cycleiterable-count)
  * [`repeat`](#repeatvalue-count)
* **Combining generators:** These combine two or more generators.
  * [`chain`](#chainiterables)
  * [`take`](#takeiterable-index) (not in python, a generalization of python's `islice`)
* **Combinatoric generators:**
  * [`combinations`](#combinationsiterable-r)
  * [`partitions`](#partitionsiterable-r) (not in python)
  * [`permutations`](#permutationsiterable-r)
  * [`product`](#productiterables)

This list does not include some python generators that are perhaps of limited use (to me anyway) or can be easily replaced (e.g. python's `islice` is replaced with `take`).

# Alphabetical List

## `chain(...iterables)`
`chain` will chain iterables together, yielding items from the first one, then items from the second, then the third, etc. Used for treating consecutive sequences as a single sequence.

* `chain('ab', [1,2,3])` will yield `'a', 'b', 1, 2, 3`

If the same iterator (or generator) is passed to chain twice, it won't do anything the second time as it has been exhausted the first time. Thus

```javascript
let r = range(3)
console.log(...chain(r,r))
```
will only produce `0,1,2` and not `0,1,2,0,1,2` as you might have expected.

## `combinations(iterable, r)`
`combinations` returns r length subsequences of elements from the input iterable.

* `combinations('abcd', 2)` yields 
  `['a', 'b'], ['a', 'c'], ['a', 'd'], ['b', 'c'], ['b', 'd'], ['c', 'd']`

If $n$ is the number of items in the iterable, there are $n!/(r!(n-r)!)$ combinations of $r$ elements. If the iterable is not an array, it is spread into one first.

## `count(start, step)`
`count` yields an infinite series of numbers. Not useful itself maybe, but can be combined with `zip` and other generators.

* `count()` is the same as `range(0,Math.infinity)`
* `count(start)` is the same as `range(start,Math.infinity)`
* `count(start, step)` is the same as `range(start,Math.sign(step)*Math.infinity, step)`

## `cycle(iterable, count)`
`cycle` repeats an iterable a number of times

* `cycle([1,2,3], 3)` will yield `1, 2, 3, 1, 2, 3, 1, 2, 3`
* `cycle([1,2,3])` will repeat the sequence `1, 2, 3` endlessly.

If the iterable is an iterator, it is used up.

## `enumerate(iterable)`
`enumerate` can be used to loop over the indices and values of an iterable. For example

```javascript
for (let [i, value] of enumerate('abc')) {
    console.log(i, value)
}
```
will yield
```
0 'a'
1 'b'
2 'c'
```
This is similar to `Object.entries` when applied to an array.

## `partitions(iterable, sizes)`
`partitions` is a more complete version of `combinations`. It splits the iterable into unique subsets of size `sizes[0], sizes[1], sizes[2], ...` without regard to the ordering within each subset. The total of `sizes` must add up to the length of the iterable.

For example, `partitions('abcd', [2, 2])` will yield
```
 [["a","b"],["c","d"]],
 [["a","c"],["b","d"]],
 [["a","d"],["b","c"]],
 [["b","c"],["a","d"]],
 [["b","d"],["a","c"]],
 [["c","d"],["a","b"]]
```
The first of each pair is the value yielded by `combinations`. `partitions` is not part of the python itertools module.

If $n$ is the size of the iterable and $r_1, r_2 ...$ are the partition sizes, then `partition` will yield $n!/(r_1!r_2!r_3!...)$ partitions.

If the iterable is not an array, it is spread into one first.

## `permutations(iterable, r)`
`permutations` returns successive r length permutations of elements in the iterable.

* `permutations('ABCD', 2)` yields AB AC AD BA BC BD CA CB CD DA DB DC
* `permutations(range(3))` yields 012 021 102 120 201 210

## `product(...iterables)`
`product` will yield the cartesian product of all the items in the iterables. Roughly the same as a nested for loop.

* `product('ab', [1,2,3])` will yield 
  `['a', 1], ['a', 2], ['a', 3], ['b', 1], ['b', 2], ['b', 3]`

`product` must exhaust all the iterables passed to it before it starts.

## `range(start, stop, step)`
`range` is a built in generator in python used for loops. 

* `range(stop)` yields `0, 1, 2, ..., stop-1`
* `range(start, stop)` yields `start, start+1, start+2, ... stop-1`
* `range(start, stop, step)` yields `start, start+step, start+2*step, ...` and finishes 
   when `start+n*step` exceeds or equals `stop`. For example:
   * `range(0,5,2)` yields `0,2,4`
   * `range(0,-5,-2)` yields `0,-2,-4`

The `range` iterator is used to run for loops in python. In javascript, the `range` iterator can be used to run a for loop, but maybe shouldn't be. In javascript, the following two loops are equivalent:
```javascript
for (let i=start; i<stop; i+=step) {
    // do stuff
}

for (let i of range(start, stop, step)) {
    // do stuff
}
```
python doesn't have the first kind of for loop.

## `repeat(value, count)`
`repeat` will repeat a single value a number of times.

* `repeat('hello', 3)` will yield `'hello', 'hello', 'hello'`
* `repeat('hello')` will yield `'hello'` endlessly.

## `take(iterable, index)`
takes elements from iterable accorind to the index. Index may be an iterable. 

* `take(range(1,10), [0, 1, 4])` yields `1, 2, 5`

## `zip(...iterables)`
`zip` accepts a series of iterables and iterates over them in parallel, stopping when the shortest iterable is exhausted. 

* `zip([0,1,2], 'abcd', count(-1,-1))` yields `[0,'a',-1], [1,'b',-2], [2,'c',-3]`

You can use `zip` to create items to pass to `Object.fromEntries`. For example,
`Object.fromEntries(zip('abc', [1,2,3]))` will return `{'a':1, 'b':2, 'c':3}`









