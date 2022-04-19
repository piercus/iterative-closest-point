const test = require('ava');
const munkres = require('munkres-js');
const Ict = require('..');

const diff = (s, d) => d - s;

const transform = function ({translation}, b) {
	return b + translation;
};

const match = function ({source, destination, state}) {
	// Init is {translation}
	const transformedSource = source.map(a => transform(state, a));
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

const sum = list => list.reduce((a, b) => a + b, 0);

const estimate = function ({diffs, state}) {
	if (diffs.length === 0) {
		throw (new Error('empty diffs'));
	}

	const translation = (sum(diffs) / diffs.length) + state.translation;
	return {
		translation,
	}; // This object will be the input of transformFn
};

test('Ict simple README', async t => {
	const ict = new Ict({
		init: {translation: 0},
		transform,
		estimate,
		match,
		threshold: 1,
	});
	const sourceList = [1, 2, 3, 4, 5, 6];
	const destinationList = [8, 9, 10, 11, 12, 13];
	const {translation, assignement, iteration, cost} = await ict.run(sourceList, destinationList);
	t.is(cost, 0);
	t.is(translation, 7);
	t.is(JSON.stringify(assignement), JSON.stringify([[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]));
	// First iteration : basic matching
	// second iteration : correct matching
	// third iteration : not progressing
	t.is(iteration, 2);
});

