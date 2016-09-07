var NeuralNet = require("./NeuralNet");
var DataCanvas = require("./DataCanvas");
var ControlPanel = require("./ControlPanel");
var svg = require("./svg");

window.math = require("./math");

window.neuralNet;
window.dataCanvas;
window.controllableParameters;
window.controlPanel;

function init() {
	var data = require("./data");
	
	controllableParameters = {
		learningRate: 0.3,
		regularization: 0.000009
	};
	
	var container = document.createElement("div");
	container.className = "content-container";
	document.body.appendChild(container);
	
	var svgNeuralNet = svg.createElement("svg");
	svgNeuralNet.className = "content-container-item";
	svgNeuralNet.id = "neural-net";
	container.appendChild(svgNeuralNet);
	
	neuralNet = NeuralNet.newFromData(data.neuralNet);
	svgNeuralNet.appendChild(neuralNet.svgElement);
	
	dataCanvas = DataCanvas.newFromData(data.dataPoints);
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
		
		for (var j = 0; j < dataCanvas.dataPoints.length; j++) {
			neuralNet.reset();
			
			var dataPoint = dataCanvas.dataPoints[j];
			neuralNet.layers[0].neurons[0].activation = dataPoint.x;
			neuralNet.layers[0].neurons[1].activation = dataPoint.y;
			neuralNet.forward();
			
			var neuron = neuralNet.layers[neuralNet.layers.length - 1].neurons[0];
			var output = neuron.activation;
			var d = dataPoint.label - output;
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

function getData() {
	return {
		dataPoints: dataCanvas.toData(),
		neuralNet: neuralNet.toData()
	}
}
window.getData = getData;

init();
