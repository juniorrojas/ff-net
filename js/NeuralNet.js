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
		this.neurons.push(neuron);
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

p.randomizeWeights = function() {
	for (var i = 0; i < this.links.length; i++) {
		var link = this.links[i];
		var weight = 2 + Math.random() * 4;
		if (Math.random() <= 0.5) weight *= -1;
		link.weight = weight;
	}
	for (var i = 0; i < this.neurons.length; i++) {
		var neuron = this.neurons[i];
		var bias = 1.5 - Math.random() * 3;
		neuron.bias = bias;
	}
}

p.setParameters = function(parameters) {
	for (var i = 0; i < parameters.neurons.length; i++) {
		this.neurons[i].setParameters(parameters.neurons[i]);
	}
	for (var i = 0; i < parameters.links.length; i++) {
		var link = this.links[i];
		link.setParameters(parameters.links[i]);
	}
}

p.toData = function() {
	var data = {};
	data.layers = [];
	for (var i = 0; i < this.layers.length; i++) {
		var layer = this.layers[i];
		data.layers.push(layer.toData());
	}
	return data;
}

p.getParameters = function() {
	var paramNeurons = [];
	for (var i = 0; i < this.neurons.length; i++) {
		paramNeurons.push(this.neurons[i].getParameters());
	}
	var paramLinks = [];
	for (var i = 0; i < this.links.length; i++) {
		paramLinks.push(this.links[i].getParameters());
	}
	return {
		neurons: paramNeurons,
		links: paramLinks
	};
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
	var dataLoss = 0;
	var mut = {
		regularization: regularization,
		regularizationLoss: 0
	};
	
	for (var i = this.layers.length - 1; i >= 0; i--) {
		var layer = this.layers[i];
		for (var j = 0; j < layer.neurons.length; j++) {
			var neuron = layer.neurons[j];
			if (i != this.layers.length - 1) neuron.preBackward();
			neuron.backward(mut);
		}
	}
	
	this.applyGradients(learningRate);

	return {
		dataLoss: dataLoss,
		regularizationLoss: mut.regularizationLoss
	};
}

p.applyGradients = function(learningRate) {
	for (var i = 0; i < this.links.length; i++) {
		var link = this.links[i];
		link.weight -= learningRate * link.dw;
	}

	for (var i = 0; i < this.neurons.length; i++) {
		var neuron = this.neurons[i];
		neuron.bias -= learningRate * neuron.db;
	}

	var inputLayer = this.layers[this.layers.length - 1];
	for (var i = 0; i < inputLayer.neurons.length; i++) {
		// input neurons have always 0 bias
		var neuron = inputLayer.neurons[i];
		neuron.bias = 0;
	}
}

module.exports = NeuralNet;
