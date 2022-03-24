const uniq = array => array.filter((item, index) => array.indexOf(item) === index);

const defaultTransformationReducer = (a, b) => {
	if (typeof (a) === 'object' && !Array.isArray(a)) {
		const normB = b || {};
		const keys = uniq(Object.keys(a).concat(Object.keys(normB)));
		const out = {};
		for (const k of keys) {
			out[k] = defaultTransformationReducer(a[k], normB[k]);
		}

		return out;
	}

	if (typeof (a) === 'number') {
		const normB = b || 0;
		return a + normB;
	}

	throw (new Error('iterative-closest-point: transformation type is not implemented, please consider using opts.reduceTransformation argument'));
};

class Ict {
	constructor({
		match,
		transform,
		estimate,
		threshold = null,
		maxIter = null,
		reduceTransformation = null,
	}) {
		this.match = match;
		this.transform = transform;
		this.estimate = estimate;
		this.threshold = threshold;
		this.maxIter = maxIter;
		this.reduceTransformation = reduceTransformation || defaultTransformationReducer;
	}

	run(source, destination) {
		let lastCost = null;
		let cost = null;
		let iteration = 0;
		let transformedSource = source;
		let output = null;
		let transformation = null;
		while (
			(lastCost === null || lastCost > cost)
			&& (typeof (this.threshold) !== 'number' || cost > this.threshold)
			&& (typeof (this.maxIter) !== 'number' || iteration < this.maxIter)
		) {
			const iterOutput = this.iter({transformedSource, destination});

			transformedSource = iterOutput.transformedSource;
			transformation = this.reduceTransformation(iterOutput.transformation, transformation);
			iteration++;
			lastCost = cost;
			cost = iterOutput.cost;
			output = iterOutput;
		}

		return Object.assign({iteration}, output, {transformation});
	}

	iter({transformedSource, destination}) {
		const matchOutput = this.match(transformedSource, destination);
		const {assignement, cost} = matchOutput;
		const transformation2 = this.estimate(matchOutput);
		const transformedSource2 = transformedSource.map(s => this.transform(transformation2, s));

		return Object.assign({}, {cost, assignement, transformation: transformation2}, {transformedSource: transformedSource2});
	}
}

module.exports = Ict;
