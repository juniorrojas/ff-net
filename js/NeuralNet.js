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

})();
