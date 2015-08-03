var Neuron = require("./Neuron");
var Link = require("./Link");
var Spike = require("./Spike");

var NeuralNet;

NeuralNet = function() {
	this.init();
}

var p = NeuralNet.prototype;

p.init = function() {
	this.neurons = [];
	this.links = [];
	this.spikes = [];
	this.input = [];
	this.output = [];
}

p.addNeuron = function(pos, bias) {
	var neuron = new Neuron(pos, bias);
	this.neurons.push(neuron);
	return neuron;
}

p.addLink = function(n0, nf, weight) {
	var link = new Link(n0, nf, weight);
	n0.links.push(link);
	nf.backLinks.push(link);
	var spike = new Spike(link);
	link.spike = spike;
	this.links.push(link);
	this.spikes.push(spike);
	return link;
}

p.reset = function(input) {
	for (var i = 0; i < this.neurons.length; i++) {
		var neuron = this.neurons[i];
		neuron.reset();
	}
}

p.randomizeWeights = function() {
	for (var i = 0; i < this.links.length; i++) {
		var link = this.links[i];
		var weight = 2 + Math.random() * 4;
		if (Math.random() <= 0.5) weight *= -1;
		link.weight = weight;
	}
}

p.computeOutput = function(input) {
	var spikingNeurons = [];

	for (var i = 0; i < this.input.length; i++) {
		var neuron = this.input[i];
		neuron.activation = input[i];
		for (var j = 0; j < neuron.links.length; j++) {
			var nf = neuron.links[j].nf;
			if (spikingNeurons.indexOf(nf) == -1) {
				spikingNeurons.push(nf);
			}
		}
	}

	while (spikingNeurons.length > 0) {
		var newSpikingNeurons = [];
		for (var i = 0; i < spikingNeurons.length; i++) {
			var neuron = spikingNeurons[i];
			neuron.update();
			for (var j = 0; j < neuron.links.length; j++) {
				var nf = neuron.links[j].nf;
				if (newSpikingNeurons.indexOf(nf) == -1){
					newSpikingNeurons.push(nf);
				}
			}
		}
		spikingNeurons = newSpikingNeurons;
	}

	var output = [];
	for (var i = 0; i< this.output.length; i++) {
		output.push(this.output[i].activation);
	}

	return output;
}

p.train = function(trainingSet, learningRate, regularization) {
	var dataLoss = 0;
	var regularizationLoss = 0;

	for (var k = trainingSet.length - 1; k >= 0; k--) {
		var sample = trainingSet[k];
		var output = this.computeOutput(sample.x);
		var d = sample.y - output[0];
		// data loss = 0.5 * d^2
		dataLoss += 0.5 * d * d;
		var neuron = this.output[0];
		neuron.da = -d; // a = output[0]
		neuron.dz = neuron.da * Neuron.sigmoid(neuron.preactivation) * (1 - Neuron.sigmoid(neuron.preactivation));

		neuron.db = 1 * neuron.dz;
		for (var l = 0; l < neuron.backLinks.length; l++) {
			var link = neuron.backLinks[l];
			link.dw = link.n0.activation * neuron.dz;
			// regularization loss = 0.5 * regularization * w^2
			link.dw += regularization * link.weight;
			regularizationLoss += regularization * link.weight * link.weight;
		}

		var backNeurons = [];
		for (var i = 0; i < neuron.backLinks.length; i++) {
			var n0 = neuron.backLinks[i].n0;
			if (backNeurons.indexOf(n0) == -1) backNeurons.push(n0);
		}

		while (backNeurons.length > 0) {
			var newBackNeurons = [];

			for (var i = 0; i < backNeurons.length; i++) {
				var neuron = backNeurons[i];

				neuron.da = 0;
				for (var l = 0; l < neuron.links.length; l++) {
					var link = neuron.links[l];
					neuron.da += link.weight * link.dw;
				}

				neuron.dz = neuron.da * Neuron.sigmoid(neuron.preactivation) * (1 - Neuron.sigmoid(neuron.preactivation));;
				neuron.db = 1 * neuron.dz;
				for (var l = 0; l < neuron.backLinks.length; l++) {
					var link = neuron.backLinks[l];
					var n0 = link.n0;
					link.dw = link.n0.activation * neuron.dz;
					// regularization loss = 0.5 * regularization * w^2
					link.dw += regularization * link.weight;
					regularizationLoss += regularization * link.weight * link.weight;

					if (newBackNeurons.indexOf(n0) == -1) newBackNeurons.push(n0);
				}
			}

			backNeurons = newBackNeurons;
		}

		// at this point we have computed the gradient,
		// we have to update the weights and biases
		for (var i = 0; i < this.links.length; i++) {
			var link = this.links[i];
			link.weight -= learningRate * link.dw;
		}

		for (var i = 0; i < this.neurons.length; i++) {
			var neuron = this.neurons[i];
			neuron.bias -= learningRate * neuron.db;
		}

		for (var i = 0; i < this.input.length; i++) {
			// input neurons have always 0 bias
			var neuron = this.input[i];
			neuron.bias = 0;
		}

		this.reset();
	}

	return {
		dataLoss: dataLoss,
		regularizationLoss: regularizationLoss
	};
}

module.exports = NeuralNet;
