# Iterative Closest Point

Customizable Iterative-Closest-Point simple implementation in JS.

See [Iterative Closest Point](https://en.wikipedia.org/wiki/Iterative_closest_point)

## Installation

```
npm install iterative-closest-point
```

## Usage

As an example, we consider a 1d problem, to match 2 list of numbers (`sourceList` and `destinationList`), considering the translation to use.

### A diff

```js
const diff = (s,d) => d - s;
```

### match

```js
const munkres = require('munkres-js');

const transform = function ({translation}, b) {
	return b + translation;
};

const match = function ({source, destination, state}) {
	// state is {translation}
	const transformedSource = source.map(a => transform(state, a))
	const diffMat = transformedSource.map(a => destination.map(b => diff(a, b)));
	const costs = transformedSource.map(a => destination.map(b => Math.abs(diff(a, b))));

	const assignement = munkres(costs);
	const cost = sum(assignement.map(([i, j]) => costs[i][j]));
	return {
		cost, // Mandatory
		assignement, // Mandatory
		diffs: assignement.map(([i, j]) => diffMat[i][j]), // Custom key, we reuse it in updateFn
	};
};
```

### estimate

```js
const sum = list => list.reduce((a,b) => a+b, 0);

// this function estimate the state
const estimate = function ({diffs, state}) {

	if (diffs.length === 0) {
		throw (new Error('empty diffs'));
	}

	const translation = sum(diffs) / diffs.length + state.translation;
	return {
		translation,
	}; // This object will be the input of transformFn
};
```


### all together

```js

const ict = new Ict({
	init: {translation: 0}, // initialize the state
	transform,
	estimate,
	match,
	threshold: 1
});

const sourceList = [1, 2, 3, 4, 5, 6];
const destinationList = [8, 9, 10, 11, 12, 13];
const {translation, assignement, iteration, cost} = await ict.run(sourceList, destinationList);

console.log(transformation)
// {translation: 7}
console.log(iteration)
// 2
// Explanation : 
// first iteration : basic matching
// second iteration : correct matching
```

# Thanks

Special thanks to Gabriel Peyré and Victor Magron
