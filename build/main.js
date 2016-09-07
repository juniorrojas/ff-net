(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// r, g, b, a are numbers between 0 and 1
var Color = function(r, g, b, a) {
	if (a == null) a = 1;
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

Color.WHITE = new Color(1, 1, 1);
Color.BLACK = new Color(0, 0, 0);

Color.RED = new Color(226 / 255, 86 / 255, 86 / 255);
Color.BLUE = new Color(135 / 255, 173 / 255, 236 / 255);

Color.LIGHT_BLUE = new Color(186 / 255, 224 / 255, 251 / 255);
Color.LIGHT_RED = new Color(252 / 255, 163 / 255, 163 / 255);

var p = Color.prototype;

// t = 1 means replace this with color c
p.blend = function(c, t) {
	return new Color(
		this.r * (1 - t) + c.r * t,
		this.g * (1 - t) + c.g * t,
		this.b * (1 - t) + c.b * t
	);
}

p.toString = function() {
	return "rgba(" +
		Math.floor(255 * this.r) + ", " +
		Math.floor(255 * this.g) + ", " +
		Math.floor(255 * this.b) + ", " +
		this.a
		+ ")";
}

module.exports = Color;
},{}],2:[function(require,module,exports){
var math = require("./math");

var ControlPanel = function(neuralNet, controllableParameters) {
	var div = this.domElement = document.createElement("div");
	div.className = "control-panel";
	
	this.rows = [];
	this.rowsByLabel = {};
	var row;
	
	row = this.addRow("full");
	var btnRandomize = document.createElement("div");
	btnRandomize.innerText = "randomize network parameters";
	btnRandomize.className = "btn";
	row.cells[0].appendChild(btnRandomize);
	btnRandomize.addEventListener("click", function() {
		neuralNet.randomizeParameters();
	});
	
	row = this.addRow("slider", "learning rate");
	row.control.value = controllableParameters.learningRate * 100;
	row.control.addEventListener("change", function() {
		controllableParameters.learningRate = this.value / 100;
	}.bind(row.control));
	
	row = this.addRow("slider", "regularization");
	row.control.value = controllableParameters.regularization * 1000000;
	row.control.addEventListener("change", function() {
		controllableParameters.learningRate = this.value / 1000000;
	}.bind(row.control));
	
	row = this.addRow("text", "total error");
	row = this.addRow("text", "data error");
	row = this.addRow("text", "regularization error");
}

var p = ControlPanel.prototype;

p.addCell = function(row) {
	cell = document.createElement("div");
	cell.className = "control-cell";
	row.appendChild(cell);
	row.cells.push(cell);
	return cell;
}

p.addRow = function(type, label) {
	var row = document.createElement("div");
	row.cells = [];
	row.className = "control-row";
	this.domElement.appendChild(row);
	this.rows.push(row);
	this.rowsByLabel[label] = row;
	
	var cell;
	
	if (type == "full") {
		cell = document.createElement("div");
		cell.className = "control-cell-full";
		row.appendChild(cell);
		row.cells.push(cell);
	} else {
		cell = this.addCell(row);
		cell.innerText = label;
		
		cell = this.addCell(row);
		var control;
		switch (type) {
			case "slider":
				control = document.createElement("input");
				control.type = "range";
				break;
			case "text":
				control = cell;
				break;
				break;
		}
		if (control != cell && control != null) cell.appendChild(control);
		
		row.control = control;
	}
	
	return row;
}

p.update = function(data) {
	this.rowsByLabel["total error"].control.innerText =
		math.round(data.totalError, 5);
	this.rowsByLabel["data error"].control.innerText =
		math.round(data.dataError, 5);
	this.rowsByLabel["regularization error"].control.innerText =
		math.round(data.regularizationError, 5);
}

module.exports = ControlPanel;
},{"./math":11}],3:[function(require,module,exports){
var Color = require("./Color");
var DataPoint = require("./DataPoint");

var DataCanvas = function() {
	this.dataPoints = [];
	var canvas = this.domElement = document.createElement("canvas");
	canvas.width = 250;
	canvas.height = 250;
	canvas.style.border = "1px solid black";
	this.ctx = canvas.getContext("2d");
	
	this.width = 50;
	this.height = 50;
	this.pixelColors = [];
	for (var i = 0; i < this.width; i++) {
		this.pixelColors.push([]);
		for (var j = 0; j < this.height; j++) {
			this.pixelColors[i].push(0);
		}
	}
}

var p = DataCanvas.prototype;

p.addDataPoint = function(x, y, label) {
	this.dataPoints.push(new DataPoint(this, x, y, label));
}

p.redraw = function(classify) {
	var ctx = this.ctx;
	var canvas = this.domElement;
	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;
	
	var width = this.width;
	var height = this.height;
	
	for (var i = 0; i < width; i++) {
		for (var j = 0; j < height; j++) {
			var label = classify(i / width, j / height);
			var color = Color.LIGHT_RED.blend(Color.LIGHT_BLUE, label);
			this.pixelColors[i][j] = color;
		}
	}

	var fWidth = canvasWidth / width;
	var fHeight = canvasHeight / height;
	var canvasImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	for (var i = 0; i < canvasImageData.data.length / 4; i++) {
		var y = Math.floor(i / canvasWidth);
		var x = i % canvasWidth;
		var ii = Math.floor(x / fWidth);
		var jj = Math.floor(y / fHeight);
		var color = this.pixelColors[ii][jj];
		canvasImageData.data[4 * i] = Math.round(color.r * 255);
		canvasImageData.data[4 * i + 1] = Math.round(color.g * 255);
		canvasImageData.data[4 * i + 2] = Math.round(color.b * 255);
		canvasImageData.data[4 * i + 3] = 255;
	}
	ctx.putImageData(canvasImageData, 0, 0);
	
	for (var i = 0; i < this.dataPoints.length; i++) {
		var dataPoint = this.dataPoints[i];
		dataPoint.redraw();
	}
}

DataCanvas.newFromData = function(data) {
	var dataCanvas = new DataCanvas();
	for (var i = 0; i < data.length; i++) {
		var item = data[i];
		dataCanvas.addDataPoint(item.x[0], item.x[1], item.y);
	}
	return dataCanvas;
}

module.exports = DataCanvas;
},{"./Color":1,"./DataPoint":4}],4:[function(require,module,exports){
var Color = require("./Color");

var DataPoint = function(canvas, x, y, label) {
	this.canvas = canvas;
	this.x = x;
	this.y = y;
	this.label = label;
}

var p = DataPoint.prototype;

p.redraw = function() {
	var ctx = this.canvas.ctx;
	var width = this.canvas.domElement.width;
	var height = this.canvas.domElement.height;
	
	var fillColor;
	if (this.label == 0) fillColor = Color.RED;
	else fillColor = Color.BLUE;
	var strokeColor = fillColor.blend(Color.BLACK, 0.6);
	
	ctx.beginPath();
	ctx.fillStyle = fillColor.toString();
	ctx.strokeStyle = strokeColor.toString();
	ctx.arc(
		this.x * width, this.y * height,
		5,
		0, 2 * Math.PI
	);
	ctx.fill();
	ctx.stroke();
}

module.exports = DataPoint;
},{"./Color":1}],5:[function(require,module,exports){
var svg = require("./svg");
var Neuron = require("./Neuron");

var Layer = function(neuralNet) {
	this.neuralNet = neuralNet;
	this.neurons = [];
	this.svgElement = svg.createElement("g");
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
	this.svgElement.appendChild(neuron.svgElement);
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

},{"./Neuron":8,"./svg":12}],6:[function(require,module,exports){
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

},{"./Color":1,"./svg":12}],7:[function(require,module,exports){
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

p.randomizeParameters = function() {
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

},{"./Layer":5,"./Link":6,"./Neuron":8,"./svg":12}],8:[function(require,module,exports){
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

},{"./Color":1,"./math":11,"./svg":12}],9:[function(require,module,exports){
var data = {};

data.trainingSet = [
	{x: [0.08, 0.24], y: 1},
	{x: [0.2, 0.27], y: 1},
	{x: [0.05, 0.30], y: 1},
	{x: [0.1, 0.1], y: 1},
	{x: [0.4, 0.4], y: 0},
	{x: [0.6, 0.4], y: 0},
	{x: [0.65, 0.7], y: 0},
	{x: [0.7, 0.3], y: 0},
	{x: [0.35, 0.65], y: 0},
	{x: [0.3, 0.5], y: 0},
	{x: [0.7, 0.5], y: 0},
	{x: [0.75, 0.55], y: 0},
	{x: [0.7, 0.6], y: 0},
	{x: [0.65, 0.34], y: 0},
	{x: [0.8, 0.65], y: 0},
	{x: [0.5, 0.7], y: 0},
	{x: [0.5, 0.66], y: 0},
	{x: [0.56, 0.66], y: 0},
	{x: [0.46, 0.36], y: 0},
	{x: [0.46, 0.26], y: 0},
	{x: [0.36, 0.26], y: 0},
	{x: [0.26, 0.36], y: 0},
	{x: [0.56, 0.28], y: 0},
	{x: [0.33, 0.54], y: 0},
	{x: [0.23, 0.52], y: 0},
	{x: [0.26, 0.16], y: 1},
	{x: [0.06, 0.46], y: 1},
	{x: [0.13, 0.66], y: 1},
	{x: [0.2, 0.8], y: 1},
	{x: [0.5, 0.5], y: 1},
	{x: [0.45, 0.5], y: 1},
	{x: [0.5, 0.45], y: 1},
	{x: [0.45, 0.45], y: 1},
	{x: [0.55, 0.55], y: 1},
	{x: [0.5, 0.55], y: 1},
	{x: [0.2, 0.8], y: 1},
	{x: [0.5, 0.2], y: 1},
	{x: [0.4, 0.1], y: 1},
	{x: [0.6, 0.1], y: 1},
	{x: [0.75, 0.15], y: 1},
	{x: [0.75, 0.15], y: 1},
	{x: [0.88, 0.22], y: 1},
	{x: [0.9, 0.35], y: 1},
	{x: [0.90, 0.49], y: 1},
	{x: [0.88, 0.62], y: 1},
	{x: [0.9, 0.9], y: 1},
	{x: [0.9, 0.8], y: 1},
	{x: [0.75, 0.85], y: 1},
	{x: [0.55, 0.92], y: 1},
	{x: [0.6, 0.95], y: 1},
	{x: [0.06, 0.57], y: 1},
	{x: [0.09, 0.8], y: 1},
	{x: [0.4, 0.9], y: 1},
];

data.initialParameters = {"layers":[{"neurons":[{"bias":0},{"bias":0}]},{"neurons":[{"bias":0.14926214704417798},{"bias":-1.5760565067172967},{"bias":-0.0070790515773630994},{"bias":-0.9610370821643252},{"bias":-0.4631415695352903}]},{"neurons":[{"bias":-0.4930638653997511},{"bias":-1.2292654208180753},{"bias":1.233787276253548},{"bias":-2.054973071108484},{"bias":-1.3979682183549529}]},{"neurons":[{"bias":0.6288132165377796},{"bias":-0.9965512697250088}]},{"neurons":[{"bias":3.500734405313219}]}],"links":[{"n0":[0,0],"nf":[1,0],"weight":2.2559318523672673},{"n0":[0,0],"nf":[1,1],"weight":3.7705902078344162},{"n0":[0,0],"nf":[1,2],"weight":-5.673868837964195},{"n0":[0,0],"nf":[1,3],"weight":-2.552116396138559},{"n0":[0,0],"nf":[1,4],"weight":-4.765897189158554},{"n0":[0,1],"nf":[1,0],"weight":2.522847383501193},{"n0":[0,1],"nf":[1,1],"weight":-2.9902303588384505},{"n0":[0,1],"nf":[1,2],"weight":2.749623598598969},{"n0":[0,1],"nf":[1,3],"weight":-2.0657459601688077},{"n0":[0,1],"nf":[1,4],"weight":2.311040191441733},{"n0":[1,0],"nf":[2,0],"weight":-2.8083933750840506},{"n0":[1,0],"nf":[2,1],"weight":2.368208438212055},{"n0":[1,0],"nf":[2,2],"weight":2.792010178964303},{"n0":[1,0],"nf":[2,3],"weight":2.1204797088106764},{"n0":[1,0],"nf":[2,4],"weight":3.0855603411983634},{"n0":[1,1],"nf":[2,0],"weight":-2.1619760012233913},{"n0":[1,1],"nf":[2,1],"weight":2.7735676578848043},{"n0":[1,1],"nf":[2,2],"weight":-4.795321974592097},{"n0":[1,1],"nf":[2,3],"weight":-3.1618858651724424},{"n0":[1,1],"nf":[2,4],"weight":2.642537468325151},{"n0":[1,2],"nf":[2,0],"weight":5.111269168104936},{"n0":[1,2],"nf":[2,1],"weight":1.8060793114773712},{"n0":[1,2],"nf":[2,2],"weight":1.2874475479043777},{"n0":[1,2],"nf":[2,3],"weight":3.715659708889894},{"n0":[1,2],"nf":[2,4],"weight":-5.479057778095251},{"n0":[1,3],"nf":[2,0],"weight":4.279970838297447},{"n0":[1,3],"nf":[2,1],"weight":-3.8573191202934085},{"n0":[1,3],"nf":[2,2],"weight":-4.346636276004062},{"n0":[1,3],"nf":[2,3],"weight":1.8026421918582567},{"n0":[1,3],"nf":[2,4],"weight":3.9687935202147346},{"n0":[1,4],"nf":[2,0],"weight":-3.5216391228147197},{"n0":[1,4],"nf":[2,1],"weight":4.599458665307638},{"n0":[1,4],"nf":[2,2],"weight":-4.752572287153145},{"n0":[1,4],"nf":[2,3],"weight":-3.810827524569661},{"n0":[1,4],"nf":[2,4],"weight":3.0650028924296953},{"n0":[2,0],"nf":[3,0],"weight":-4.300364295192499},{"n0":[2,0],"nf":[3,1],"weight":-2.9036061692080217},{"n0":[2,1],"nf":[3,0],"weight":4.132576329093505},{"n0":[2,1],"nf":[3,1],"weight":-3.817976850598705},{"n0":[2,2],"nf":[3,0],"weight":4.606542085589321},{"n0":[2,2],"nf":[3,1],"weight":2.8220313920923323},{"n0":[2,3],"nf":[3,0],"weight":2.3423002019828885},{"n0":[2,3],"nf":[3,1],"weight":2.098573708791525},{"n0":[2,4],"nf":[3,0],"weight":4.4760505444141625},{"n0":[2,4],"nf":[3,1],"weight":3.95752484391276},{"n0":[3,0],"nf":[4,0],"weight":-0.7265226578414495},{"n0":[3,1],"nf":[4,0],"weight":-4.316679309853457}]};

module.exports = data;
},{}],10:[function(require,module,exports){
var NeuralNet = require("./NeuralNet");
var DataCanvas = require("./DataCanvas");
var ControlPanel = require("./ControlPanel");
var svg = require("./svg");

window.neuralNet;
window.dataCanvas;
window.trainingSet;
window.controllableParameters;
window.controlPanel;

function init() {
	var data = require("./data");
	
	controllableParameters = {
		learningRate: 0.3,
		regularization: 0.00005
	};
	
	trainingSet = data.trainingSet;
	
	var svgNeuralNet = svg.createElement("svg");
	svgNeuralNet.style.height = "200px";
	document.body.appendChild(svgNeuralNet);
	
	neuralNet = NeuralNet.newFromData(data.initialParameters);
	svgNeuralNet.appendChild(neuralNet.svgElement);
	
	dataCanvas = DataCanvas.newFromData(trainingSet);
	document.body.appendChild(dataCanvas.domElement);
	
	controlPanel = new ControlPanel(neuralNet, controllableParameters);
	document.body.appendChild(controlPanel.domElement);
	
	update();
}

function update() {
	for (var i = 0; i < 10; i++) {
		var dataError = 0;
		var regularizationError;
		
		for (var j = 0; j < trainingSet.length; j++) {
			neuralNet.reset();
			
			var sample = trainingSet[j];
			neuralNet.layers[0].neurons[0].activation = sample.x[0];
			neuralNet.layers[0].neurons[1].activation = sample.x[1];
			neuralNet.forward();
			
			var neuron = neuralNet.layers[neuralNet.layers.length - 1].neurons[0];
			var output = neuron.activation;
			var d = sample.y - output;
			// data error = 0.5 * d^2
			dataError += 0.5 * d * d;
			neuron.dActivation = -d;
			
			regularizationError = neuralNet.backward(
				controllableParameters.learningRate,
				controllableParameters.regularization
			);
		}
	}
		
	neuralNet.redraw();
	dataCanvas.redraw(function(x, y) {
		neuralNet.layers[0].neurons[0].activation = x;
		neuralNet.layers[0].neurons[1].activation = y;
		neuralNet.forward();
		return neuralNet.layers[neuralNet.layers.length - 1].neurons[0].activation;
	});
	controlPanel.update({
		totalError: dataError + regularizationError,
		dataError: dataError,
		regularizationError: regularizationError
	});
	
	requestAnimationFrame(update);
}

init();

},{"./ControlPanel":2,"./DataCanvas":3,"./NeuralNet":7,"./data":9,"./svg":12}],11:[function(require,module,exports){
var math = {};

math.round = function(n, decimalDigits) {
	var factor = 1;
	for (var i = 0; i < decimalDigits; i++) {
		factor *= 10;
	}
	return Math.round(n * factor) / factor;
}

math.sigmoid = function(n) {
	return 1 / (1 + Math.exp(-n));
}

math.dSigmoid = function(n) {
	return math.sigmoid(n) * (1 - math.sigmoid(n));
}

module.exports = math;
},{}],12:[function(require,module,exports){
var svg = {};

svg.createElement = function(element) {
	return document.createElementNS("http://www.w3.org/2000/svg", element);
}

module.exports = svg;

},{}]},{},[10]);
