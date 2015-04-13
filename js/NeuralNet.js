var NeuralNet;

(function () {
NeuralNet = function() {
	this.init();
}

var p = NeuralNet.prototype;
p.neurons = null;
p.links = null;
p.spikes = null;
p.input = null;
p.output = null;

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

p.reset= function(input) {
	for (var i = 0; i < this.neurons.length; i++) {
		var neuron = this.neurons[i];
		neuron.reset();
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

	return [this.output[0].activation];
}

})();
