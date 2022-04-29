const huge = 1e10;

const defaultLogger = {
	error: console.log,
	warn: console.log,
	info: console.log,
	debug() {},
};

class Ict {
	constructor({
		match,
		estimate,
		init = null,
		threshold = null,
		maxIter = 10,
		logger = defaultLogger,
	}) {
		this.match = match;
		this.estimate = estimate;
		this.threshold = threshold;
		this.maxIter = maxIter;
		this.init = init;
		this.logger = logger;
	}

	run(source, destination) {
		return this.recursiveRun({
			source, destination, iteration: 0, cost: huge, state: this.init,
		});
	}

	recursiveRun({source, destination, iteration, cost, state}) {
		if ((typeof (this.threshold) === 'number' && cost < this.threshold) || (typeof (this.maxIter) === 'number' && iteration >= this.maxIter)) {
			return Object.assign({iteration}, state);
		}

		return this.iter({source, destination, state, iteration}).then(iterOutput => {
			const newCost = iterOutput.cost;
			this.logger.debug(`${iteration} cost: ${newCost}`);
			return this.recursiveRun({source, destination, iteration: iteration + 1, cost: newCost, state: Object.assign({}, state, iterOutput)});
		});
	}

	iter({source, destination, state, iteration}) {
		return Promise.resolve(this.match({source, destination, state, logger: this.logger, iteration})).then(matchOutput => {
			const {assignement, cost} = matchOutput;
			const estimateInput = Object.assign({source, destination, state, logger: this.logger, iteration}, matchOutput);
			return Promise.resolve(this.estimate(estimateInput)).then(transformation => Object.assign({cost, assignement}, transformation));
		});
	}
}

module.exports = Ict;
