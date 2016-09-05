var NeuralNet = require("./NeuralNet");
var DataCanvas = require("./DataCanvas");
var svg = require("./svg");

var data = require("./data");
var neuralNet;
var dataCanvas;

function update() {
	var learningRate = 0.3;
	var regularization = 0.00001;
	neuralNet.train(data.trainingSet, learningRate, regularization);
	neuralNet.redraw();
	dataCanvas.redraw(function(x, y) {
		var output = neuralNet.forward([x, y]);
		return output;
	});
	requestAnimationFrame(update);
}

function init() {
	var svgContainer = svg.createElement("svg");
	svgContainer.style.height = "400px";
	document.body.appendChild(svgContainer);

	neuralNet = new NeuralNet();
	svgContainer.appendChild(neuralNet.svgElement);

	neuralNet.addLayer(2);
	neuralNet.addFullyConnectedLayer(5);
	neuralNet.addFullyConnectedLayer(5);
	neuralNet.addFullyConnectedLayer(2);
	neuralNet.addFullyConnectedLayer(1);
	
	neuralNet.setParameters(data.initialParameters);
	
	dataCanvas = DataCanvas.newFromData(data.trainingSet);
	document.body.appendChild(dataCanvas.domElement);
	
	update();
}

init();
