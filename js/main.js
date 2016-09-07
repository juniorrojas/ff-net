var NeuralNet = require("./NeuralNet");
var DataCanvas = require("./DataCanvas");
var svg = require("./svg");

var data = require("./data");
window.neuralNet = null;
var dataCanvas;

function update() {
	var learningRate = 0.3;
	var regularization = 0.00001;
	
	for (var i = 0; i < 10; i++) {
		neuralNet.train(data.trainingSet, learningRate, regularization);
	}
		
	neuralNet.redraw();
	dataCanvas.redraw(function(x, y) {
		var output = neuralNet.forward([x, y]);
		return output;
	});
	requestAnimationFrame(update);
}

function init() {
	var svgContainer = svg.createElement("svg");
	svgContainer.style.height = "200px";
	document.body.appendChild(svgContainer);

	neuralNet = new NeuralNet();
	svgContainer.appendChild(neuralNet.svgElement);

	neuralNet.addLayer(2);
	neuralNet.addLayer(5);
	neuralNet.addLayer(5);
	neuralNet.addLayer(2);
	neuralNet.addLayer(1);
	
	for (var i = 0; i < neuralNet.neurons.length; i++) {
		var neuron = neuralNet.neurons[i];
		var layerIndex = neuron.layer.getIndex();
		if (layerIndex < neuralNet.layers.length - 1) {
			var nextLayer = neuralNet.layers[layerIndex + 1];
			for (var j = 0; j < nextLayer.neurons.length; j++) {
				var neuronf = nextLayer.neurons[j];
				neuralNet.addLink(neuron, neuronf);
			}
		}
	}
	
	neuralNet.setParameters(data.initialParameters);
	
	dataCanvas = DataCanvas.newFromData(data.trainingSet);
	document.body.appendChild(dataCanvas.domElement);
	
	update();
}

init();
