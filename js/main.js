var NeuralNet = require("./NeuralNet");
var DataCanvas = require("./DataCanvas");
var svg = require("./svg");

var data = require("./data");
window.neuralNet = null;
var dataCanvas;

function update() {
	var learningRate = 0.3;
	var regularization = 0.00001;
	
	var trainingSet = data.trainingSet;
	
	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < trainingSet.length; j++) {
			var sample = trainingSet[j];
			neuralNet.layers[0].neurons[0].activation = sample.x[0];
			neuralNet.layers[0].neurons[1].activation = sample.x[1];
			neuralNet.forward();
			
			// set reward / error signal
			var neuron = neuralNet.layers[neuralNet.layers.length - 1].neurons[0];
			var output = neuron.activation;
			var d = sample.y - output;
			// data loss = 0.5 * d^2
			// dataLoss += 0.5 * d * d;
			neuron.da = -d; // a = output[0]
			
			neuralNet.backward(learningRate, regularization);
			neuralNet.reset();
		}
	}
		
	neuralNet.redraw();
	dataCanvas.redraw(function(x, y) {
		neuralNet.layers[0].neurons[0].activation = x;
		neuralNet.layers[0].neurons[1].activation = y;
		neuralNet.forward();
		return neuralNet.layers[neuralNet.layers.length - 1].neurons[0].activation;
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
