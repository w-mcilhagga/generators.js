# generators.js

Implementing some of python's itertools in javascript.

Iterators and generators have been a part of python for a long while, but are more recent in javascript.
As such, there are more iterator/generator examples in python. One such is
[itertools](https://docs.python.org/3/library/itertools.html), which is a collection of
(actually) generators that help with certain iteration tasks.

This repo is an implementation of some of these generators in javascript. Note that there is also an
implementation of itertools for node, also called
[itertools](https://www.npmjs.com/package/itertools).

# Iterables, Iterators, and Generators.

Recall

* An **iterable** is an object that can be iterated over. If `X` is an iterable, it can appear in a for-of loop as
  `for (let x of X) {}` and in spread syntax, e.g. `[...X]`. Javascript requires iterables to have a `Symbol.iterator`
  method which returns an iterator object when it is called. Iteratables can be iterated over many times if they return
  different iterator objects each time the `Symbol.iterator` method is called.
* An **iterator** is the object that actually visits the elements of an iterable. An iterator must have a `next()`
  method which is called repeatedly to obtain the next element in the iteration. Iterators are typically single-use:
  once finished, they can do nothing.
* A **generator** is a function-like syntax for creating an object which is both an iterable and an iterator. That is,
  the `Symbol.iterator` method returns the generator itself. Generators, like most iterators, are single use.

For further details, see [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)

# Usage.

Download the file `generators.js` and `import` any needed generators into your script.



## `range`
generates a sequence of numbers.

<dl>
<dt>

**Usage**

</dt>
<dd>

  * `range(stop)`
  * `range(start,stop)`
  * `range(start, stop, step)`


</dd>
</dl>

<dl>
<dt>

**Parameters**

</dt>
<dd>

* **start:**  the start of the sequence of numbers; if omitted, it defaults to 0
* **stop:**  the end of the sequence of numbers. stop is not included in the sequence.
* **step:**  the step between successive elements in the sequence; if omitted, it defaults to 1.


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

  a sequence of numbers, `start, start+step, start+2*step, ...` up until but
  not including stop.


</dd>
</dl>

<dl>
<dt>

**Examples**

</dt>
<dd>

  * `range(10)` yields `0, 1, 2, 3, 4, 5, 6, 7, 8, 9`
  * `range(3, 10)` yields `3, 4, 5, 6, 7, 8, 9`
  * `range(3, 11, 2)` yields `3, 5, 7, 9`
  * `range(2,-1,-1)` yields `2, 1, 0, -1`


</dd>
</dl>

<dl>
<dt>

**Notes**

</dt>
<dd>

  `range` is not as useful in javascript as python (where it is fundamental to looping)
  but can be used to e.g. initialize an array with the spread syntax e.g. `[...range(5)]` produces
  the array `[0, 1, 2, 3, 4]`


</dd>
</dl>


## `zip(...iterables)`
iterates over several iterables in parallel, yielding their
values as arrays. `zip` stops when any of the iterables is exhausted.

<dl>
<dt>

**Parameters**

</dt>
<dd>

...iterables: a set of iterables


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

  the values across all iterables collected in an array.


</dd>
</dl>

<dl>
<dt>

**Example**

</dt>
<dd>

  * `zip('ABC', [1,2,3,4])` yields ` ['A',1], ['B',2], ['C',3]`


</dd>
</dl>

<dl>
<dt>

**Notes**

</dt>
<dd>

   Any arguments that are repeated iterators won't zip properly. For example

  ```
  let x = range(3)
  [...zip(x, x)]
  ```
  will produce `[[0,1]]` instead of the expected `[[0,0], [1,1], [2,2] ]`


</dd>
</dl>


## `count`
generates an infinite sequence of numbers

<dl>
<dt>

**Parameters**

</dt>
<dd>

* **start:**  the value to start counting from. If omitted, it defaults to 0
* **step:**  the step between successive values yielded. If omitted, it defaults to 1.


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

   a sequence of numbers `start, start+step, start+2*step ...`


</dd>
</dl>

<dl>
<dt>

**Examples**

</dt>
<dd>

  * `count()` generates `0, 1, 2, ...`
  * `count(start)` generates `start, start+1, start+2, ...`
  * `count(start, step)` generates `start, start+step, start+2*step, ...`


</dd>
</dl>

<dl>
<dt>

**Notes**

</dt>
<dd>

  `start` and `step` don't *need* to be numbers, any type with + defined will do. So,
  for example, `count('a')` yields `'a', 'a1', 'a11', 'a111', ...`



</dd>
</dl>


## `repeat`
will repeat an item a number of times.

<dl>
<dt>

**Parameters**

</dt>
<dd>

* **item:**  the item to repeat
* **count:**  the number of times to yield the item. If omitted, it defaults to infinity


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

   a sequence of items.


</dd>
</dl>

<dl>
<dt>

**Examples**

</dt>
<dd>

   * `repeat(1)` yields the infinite repetition `1, 1, 1, ...`
   * `repeat({a:1})` yields `{a:1}, {a:1}, ...` (all the objects are the same one)
   * `repeat(x, 5)` yields a sequence of 5 items, `x, x, x, x, x`.


</dd>
</dl>

<dl>
<dt>

**Note**

</dt>
<dd>

   You can generate a ten element array of zeros by `[...repeat(0,10)]`


</dd>
</dl>


## `enumerate`
generates a numbered sequence from an iterable.

<dl>
<dt>

**Parameters**

</dt>
<dd>

* **iterable:**  the iterable to enumerate
* **start:**  the start value for the enumeration. If omitted, it defaults to 0


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

   a sequence of `[index, value]`.


</dd>
</dl>

<dl>
<dt>

**Examples**

</dt>
<dd>

  * `enumerate('ABC')` yields `[0, 'A'], [1, 'B'], [2, 'C']`
  * `enumerate('ABC', 10)` yields `[10, 'A'], [11, 'B'], [12, 'C']`. The second
     parameter says where to start counting (default is 0, but 1 might sometimes
     be useful).


</dd>
</dl>

<dl>
<dt>

**Notes**

</dt>
<dd>

  `enumerate` is a lot like `Object.entries`, except that index value is a number, rather
  than the string that `Object.entries` produces.


</dd>
</dl>


## `cycle`
cycles through an iterable a number of times.

<dl>
<dt>

**Parameters**

</dt>
<dd>

* **iterable:**  the iterable to cycle over
* **count:**  the number of times to cycle. If omitted, it defaults to infinity


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

   elements from the iterable over an over again.


</dd>
</dl>

<dl>
<dt>

**Examples**

</dt>
<dd>

  * `cycle([1,2,3])` yields `1, 2, 3, 1, 2, 3, 1, 2, 3, ...`
  * `cycle([1,2,3], 2)` yields `1, 2, 3, 1, 2, 3`. The second parameter, if given,
     says how many times the cycle should run.


</dd>
</dl>

<dl>
<dt>

**Notes**

</dt>
<dd>

  `cycle` will also take an iterator or generator, but it spreads it into an array first.


</dd>
</dl>


## `chain`
yield the elements of one iterable after another until all are used up.

<dl>
<dt>

**Parameters**

</dt>
<dd>

...iterables: the iterables to chain together


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

   all the values from the first iterable, followed by all values from the second, etc. until
   all iterables have yielded.


</dd>
</dl>

<dl>
<dt>

**Example**

</dt>
<dd>

  * `chain('ABC', [1,2])` yields `'A', 'B', 'C', 1, 2`


</dd>
</dl>

<dl>
<dt>

**Notes**

</dt>
<dd>

  chain also works on iterators so long as they aren't repeated. For example
  ```
  let x = range(3)
  [...chain(x,x)]
  ```
  will only produce `[0,1,2]` and not `[0,1,2,0,1,2]` as expected. However
  ```
  [...chain(range(3), range(3))]
  ```
  does produce the expected result, because the two range() calls are separate
  iterators.


</dd>
</dl>


## `take`
yield the elements of an iterable specified by another index iterable

<dl>
<dt>

**Parameters**

</dt>
<dd>

* **iterable:**  the iterable to take values from
* **indices:**  the iterable which yields the index values to take. This
    is turned into an array before taking occurs.


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

    values of the iterable picked out by the indices.


</dd>
</dl>

<dl>
<dt>

**Examples**

</dt>
<dd>

   * `take('abcdef', range(0, 6, 2))` yields `'a', 'c', 'e'`
   * `take('abcdef', [1,2,4])` yields `'b', 'c', 'e'`
   * `take('abcdef', [1,1,4])` yields `'b', 'b', 'e'`
   * `take('abcdef', [-1,1,4,2,700])` yields `undefined, 'b', 'e', 'c', undefined`
   * `take(count(10), [1,15,100])` yields `10, 24, 109`


</dd>
</dl>

<dl>
<dt>

**Notes**

</dt>
<dd>

  `take` is fastest if the iterable is an array or string, and indices is an array.
  Otherwise it falls back to a slower more general algorithm.

  You can write take algorithms that work if
  a) both parameters are infinite but indices is increasing (though this yields an
     infinite sequence)
  b) one of the parameters is finite.

 In the second case however there is no way of knowing which parameter is the finite one.
 The algorithm used here assumes the indices are finite.


