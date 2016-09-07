var svg = require("./svg");
var Neuron = require("./Neuron");
var Link = require("./Link");
var Layer = require("./Layer");

var NeuralNet = function() {
	this.neurons = [];
	this.links = [];
	this.layers = [];

	this.svgElement = svg.createElement("g");
	
	this.svgLinks = svg.createElement("g");
	this.svgElement.appendChild(this.svgLinks);
	
	this.svgNeurons = svg.createElement("g");
	this.svgElement.appendChild(this.svgNeurons);
}

var p = NeuralNet.prototype;

p.addLayer = function(neuronCount) {
	if (neuronCount == null) neuronCount = 0;	
	
	var layer = new Layer(this);
	this.layers.push(layer);
	this.svgNeurons.appendChild(layer.svgElement);
	
	for (var i = 0; i < neuronCount; i++) {
		var neuron = layer.addNeuron();
	}
	
	return layer;
}

p.addFullyConnectedLayer = function(neuronCount) {
	var l0 = this.layers[this.layers.length - 1];
	this.addLayer(neuronCount);
	var lf = this.layers[this.layers.length - 1];
	for (var i = 0; i < l0.neurons.length; i++) {
		var n0 = l0.neurons[i];
		for (var j = 0; j < lf.neurons.length; j++) {
			var nf = lf.neurons[j];
			this.addLink(n0, nf);
		}
	}
}

p.addLink = function(n0, nf, weight) {
	var link = new Link(this, n0, nf, weight);
	n0.links.push(link);
	nf.backLinks.push(link);
	this.links.push(link);
	this.svgLinks.appendChild(link.svgElement);
	return link;
}

p.redraw = function() {
	for (var i = 0; i < this.layers.length; i++) {
		var layer = this.layers[i];
		layer.redraw();
	}
	for (var i = 0; i < this.links.length; i++) {
		var link = this.links[i];
		link.redraw();
	}
}

p.reset = function(input) {
	for (var i = 0; i < this.layers.length; i++) {
		var layer = this.layers[i];
		layer.reset();
	}
}

p.randomizeParameters = function() {
	for (var i = 0; i < this.links.length; i++) {
		var link = this.links[i];
		var weight = 2 + Math.random() * 4;
		if (Math.random() <= 0.5) weight *= -1;
		link.weight = weight;
	}
	
	for (var i = 0; i < this.neurons.length; i++) {
		var neuron = this.neurons[i];
		var bias = 1 + Math.random() * 2;
		if (Math.random() <= 0.5) bias *= -1;
		neuron.bias = bias;
	}
}

p.forward = function(input) {
	for (var i = 1; i < this.layers.length; i++) {
		var layer = this.layers[i];
		for (var j = 0; j < layer.neurons.length; j++) {
			var neuron = layer.neurons[j];
			neuron.forward();
		}
	}
}

p.backward = function(learningRate, regularization) {
	regularizationError = 0;
	
	for (var i = this.layers.length - 1; i >= 0; i--) {
		var layer = this.layers[i];
		for (var j = 0; j < layer.neurons.length; j++) {
			var neuron = layer.neurons[j];
			regularizationError += neuron.backward(regularization);
		}
	}
	
	this.applyGradient(learningRate);
	
	return regularizationError;
}

p.applyGradient = function(learningRate) {
	for (var i = 0; i < this.links.length; i++) {
		var link = this.links[i];
		link.applyGradient(learningRate);
	}
	
	for (var i = 1; i < this.layers.length; i++) {
		var layer = this.layers[i];
		for (var j = 0; j < layer.neurons.length; j++) {
			var neuron = layer.neurons[j];
			neuron.applyGradient(learningRate);
		}
	}
}

NeuralNet.newFromData = function(data) {
	var neuralNet = new NeuralNet();
	
	for (var i = 0; i < data.layers.length; i++) {
		var layerData = data.layers[i];
		Layer.newFromData(neuralNet, layerData);
	}
	
	for (var i = 0; i < data.links.length; i++) {
		var linkData = data.links[i];
		Link.newFromData(neuralNet, linkData);
	}
	
	return neuralNet;
}

p.toData = function() {
	var data = {};
	
	data.layers = [];
	for (var i = 0; i < this.layers.length; i++) {
		var layer = this.layers[i];
		data.layers.push(layer.toData());
	}
	
	data.links = [];
	for (var i = 0; i < this.links.length; i++) {
		var link = this.links[i];
		data.links.push(link.toData());
	}
	
	return data;
}

module.exports = NeuralNet;
