# Iterators, Iterables, and Generators in Javascript.

Iteration - that is, repeating things - is a core idea in programming, performed by `for` and `while` loops. Javascript originally had the classic C-style `for`-loop:
```javascript
for (let i=0; i<10; i++) {
    // do stuff
}
```
as well as the `for...in` loop (for iterating over the keys of an object). Since ES6, javascript also has the `for...of` loop, which lets you iterate over the items in a collection. For example
```javascript
for (let item of [1,2,3,'a','b','c']) {
    console.log(item)
}
```
will print out the items `1,2,3,'a','b','c'` from the array, and is simpler to write than the corresponding basic `for` loop. However, the main benefit of the `for...of` loop is that it works on any objects that are **iterables**.

## Iteratables and Iterators.

An **iterable** is an object that can be iterated over. Arrays, Sets, Strings, and Maps and all examples of iterables. But the iterable object doesn't itself do any iteration; instead, that's left to an **iterator**. An iterator is an object that is used to visit all the elements of the iterable. (The iterator and the iterable may be the same object.)  

When you pass an iterable object `X` to a `for...of` loop, the loop starts by asking `X` to supply a suitable iterator object. It does this by calling `X[Symbol.iterator]()`. If `X` doesn't have such a method, it isn't iterable and the `for..of` loop throws a `TypeError: X is not iterable` exception.

All iterator objects must have a method called `next()`. If it doesn't, you quickly raise another exception `TypeError: undefined is not a function`, which happens because the `for...of` loop tried to call `next()` on the iterator object and it didn't exist. The `next` method should return an object `{done, value}` every time it's called. If the iterator is finished, `done` should be `false` and `value` should be `undefined`. Otherwise `done` should be `true` and `value` is the next item in the iterable.

So, when you write the code
```javascript
for (let item of X) {
    // do stuff with item
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
        // do stuff with item
    }
}
```

Thus,
1. An **iterable** is an object that has a `Symbol.iterator` method which returns an iterator for that object. An iterable can be passed to a `for...of` loop.
2. An **iterator** is an object that has a `next()` method. This method has to return an object `{done, value}` where `done` is true when the iteration is complete. When `done` is false, `value` contains the value of the next item in the iteration.

These rules are **protocols** - that is, behaviour that is agreed upon. There are no iterator or iterable types, merelty objects that satisfy the protocols.

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

## Generators.
It's easy enough to create your own iterable and iterator objects. An iterable is simply an object that has a `[Symbol.iterator]` method, which when called returns an iterator. 

However, creating your own iterator objects sometimes involves a bit of annoying bookkeeping, so **generators** were introduced as a simpler way of writing them. A generator is a special kind of function which creates an iterator. A generator function uses a special keyword `yield` rather than `return`, and is declared by a `function*` keyword instead of the usual `function`.

* When a generator executes the `yield` statement, javascript packs up the yielded value  in a `{done:false, value}` object and returns it to the statement doing the iteration. 
* When a generator executes a `return` statement, or it just finishes, javascript returns a `{done:true, value:undefined}` object. 

Although a generator looks like a function, it's actually an iterator object (functions are objects so that's no big deal). A generator is also an iterable, because it is given a `Symbol.iterator` method that creates the iterator from the generator function definition. So you can pass generators to `for...of` loops.


Iterables often return a generator when their `Symbol.iterator` method is called.

```javascript
function* countup(n) {
    for (let i=0; i<n; i++) {
        yield i
    }
}
```

```javascript
class Countup {
    constructor(n) {
        this.i = 0
        this.n = n
    }
    next() {
        if (i>=n) {
            return {done:true}
        } else {
            return {done:false, value:i++}
        }
    }
    [Symbol.iterator]() {
        return this
    }
}
```



