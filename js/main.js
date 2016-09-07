var NeuralNet = require("./NeuralNet");
var DataCanvas = require("./DataCanvas");
var ControlPanel = require("./ControlPanel");
var svg = require("./svg");

window.math = require("./math");

window.neuralNet;
window.dataCanvas;
window.trainingSet;
window.controllableParameters;
window.controlPanel;

function init() {
	var data = require("./data");
	
	controllableParameters = {
		learningRate: 0.3,
		regularization: 0.000009
	};
	
	trainingSet = data.trainingSet;
	
	var container = document.createElement("div");
	container.className = "content-container";
	document.body.appendChild(container);
	
	var svgNeuralNet = svg.createElement("svg");
	svgNeuralNet.className = "content-container-item";
	svgNeuralNet.id = "neural-net";
	container.appendChild(svgNeuralNet);
	
	neuralNet = NeuralNet.newFromData(data.initialParameters);
	svgNeuralNet.appendChild(neuralNet.svgElement);
	
	dataCanvas = DataCanvas.newFromData(trainingSet);
	dataCanvas.domElement.className += " content-container-item";
	dataCanvas.domElement.id = "data-canvas";
	container.appendChild(dataCanvas.domElement);
	
	controlPanel = new ControlPanel(neuralNet, controllableParameters);
	controlPanel.domElement.className += " content-container-item";
	container.appendChild(controlPanel.domElement);
	
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
