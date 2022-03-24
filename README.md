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

const match = function(sourceListTranslated, destinationList){
	const diffMat = sourceListTranslated.map(a => destinationList.map(b => diff(a,b)))
	const costs = sourceListTranslated.map(a => destinationList.map(b => Math.abs(diff(a,b))))
	
	const assignement = munkres(costs)
	const cost = sum(assignement.map(([i,j]) => costs[i][j]));
	
	return {
		cost,// mandatory
		assignement,// mandatory
		diffs: assignement.map(([i,j]) => diffMat[i][j]) // custom key, we reuse it in estimate
	}
}
```

### estimate

```js
const sum = list => list.reduce((a,b) => a+b, 0);

const estimate = function({diffs}){
	const translation = sum(diffs)/diffs.length;
	return {
		translation: translation
	} // this object will be the input of transformFn
}
```

### transform

```js
const transform = function({translation}, b){
	return b + translation;
}
```
### all together

```js
const Ict = require('iterative-closest-point');

const sourceList = [1,2,3,4,5,6];
const destinationList = [8,9,10,11,12,13];

const ict = new Ict({
	estimate,
	transform,
	match
});

const {transformation, assignement, iteration} = ict.run(source,destination);

console.log(transformation)
// {translation: 7}
console.log(iteration)
// 3
// Explanation : 
// first iteration : basic matching
// second iteration : correct matching
// third iteration : not progressing
```

# Thanks

Special thanks to Gabriel Peyré and Victor Magron
