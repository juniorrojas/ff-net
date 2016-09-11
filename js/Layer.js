var svg = require("./svg");
var Neuron = require("./Neuron");

var Layer = function(neuralNet) {
	this.neuralNet = neuralNet;
	this.neurons = [];
}

var p = Layer.prototype;

p.redraw = function() {
	for (var i = 0; i < this.neurons.length; i++) {
		var neuron = this.neurons[i];
		neuron.redraw();
	}
}

p.reset = function() {
	for (var i = 0; i < this.neurons.length; i++) {
		var neuron = this.neurons[i];
		neuron.reset();
	}
}

p.addNeuron = function(bias) {
	if (bias == null) bias = 0.5;
	var neuron = new Neuron(this, bias);
	this.neurons.push(neuron);
	this.neuralNet.neurons.push(neuron);
	this.neuralNet.svgNeurons.appendChild(neuron.svgElement);
	return neuron;
}

p.getNeuronAt = function(i) {
	return this.neurons[i];
}

p.getNeuronCount = function() {
	return this.neurons.length;
}

p.getIndex = function() {
	return this.neuralNet.layers.indexOf(this);
}

Layer.newFromData = function(neuralNet, data) {
	var layer = neuralNet.addLayer();
	for (var i = 0; i < data.neurons.length; i++) {
		var neuronData = data.neurons[i];
		Neuron.newFromData(layer, data);
	}
	return layer;
}

p.toData = function() {
	var data = {};
	
	data.neurons = [];
	for (var i = 0; i < this.neurons.length; i++) {
		var neuron = this.neurons[i];
		data.neurons.push(neuron.toData());
	}
	
	return data;
}

module.exports = Layer;
