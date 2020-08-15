const nn = require("./nn");
const ui = require("./ui");
const svg = require("./common/svg");

function init() {
  const data = require("./data");
  
  window.controllableParameters = {
    learningRate: 0.2,
    regularization: 0.000009
  };
  
  const container = document.createElement("div");
  container.className = "content-container";
  document.body.appendChild(container);
  
  let row;
  
  row = document.createElement("div");
  container.appendChild(row);
  row.className = "content-container-row";
  
  const svgNeuralNet = svg.createElement("svg");
  svgNeuralNet.className = "content-container-cell";
  svgNeuralNet.id = "neural-net";
  row.appendChild(svgNeuralNet);
  
  window.neuralNet = nn.Sequential.fromData(data.neuralNet);
  svgNeuralNet.appendChild(neuralNet.svgElement);
  
  window.dataCanvas = ui.DataCanvas.fromData(data.dataPoints);
  dataCanvas.domElement.className += " content-container-cell";
  dataCanvas.domElement.id = "data-canvas";
  row.appendChild(dataCanvas.domElement);
  
  row = document.createElement("div");
  container.appendChild(row);
  row.className = "content-container-row";
  
  window.controlPanel = new ui.ControlPanel(neuralNet, controllableParameters);
  controlPanel.domElement.className += " content-container-cell";
  row.appendChild(controlPanel.domElement);
  
  update();
}

function update() {
  const iters = 10;
  let dataError, regularizationError;

  for (let i = 0; i < iters; i++) {
    dataError = 0;
    dataCanvas.dataPoints.forEach((dataPoint) => {
      neuralNet.reset();
      neuralNet.layers[0].neurons[0].activation = dataPoint.x;
      neuralNet.layers[0].neurons[1].activation = dataPoint.y;
      neuralNet.forward();
      
      const neuron = neuralNet.layers[neuralNet.layers.length - 1].neurons[0];
      const output = neuron.activation;
      const d = dataPoint.label - output;
      dataError += 0.5 * d * d;
      neuron.dActivation = -d;
      
      regularizationError = neuralNet.backward(
        controllableParameters.learningRate,
        controllableParameters.regularization
      );
    });
  }
  
  neuralNet.render();
  dataCanvas.render(function(x, y) {
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