</dd>
</dl>


## `product`
yields the cartesian product of the iterables

<dl>
<dt>

**Parameters**

</dt>
<dd>

...iterables: the iterables to "multiply"


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

   elements of the cartesian product of the iterables, as arrays.


</dd>
</dl>

<dl>
<dt>

**Example**

</dt>
<dd>

   * `product('ABC', [1,2])` will yield
      `['A', 1], ['A', 2], ['B', 1], ['B', 2], ['C', 1], ['C', 2]`


</dd>
</dl>

<dl>
<dt>

**Notes**

</dt>
<dd>

  All iterators in the arguments are first spread into arrays.


</dd>
</dl>


## `permutations`
yields all permutations of an iterable.

<dl>
<dt>

**Parameters**

</dt>
<dd>

* **iterable:**  the iterable to permute. If the iterable isn't an array, it is
   converted to one, so iterators are also acceptable parameters.


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

   the permutations of the iterable's elements. All elements of the iterable are
   considered unique by virtue of their different position in the iterable, so if there
   are repeated elements, the permutations may be odd looking.


</dd>
</dl>

<dl>
<dt>

**Examples**

</dt>
<dd>

  * `permutations([1,2,3])` yields
      `[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]`
  * `permutations( [1,1,1])` yields `[1,1,1]` six times, because each 1 is considered unique. When
      you pass [1,1,1] to permutatins, it effectively "sees" [1_1, 1_2, 1_3], because each 1 has
      a unique index (the subscript).


