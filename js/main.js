var NeuralNet = require("./NeuralNet");
var DataCanvas = require("./DataCanvas");
var svg = require("./svg");

window.neuralNet;
window.dataCanvas;
window.trainingSet;
window.learningRate;
window.regularization;

function init() {
	var data = require("./data");
	
	learningRate = 0.3;
	regularization = 0.00001;
	trainingSet = data.trainingSet;
	
	var svgNeuralNet = svg.createElement("svg");
	svgNeuralNet.style.height = "200px";
	document.body.appendChild(svgNeuralNet);
	
	neuralNet = NeuralNet.newFromData(data.initialParameters);
	svgNeuralNet.appendChild(neuralNet.svgElement);
	
	dataCanvas = DataCanvas.newFromData(trainingSet);
	document.body.appendChild(dataCanvas.domElement);
	
	update();
}

function update() {	
	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < trainingSet.length; j++) {
			neuralNet.reset();
			
			var sample = trainingSet[j];
			neuralNet.layers[0].neurons[0].activation = sample.x[0];
			neuralNet.layers[0].neurons[1].activation = sample.x[1];
			neuralNet.forward();
			
			var neuron = neuralNet.layers[neuralNet.layers.length - 1].neurons[0];
			var output = neuron.activation;
			var d = sample.y - output;
			// data loss = 0.5 * d^2
			// dataLoss += 0.5 * d * d;
			neuron.dActivation = -d;
			
			neuralNet.backward(learningRate, regularization);
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

init();
