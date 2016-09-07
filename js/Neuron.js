var svg = require("./svg");
var Color = require("./Color");

var Neuron = function(layer, bias) {
	this.layer = layer;
	this.links = [];
	this.backLinks = [];
	this.bias = bias;
	this.preactivation = 0;
	this.activation = Neuron.sigmoid(this.bias);
	this.error = 0;
	this.da = 0; // d activation
	this.dz = 0; // d preactivation
	this.db = 0; // d bias

	var svgElement = this.svgElement = svg.createElement("circle");
	svgElement.setAttribute("r", 10);
}

var p = Neuron.prototype;

Neuron.sigmoid = function(x) {
	return 1 / (1 + Math.exp(-x));
}

p.preBackward = function() {
	this.da = 0;
	for (var l = 0; l < this.links.length; l++) {
		var link = this.links[l];
		this.da += link.weight * link.dw;
	}
}

p.backward = function(mut) {
	var regularization = mut.regularization;
	
	this.dz = this.da * Neuron.sigmoid(this.preactivation) * (1 - Neuron.sigmoid(this.preactivation));
	this.db = this.dz;
	
	for (var i = 0; i < this.backLinks.length; i++) {
		var link = this.backLinks[i];
		var n0 = link.n0;
		link.dw = link.n0.activation * this.dz;
		// regularization loss = 0.5 * regularization * w^2
		link.dw += regularization * link.weight;
		mut.regularizationLoss += regularization * link.weight * link.weight;
	}
}

p.redraw = function() {
	var circle = this.svgElement;
	var position = this.getPosition();
	circle.setAttribute("cx", position.x);
	circle.setAttribute("cy", position.y);
	
	var maxVisibleBias = 5;
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

p.update = function() {
	this.preactivation = 0;
	this.preactivation += this.bias;
	for (var i = 0; i < this.backLinks.length; i++) {
		var link = this.backLinks[i];
		this.preactivation += link.weight * link.n0.activation;
	}
	this.activation = Neuron.sigmoid(this.preactivation);
}

p.reset = function() {
	this.preactivation = 0;
	this.activation = Neuron.sigmoid(this.bias);
}

p.setParameters = function(params) {
	this.bias = params.bias;
}

p.getParameters = function() {
	return {
		bias: this.bias
	};
}

p.toData = function() {
	var data = {};
	data.bias = this.bias;
	return data;
}

module.exports = Neuron;
