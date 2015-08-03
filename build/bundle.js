(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Link;

Link = function(n0, nf, weight) {
	this.init(n0, nf, weight);
}

var p = Link.prototype;

p.init = function(n0, nf, weight) {
	this.n0 = n0;
	this.nf = nf;
	this.weight = weight;
	this.dw = 0;
}

module.exports = Link;

},{}],2:[function(require,module,exports){
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

},{"./Link":1,"./Neuron":3,"./Spike":4}],3:[function(require,module,exports){
var Neuron;

Neuron = function(pos, bias) {
	this.init(pos, bias);
}

var p = Neuron.prototype;

p.init = function(pos, bias) {
	this.links = [];
	this.backLinks = [];
	this.pos = pos;
	this.bias = bias;
	this.preactivation = 0;
	this.activation = Neuron.sigmoid(this.bias);
	this.error = 0;
	this.da = 0; // d activation
	this.dz = 0; // d preactivation
	this.db = 0; // d bias
}

Neuron.sigmoid = function(x) {
	return 1 / (1 + Math.exp(-x));
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

module.exports = Neuron;

},{}],4:[function(require,module,exports){
var Vector2 = require("./Vector2");

var Spike;

Spike = function(link) {
	this.init(link);
}

var p = Spike.prototype;

p.init = function(link) {
	this.link = link;
	this.pos = new Vector2(0, 0);
	this.radius = 0;
}

p.getMagnitude = function() {
	return this.link.n0.activation * this.link.weight;
}

module.exports = Spike;

},{"./Vector2":5}],5:[function(require,module,exports){
var Vector2;

Vector2 = function(x, y) {
	this.init(x, y);
}

var p = Vector2.prototype;

p.init = function(x, y) {
	this.x = x;
	this.y = y;
}

p.add = function(v) {
	return new Vector2(this.x + v.x, this.y + v.y);
}

p.subtract = function(v) {
	return new Vector2(this.x - v.x, this.y - v.y);
}

p.magnitude = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
}

p.times = function(n) {
	return new Vector2(this.x * n, this.y * n);
}

p.normalize = function() {
	var magnitude = this.magnitude();
	return this.times(1 / magnitude);
}

p.dot = function(v) {
	return this.x * v.x + this.y * v.y;
}

p.crossZ = function(v) {
	return - v.x * this.y + this.x * v.y;
}

p.equals = function(v) {
	return v.x == this.x && v.y == this.y;
}

p.toString = function() {
	return "(x: " + this.x + ", y: " + this.y + ")";
}

module.exports = Vector2;

},{}],6:[function(require,module,exports){
var NeuralNet = require("./NeuralNet");
var Vector2 = require("./Vector2");

var cLightBlue = d3.rgb(186, 224, 251);
var cLightRed = d3.rgb(252, 163, 163);

var cRed = d3.rgb(226, 86, 86);
var cBlue = d3.rgb(135, 173, 236);

colorBlend = function(a, b, t) {
	return d3.rgb(
		a.r * t + b.r * (1 - t),
		a.g * t + b.g * (1 - t),
		a.b * t + b.b * (1 - t)
	);
}

roundDigits = function(n, decimalDigits) {
	var factor = 1;
	for (var i = 0; i < decimalDigits; i++) factor*= 10;
	return Math.round(n * factor) / factor;
}

init = function() {
	var trainingSet = [
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

	var svgWidth = 340;
	var svgHeight = 250;
	var canvasWidth = 250;
	var canvasHeight = 250;
	var canvasWidthMini = 50;
	var canvasHeightMini = 50;
	var neuronRadius = 12;
	var maxSpikeRadius = 7;
	var preactivationTop = 10;
	var minOutputPaint = 0.5 - 0.5;
	var maxOutputPaint = 0.5 + 0.5;

	var fWidth = canvasWidth / canvasWidthMini;
	var fHeight = canvasHeight / canvasHeightMini;

	var learningRate = 0.3;
	var regularization = 0.00001;

	var fWidth = canvasWidth / canvasWidthMini;
	var fHeight = canvasHeight / canvasHeightMini;

	var neuralNet = new NeuralNet();

	var neuronsPerLayer = [2, 5, 5, 2, 1];

	var dy = 50;
	var x = 20;
	var dx = 70;

	var layers = [];

	for (var i = 0; i < neuronsPerLayer.length; i++) {
		layers.push([]);
		for (var j = 0; j < neuronsPerLayer[i]; j++) {
			var y = svgHeight / 2 + (j - (neuronsPerLayer[i] - 1) / 2) * dy;
			var pos = new Vector2(x, y);
			var bias;
			if (i == 0) bias = 0;
			else bias = 1.5 - Math.random() * 3;

			var neuron = neuralNet.addNeuron(pos, bias);

			layers[i].push(neuron);

			if (i == 0) neuralNet.input.push(neuron);
			else
			if (i == neuronsPerLayer.length - 1) neuralNet.output.push(neuron);
		}
		x += dx;
	}

	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		for (var j = 0; j < layer.length; j++) {
			var n0 = layer[j];
			if (i < layers.length - 1) {
				var nextLayer = layers[i + 1];
				for (var k = 0; k < nextLayer.length; k++) {
					var nf = nextLayer[k];
					var weight = 2 + Math.random() * 4;
					if (Math.random() <= 0.5) weight *= -1;
					neuralNet.addLink(n0, nf, weight);
				}
			}
		}
	}

	var mainDiv = d3.select('body')
	.append('div')
	.style('text-align', 'center');

	var svg = mainDiv
	.append('svg')
	.attr('width', svgWidth)
	.attr('height', svgHeight)
	.style('vertical-align', 'middle');

	var divCanvas = mainDiv
	.append('div')
	.style('position', 'relative')
	.style('display', 'inline-block')
	.style('vertical-align', 'middle');

	var canvas = divCanvas.append('canvas')
	.attr('width', canvasWidth)
	.attr('height', canvasHeight);

	var ctx = canvas.node().getContext('2d');

	var canvasSvg = divCanvas.append('svg')
	.attr('width', canvasWidth)
	.attr('height', canvasHeight)
	.style('position', 'absolute')
	.style('left', '0px')
	.style('top', '0px')
	.style('z-index', '2');

	var miniCanvasData = [];
	for (var i = 0; i < canvasWidthMini; i++) {
		miniCanvasData.push([]);
		for (var j = 0; j < canvasHeightMini; j++) {
			miniCanvasData[i].push(0);
		}
	}

	var divControls = mainDiv
	.append('div')
	.style('text-align', 'left')
	.style('width', '180px')
	.style('display', 'inline-block')
	.style('vertical-align', 'middle')
	.style('padding-left', '25px');

	var btnRandomizeWeights = divControls
	.append('button')
	.html('Randomize weights')
	.style('text-align', 'center')
	.on('click', randomizeWeights);

	// var $btnRandomizeWeights = $(btnRandomizeWeights[0]);
	// $btnRandomizeWeights.button();

	divControls.append('div')
	.html('<b>Learning rate</b>');

	var txtLearningRate = divControls
	.append('span')
	.text(learningRate);

	var sldLearningRate = divControls
	.append('div');

	sldLearningRate.call(d3.slider()
		.axis(d3.svg.axis().ticks(6))
		.min(0)
		.max(1)
		.step(0.01)
		.value(learningRate)
		.on('slide', function(event, value) {
			learningRate = value;
			txtLearningRate.text(roundDigits(learningRate, 2).toString());
		})
	)
	.style('margin-left', '0px')
	.style('margin-top', '2px')
	.style('margin-bottom', '17px');

	divControls.append('div')
	.html('<b>Regularization</b><br>');

	var txtRegularization = divControls
	.append('span')
	.text(regularization);

	var sldRegularization = divControls
	.append('div');

	sldRegularization.call(d3.slider()
		.axis(d3.svg.axis().ticks(3))
		.min(0)
		.max(0.0001)
		.step(0.0000001)
		.value(regularization)
		.on('slide', function(event, value) {
			regularization = value;
			txtRegularization.text(roundDigits(regularization, 5).toString());
		})
	)
	.style('margin-left', '0px')
	.style('margin-top', '2px')
	.style('margin-bottom', '17px');

	var divInfo = divControls
	.append('div');

	var d3Link = svg.append('svg:g').selectAll('path');
	var d3Spike = svg.append('svg:g').selectAll('g');
	var d3Neuron = svg.append('svg:g').selectAll('g');
	var d3Sample = canvasSvg.append('svg:g').selectAll('g');

	var t = 0;
	var propagationT = 200;

	restart();

	var firstPass = true;
	var firingNeurons = [];

	/*
	firingNeurons = neuralNet.input;
	neuralNet.neurons[0].activation = 0.8;
	neuralNet.neurons[1].activation = 0.8;
	*/

	neuralNet.reset();
	setInterval(update, 1 / 30);

	function update() {
		var trainInfo = neuralNet.train(trainingSet, learningRate, regularization);
		updateCanvas();

		var totalLoss = trainInfo.dataLoss + trainInfo.regularizationLoss;
		var decimalDigits = 5;

		divInfo.html(
		'<b>Data loss:</b><br>' +
		roundDigits(trainInfo.dataLoss, decimalDigits) + '<br>' +
		'<b>Regularization loss:</b><br>' +
		roundDigits(trainInfo.regularizationLoss, decimalDigits) + '<br>' +
		'<b>Total loss:</b><br>' +
		roundDigits(totalLoss, decimalDigits) + '<br>');

		if (t >= propagationT) {
			t = propagationT;
			var newFiringNeurons = [];
			for (var i = 0; i < firingNeurons.length; i++) {
				var neuron = firingNeurons[i];
				for (var j = 0; j < neuron.links.length; j++) {
					var link = neuron.links[j];
					if (newFiringNeurons.indexOf(link.nf) == -1) {
						newFiringNeurons.push(link.nf);
					}
				}
			}
			firingNeurons = newFiringNeurons;
			t = 0;
		} else
		if (t == 0) {
			if (firstPass) {
				firstPass = false;
			} else {
				for (var i = 0; i < firingNeurons.length; i++) {
					var neuron = firingNeurons[i];
					neuron.update();
				}
			}

			for (var i = 0; i < firingNeurons.length; i++) {
				var neuron = firingNeurons[i];
				for (var j = 0; j < firingNeurons[i].links.length; j++) {
					var spike = neuron.links[j].spike;
					spike.radius = maxSpikeRadius * Math.min(1, Math.abs(spike.getMagnitude()) / preactivationTop);
				}
			}

			t++;
		} else {
			t++;
		}

		for (var i = 0; i < firingNeurons.length; i++) {
			for (var j = 0; j < firingNeurons[i].links.length; j++) {
				var spike = firingNeurons[i].links[j].spike;
				var link = spike.link;

				var v = link.nf.pos.subtract(link.n0.pos).normalize();
				var p0 = link.n0.pos.add(v.times(neuronRadius - spike.radius));
				var pf = link.nf.pos.subtract(v.times(neuronRadius - spike.radius));
				v = pf.subtract(p0);
				spike.pos = p0.add(v.times(t / propagationT));
			}
		}

		// draw directed edges with proper padding from node centers
		d3Link.attr('d', function(d) {
			var deltaX = d.nf.pos.x - d.n0.pos.x,
				deltaY = d.nf.pos.y - d.n0.pos.y,
				dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
				normX = deltaX / dist,
				normY = deltaY / dist,
				sourcePadding = d.left ? neuronRadius - 5 : neuronRadius,
				targetPadding = d.right ? neuronRadius - 5: neuronRadius,
				sourceX = d.n0.pos.x + (sourcePadding * normX),
				sourceY = d.n0.pos.y + (sourcePadding * normY),
				targetX = d.nf.pos.x - (targetPadding * normX),
				targetY = d.nf.pos.y - (targetPadding * normY);
			return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
		});

		d3Neuron.attr('transform', function(d) {
			return 'translate(' + d.pos.x + ',' + d.pos.y + ')';
		})
		.selectAll('circle').style('fill', function(d) {
			var v = Math.abs(d.activation);
			return colorBlend(cBlue, cRed, v);
		});

		d3Link
		.style('stroke-width', function(d) {
			return maxSpikeRadius * 2 * Math.min(1, Math.abs(d.weight) / preactivationTop);
		});

		d3Spike.attr('transform', function(d) {
			return 'translate(' + d.pos.x + ',' + d.pos.y + ')';
		});
		d3Spike.selectAll('circle').attr('r', function(d) { return d.radius; });
	}

	function randomizeWeights() {
		neuralNet.randomizeWeights();
	}

	function restart() {
		var g;

		d3Link = d3Link.data(neuralNet.links);

		d3Link.enter().append('svg:path')
		.attr('class', 'link')
		.style('stroke-width', function(d) {
			return 1; // maxSpikeRadius * 2 * Math.min(1, Math.abs(d.weight) / preactivationTop);
		})
		.style('stroke', function(d) {
			if (d.weight > 0) {
				return cBlue;
			} else {
				return cRed;
			}
		})
		.style('stroke-opacity', function(d) { return 0.4; });

		d3Link.exit().remove();

		d3Neuron = d3Neuron.data(neuralNet.neurons);
		g = d3Neuron.enter().append('svg:g');

		g.append('svg:circle')
		.attr('class', 'neuron')
		.attr('r', neuronRadius)
		.style('stroke', function(d) { return d3.rgb(0, 0, 0); });

		d3Neuron.exit().remove();

		d3Spike = d3Spike.data(neuralNet.spikes);
		g = d3Spike.enter().append('svg:g');

		g.append('svg:circle')
		.attr('class', 'spike')
		.attr('fill', function(d) {
			if (d.link.weight > 0) {
				return cBlue;
			} else {
				return cRed;
			}
		});

		d3Spike.exit().remove();

		d3Sample = d3Sample.data(trainingSet);
		g = d3Sample.enter().append('svg:g');

		g.append('svg:circle')
		.attr('class', 'sample')
		.attr('r', 3)
		.style('stroke', function(d) { return d3.rgb(0, 0, 0) })
		.style('fill', function(d) {
			if (d.y == 1) return cBlue;
			else return cRed;
		});

		d3Sample.attr('transform', function(d) {
			return 'translate(' + d.x[0] * canvasWidth + ',' + d.x[1] * canvasHeight + ')';
		});

		d3Sample.exit().remove();

		updateCanvas();

	}

	function updateCanvas() {
		var d;
		for (var i = 0; i < canvasWidthMini; i++) {
			for (var j = 0; j < canvasHeightMini; j++) {
				var output = neuralNet.computeOutput([i / canvasWidthMini, j / canvasHeightMini]);
				var v = output[0];
				if (v > maxOutputPaint) d = cLightBlue;
				else if (v < minOutputPaint) d = cLightRed;
				else {
					v = (v - minOutputPaint) / (maxOutputPaint - minOutputPaint);
					d = colorBlend(cLightBlue, cLightRed, v);
				}

				miniCanvasData[i][j] = d;
			}
		}

		var imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
		var imgDataLen = imgData.data.length;
		for (var i = 0; i < imgDataLen / 4; i++) {
			var y = Math.floor(i / canvasWidth);
			var x = i % canvasWidth;
			var d = miniCanvasData[Math.floor(x / fWidth)][Math.floor(y / fHeight)];
			imgData.data[4 * i] = d.r;
			imgData.data[4 * i + 1] = d.g;
			imgData.data[4 * i + 2] = d.b;
			imgData.data[4 * i + 3] = 255;
		}
		ctx.putImageData(imgData, 0, 0);

		neuralNet.reset();
	}

}

},{"./NeuralNet":2,"./Vector2":5}]},{},[6]);
