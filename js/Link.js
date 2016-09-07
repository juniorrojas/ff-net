var svg = require("./svg");
var Color = require("./Color");

var Link = function(neuralNet, n0, nf, weight) {
	this.neuralNet = neuralNet;
	this.n0 = n0;
	this.nf = nf;
	
	if (this.n0.layer.getIndex() + 1 != this.nf.layer.getIndex()) {
		throw "Cannot connect neurons from non-consecutive layers";
	}
	
	if (weight == null) this.weight = 1;
	else this.weight = weight;
	this.dWeight = 0;

	this.svgElement = svg.createElement("path");
	this.redraw();
}

var p = Link.prototype;

p.redraw = function() {
	var path = this.svgElement;
	var p0 = this.n0.getPosition();
	var pf = this.nf.getPosition();
	path.setAttribute(
		"d",
		"M" + p0.x + " " + p0.y + " " +
		"L" + pf.x + " " + pf.y
	);
	var width = 14 * Math.min(1, Math.abs(this.weight) / 10);
	path.setAttribute("stroke-width", width);
	var color;
	if (this.weight < 0) color = Color.RED;
	else color = Color.BLUE;
	path.setAttribute("stroke-opacity", 0.4);
	path.setAttribute("stroke", color);
}

p.backward = function(regularization) {
	var regularizationError = 0;
	this.dWeight = this.n0.activation * this.nf.dPreActivation;
	// regularization loss = 0.5 * regularization * w^2
	this.dWeight += regularization * this.weight;
	regularizationError += regularization * this.weight * this.weight;
	return regularizationError;
}

p.applyGradient = function(learningRate) {
	this.weight -= learningRate * this.dWeight;
}

Link.newFromData = function(neuralNet, data) {
	var weight = data.weight;
	var n0 = neuralNet.layers[data.n0[0]].neurons[data.n0[1]];
	var nf = neuralNet.layers[data.nf[0]].neurons[data.nf[1]];
	var link = neuralNet.addLink(n0, nf, weight);
	return link;
}

p.toData = function() {
	var data = {};
	data.n0 = [
		this.n0.layer.getIndex(),
		this.n0.getIndex()
	];
	data.nf = [
		this.nf.layer.getIndex(),
		this.nf.getIndex()
	];
	data.weight = this.weight;
	return data;
}

module.exports = Link;
