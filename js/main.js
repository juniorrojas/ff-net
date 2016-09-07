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
