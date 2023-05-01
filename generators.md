# Iterators, Iterables, and Generators in Javascript.

Iteration - that is, repeating things - is a core idea in programming, performed by `for` and `while` loops. Javascript originally had the classic C-style `for`-loop:
```javascript
for (let i=0; i<10; i++) {
    // do stuff
}
```
as well as the `for...in` loop (which we won't talk about in this article). Since ES6, javascript also has the `for...of` loop, which lets you iterate over the items in a collection. For example
```javascript
for (let item of [1,2,3,'a','b','c']) {
    console.log(item)
}
```
will print out the items `1,2,3,'a','b','c'` from the array, and is simpler to write than the corresponding basic `for` loop. However, the main benefit of the `for...of` loop is that it works on any objects that are **iterables**.

## Iteratables and Iterators.

An **iterable** is an object that can be iterated over. Arrays, Sets, Strings, and Maps and all examples of iterables. But the iterable object doesn't itself do any iteration; instead, that's left to an **iterator**. An iterator is an object that is used to visit all the elements of the iterable. (The iterator and the iterable may be the same object.)  

When you pass an iterable object `X` to a `for...of` loop, the loop starts by getting the iterator object from `X`. It does this by calling `X[Symbol.iterator]()`. If `X` doesn't have such a method, it isn't iterable and the `for..of` loop throws a `TypeError: X is not iterable` exception.

The iterator object must have a method called `next()`. If it doesn't, you quickly raise another exception `TypeError: undefined is not a function`, which happens because the `for...of` loop tried to call `next()` on the iterator object and it didn't exist. The `next` method should return an object `{done, value}` every time it's called. If the iterator is finished, `done` should be `false` and `value` should be `undefined`. Otherwise `done` should be `true` and `value` is the next item in the iterable.

So, when you write the code
```javascript
for (let item of X) {
    // do stuff
}
```
and the object `X` is an iterable, what happens "under the hood" is this:
```javascript
{
    // get the iterator for X
    let X_iterator = X[Symbol.iterator]()
    while (true) {
        // get the next element
        let a = X_iterator.next()
        if (a.done) {
            break
        }
        let item = a.value
        // do stuff
    }
}
```

Thus,
1. An **iterable** is an object that has a `Symbol.iterator` method which returns an iterator for that object. An iterable can be passed to a `for...of` loop.
2. An **iterator** is an object that has a `next()` method. This method has to return an object `{done, value}` where `done` is true when the iteration is complete. When `done` is false, `value` contains the value of the next item in the iteration.

As well as being used in `for...of` loops, iterables can also be used with the spread syntax, so `[...iteratable]` will create an array holding all the elements of the iterable.

Arrays are iterables, and we can see this by calling the `Symbol.iterator` method of an array. For example:

```javascript
let a = [1,2,3],
    iterator = a[Symbol.iterator]()
// this is what happens in a for...of loop
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
```
will produce the output:
```javascript
{done: false, value:1}
{done: false, value:2}
{done: false, value:3}
{done: true, value:undefined}
```

The functions `Object.keys(obj)` and `Object.values(obj)` create iterables from any object. We can define a function `mykeys` that behaves just like `Object.keys`, in that it returns an iterable for an object's keys and values:

```javascript
function mykeys(obj) {
    return {
        [Symbol.iterator]() {
            // we need the list of keys without
            // using Object.keys
            let cursor=0,
                keys = []
            for (let k in obj) {
                keys.push(k)
            }
            // the iterator object
            return {
                next() {
                    if (cursor==keys.length) {
                        return {done:true}
                    } else {
                        return {done:false, value:keys[cursor++]}
                    }
                }
            }
        }
    }
}
```
When called, `mykeys(obj)` returns an object with a `Symbol.iterator` method, which makes that object iterable. When the `Symbol.iterator` method is called, it returns an object with a `next` method, which means the object is an iterator. With this, we could iterate over the keys of any object as follows:

```javascript
for (let k of mykeys(obj)) {
    console.log(k)
}
```
Of course, `Object.keys` is better.

## Generators.
Creating your own iteratables and iterators sometimes involves a bit of annoying bookkeeping, so **generators** were introduced as a simpler way of writing them. A generator is a special kind of function which creates an iterator. A generator function uses a special keyword `yield` rather than `return`, and is declared by a `function*` keyword instead of the usual `function`.

* When a generator is called, it creates an iterable object. The iterable object 
  uses the generator's code as the iterator.
* When a generator executes the `yield` statement, javascript packs up the yielded value  in a `{done:false, value}` object and returns it to the statement doing the iteration. 
* When a generator executes a `return` statement, or it just finishes, javascript returns a `{done:true, value:undefined}` object. 

A generator is also an iterable, because it is given a `Symbol.iterator` method that creates the iterator from the generator function definition. So you can pass generators to `for...of` loops.

## Python Generators in Javascript.

Python uses iterables and generators extensively, and has a number of built-in iterables that are quite useful. Here I rewrite some of them as generator functions in javascript.

### `range` - simple version

A `range(n)` generator returns the numbers from `0` to `n`:

```javascript
function* range(n) {
    for (let i=0; i<n; i++) {
        yield i
    }
}
```

### `range` - full version
The `range` generator in python lets you iterate over sequences with arbitrary starts and steps. For example, `range(1,5)` generates the numbers `1,2,3,4`, and `range(0,-4, -1)` generates the numbers `0,-1,-2,-3`. The numbers generated never include the last number.

```javascript
function* range(...args) {
	let start, stop, step
	switch (args.length) {
		case 1:
			[start, stop, step] = [0, ...args, 1]
			break
		case 2:
			[start, stop, step] = [...args, 1]
			break
		case 3:
			[start, stop, step] = args
			break
		default:
			throw 'range requires between 1 and 3 parameters'
	}
	if (step>0) {
		for (let i=start; i<stop; i+=step) {
			yield i
		}
	} else {
		for (let i=start; i>stop; i+=step) {
			yield i
		}
	}		
}
```

### `enumerate`
`enumerate` iterates over an iterable and returns the indices and the items in that iterable.

```javascript
function* enumerate(iterable) {
    let index=0
	for (let item of iterable) {
		yield [index++, item]
	}
}
```
Example:
```javascript
for (let [i,v] of enumerate('abcd')) {
	console.log(i,v)
}
```
This produces
```
0 a
1 b
2 c
3 d
```

### `zip`

`zip` iterates over a number of iterables in parallel, stopping when one runs out.

```javascript
function* zip(...iterables) {
	let iterators = iterables.map(i=>i[Symbol.iterator]())
	while (true) {
		let z = iterators.map(i=>i.next())
		if (z.some(a=>a.done)) {
			return
		}
		yield z.map(a=>a.value)
	}
}
```
Example:
```
console.log([...zip('abc', [1,2,3,4])])
```
will produce
```
['a',1], ['b',2], ['c',3]
```

### `count`
`count` is like `range(0, infinity)`. Note that count isn't a generator, but it returns one.

```javascript
function count(start=0, step=1) {
	return range(start, Math.sign(step)*Infinity, step)
}
```

Notice that `enumerate` could be defined as

```javascript
function* enumerate(obj) {
    yield* zip(count_forever(), obj)
}
```

### `reverse`
`reverse` just iterates over an iteratable in reverse order. Note that this has to exhaust the iterable first.

```javascript
function* reverse(iterable) {
	let arr = [...iterable]
	for (let i=arr.length-1; i>=0; i--) {
		yield arr[i]
	}
}
```
For example, `reverse([1,2,3])` yields `3,2,1`
### `cycle`
`cycle` repeats an iterable a number of times.

```javascript
function* cycle(iterable, count=-1) {
    let arr = [...iterable]
	for (let i=0; i<count; i++) {
		yield* arr
	}
}
```

### `repeat`
`repeat` repeats a single value a number of times
```javascript
function* repeat(value, count=-1) {
	for (let i=0; i<count; i++) {
		yield value
	}
}
```

### `chain`
`chain` lets you iterate over iterables in series.
```javascript
function* chain(...iterables) {
	for (let iter of iterables) {
		yield* iter
	}
}
```

### `product`
`product` creates all combinations of values from a set of iterables.
```javascript
function* product(...iterables) {
    // the iterables have to be spread if they aren't arrays or strings
    // but they can't be spread again & again in recursion
    iterables = iterables.map(i=>(Array.isArray(i)||typeof(i)=='string')?i:[...i])
    yield* _product_(...iterables)

    function _product_(...iterables) {
        if (iterables.length==1) {
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
}
```