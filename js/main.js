const nn = require("./nn");
const ui = require("./ui");
const svg = require("./common/svg");

class App {
  constructor(data) {
    this.learningRate = 0.2;
    this.regularization = 0.000009;
    
    const container = document.createElement("div");
    container.className = "content-container";
    document.body.appendChild(container);
    
    let row;
    
    row = document.createElement("div");
    container.appendChild(row);
    row.className = "content-container-row";
    
    let svgModel = svg.createElement("svg");
    svgModel.class = "content-container-cell";
    svgModel.id = "neural-net";
    row.appendChild(svgModel);
    
    const model = this.model = nn.Sequential.fromData(data.model);
    svgModel.appendChild(model.svgElement);
    
    const dataCanvas = this.dataCanvas = ui.DataCanvas.fromData(data.dataPoints);
    dataCanvas.domElement.className += " content-container-cell";
    dataCanvas.domElement.id = "data-canvas";
    row.appendChild(dataCanvas.domElement);
    
    row = document.createElement("div");
    container.appendChild(row);
    row.className = "content-container-row";
    
    const controlPanel = this.controlPanel = new ui.ControlPanel(this);
    controlPanel.domElement.className += " content-container-cell";
    row.appendChild(controlPanel.domElement);
    
    this.update();
  }

  update() {
    const iters = 10;
    let dataLoss, regularizationLoss;

    const model = this.model;
    const dataCanvas = this.dataCanvas;
    for (let i = 0; i < iters; i++) {
      dataLoss = 0;
      dataCanvas.dataPoints.forEach((dataPoint) => {
        model.reset();
        model.layers[0].neurons[0].activation = dataPoint.x;
        model.layers[0].neurons[1].activation = dataPoint.y;
        model.forward();
        
        const neuron = model.layers[model.layers.length - 1].neurons[0];
        const output = neuron.activation;
        const d = dataPoint.label - output;
        dataLoss += 0.5 * d * d;
        neuron.dActivation = -d;
        
        regularizationLoss = model.backward(
          this.learningRate,
          this.regularization
        );
      });
    }
    
    model.render();
    dataCanvas.render((x, y) => {
      model.layers[0].neurons[0].activation = x;
      model.layers[0].neurons[1].activation = y;
      model.forward();
      return model.layers[model.layers.length - 1].neurons[0].activation;
    });
    this.controlPanel.update({
      totalLoss: dataLoss + regularizationLoss,
      dataLoss: dataLoss,
      regularizationLoss: regularizationLoss
    });

    requestAnimationFrame(() => {
      this.update();
    });
  }

  toData() {
    return {
      dataPoints: this.dataCanvas.toData(),
      model: this.model.toData()
    }
  }
}

const data = require("./data");
window.app = new App(data);