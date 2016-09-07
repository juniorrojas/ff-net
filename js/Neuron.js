var svg = require("./svg");
var math = require("./math");
var Color = require("./Color");

var Neuron = function(layer, bias) {
	this.layer = layer;
	this.links = [];
	this.backLinks = [];
	this.bias = bias;
	this.preActivation = 0;
	this.activation = math.sigmoid(this.bias);
	this.dActivation = 0;
	this.dPreActivation = 0;
	this.dBias = 0;
	this.isInput = false;
	this.isOutput = false;

	var svgElement = this.svgElement = svg.createElement("circle");
	svgElement.setAttribute("r", 10);
}

var p = Neuron.prototype;

p.redraw = function() {
	var circle = this.svgElement;
	var position = this.getPosition();
	circle.setAttribute("cx", position.x);
	circle.setAttribute("cy", position.y);
	
	var maxVisibleBias = 3;
	var bias = this.bias;
	var tFillColor;
	if (bias < -maxVisibleBias) bias = -maxVisibleBias;
	else if (bias > maxVisibleBias) bias = maxVisibleBias;
	tFillColor = (bias + maxVisibleBias) * 0.5 / maxVisibleBias;
	var fillColor = Color.RED.blend(Color.BLUE, tFillColor);
	var strokeColor = fillColor.blend(Color.BLACK, 0.3);
	
	circle.setAttribute("fill", fillColor.toString());
	circle.setAttribute("stroke", strokeColor.toString());
	circle.setAttribute("stroke-width", 2);
}

p.getIndex = function() {
	return this.layer.neurons.indexOf(this);
}

p.getPosition = function() {
	var neuronCount = this.layer.neurons.length;
	var cy = 120;
	
	var x = this.layer.getIndex() * 50;
	
	var y;
	if (neuronCount == 0) {
		y = cy;
	} else {
		y = cy + (this.getIndex() - neuronCount / 2) * 40;
	}
	
	return {
		x: x,
		y: y
	};
}

p.forward = function() {
	this.preActivation = 0;
	this.preActivation += this.bias;
	for (var i = 0; i < this.backLinks.length; i++) {
		var link = this.backLinks[i];
		this.preActivation += link.weight * link.n0.activation;
	}
	this.activation = math.sigmoid(this.preActivation);
}

p.backward = function(regularization) {
	var regularizationError = 0;
	
	for (var i = 0; i < this.links.length; i++) {
		var link = this.links[i];
		this.dActivation += link.weight * link.dWeight;
	}
	
	this.dPreActivation = this.dActivation * math.dSigmoid(this.preActivation);
	this.dBias = this.dPreActivation;
	
	for (var i = 0; i < this.backLinks.length; i++) {
		var link = this.backLinks[i];
		regularizationError += link.backward(regularization);
	}
	
	return regularizationError;
}

p.applyGradient = function(learningRate) {
	this.bias -= learningRate * this.dBias;
}

p.reset = function() {
	this.preActivation = 0;
	this.activation = math.sigmoid(this.bias);
	this.dActivation = 0;
	this.dPreActivation = 0;
	this.dBias = 0;
}

Neuron.newFromData = function(layer, data) {
	layer.addNeuron(data.bias);
}

p.toData = function() {
	var data = {};
	data.bias = this.bias;
	return data;
}

module.exports = Neuron;
