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
		maxIteration = 10,
		logger = defaultLogger,
	}) {
		this.match = match;
		this.estimate = estimate;
		this.threshold = threshold;
		this.maxIteration = maxIteration;
		this.init = init;
		this.logger = logger;
	}

	run(source, destination) {
		return this.recursiveRun({
			source, destination, iteration: 0, cost: huge, state: this.init,
		});
	}

	recursiveRun({source, destination, iteration, cost, state, bestState = null, bestCost = null, bestIteration = null}) {
		if ((typeof (this.threshold) === 'number' && cost < this.threshold) || (typeof (this.maxIteration) === 'number' && iteration >= this.maxIteration)) {
			return Object.assign({iteration, cost: bestCost, bestIteration}, bestState);
		}

		return this.iter({source, destination, state, iteration, bestState: bestState || state}).then(iterOutput => {
			const newCost = iterOutput.cost;
			const newState = Object.assign({}, state, iterOutput);

			if (bestCost === null || newCost < bestCost) {
				bestCost = newCost;
				bestIteration = iteration;
				bestState = newState;
				this.logger.debug(`At iteration ${iteration} best cost reached : ${newCost}`);
			}

			return this.recursiveRun({source, destination, iteration: iteration + 1, cost: newCost, state: newState, bestState, bestIteration, bestCost});
		});
	}

	iter({source, destination, state, iteration, bestState}) {
		return Promise.resolve(this.match({source, destination, state, bestState, logger: this.logger, iteration})).then(matchOutput => {
			const {assignement, cost} = matchOutput;
			this.logger.debug(`Matching ${iteration} cost: ${cost}`);
			const estimateInput = Object.assign({source, destination, state, bestState, logger: this.logger, iteration}, matchOutput);
			return Promise.resolve(this.estimate(estimateInput)).then(transformation => Object.assign({cost, assignement}, transformation));
		});
	}
}

module.exports = Ict;