</dd>
</dl>


## `combinations`
yields all combinations of n elements from an iterable.

<dl>
<dt>

**Parameters**

</dt>
<dd>

* **iterable:**  the iterable to take subsets from. If the iterable isn't an array
     it is turned into one using the spread operator, so an iterator is also
     usable.
* **n:**  the size of the combinations


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

   all combinations of n elements from the iterable. All elements of the iterable are
   considered unique by virtue of their different position in the iterable, so if there
   are repeated elements, the combinations may be odd looking.


</dd>
</dl>

<dl>
<dt>

**Example**

</dt>
<dd>

   `combinations([1,2,3,4], 2)` yields `[1,2], [1,3], [1,4], [2,3], [2,4], [3,4]`


</dd>
</dl>


## `partitions`
yields all partitions of the iterable with given sizes
A partition is a group of subsets such that
a) they are disjoint
b) their union is the iterable
c) they have the sizes specified.

<dl>
<dt>

**Parameters**

</dt>
<dd>

* **iterable:**  the iterable to partition; think of it as a set. If the iterable isn't
    an array, it is turned into one.
* **sizes:**  an array of sizes, of partitions, which must add up to the number
    of items in the iterable.


</dd>
</dl>

<dl>
<dt>

**Yields**

</dt>
<dd>

   all partitions of the iterable. Each partition is an array of arrays, where each
   of the individual arrays is one partition.


</dd>
</dl>

<dl>
<dt>

**Example**

</dt>
<dd>

   `partitions([1,2,3,4,5], [2,2,1])` yields

    `[[1,2],[3,4],[5]], [[1,2],[3,5],[4]], [[1,2],[4,5],[3]], [[1,3],[2,4],[5]], ...`

    Each partition (e.g. `[[1,2],[3,4],[5]]`) has sets of size 2,2,1.


</dd>
</dl>

<dl>
<dt>

**Notes**

</dt>
<dd>

  All elements of the iterable are
  considered unique by virtue of their different position in the iterable, so if there
  are repeated elements, the combinations may be odd looking.


</dd>
</dl>

