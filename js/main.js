const nn = require("./nn");
const ui = require("./ui");
const svg = require("./common/svg");

class App {
  constructor(data) {    
    const container = document.createElement("div");
    container.className = "content-container";
    this.domElement = container;
    
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
    
    const controlPanel = this.controlPanel = new ui.ControlPanel({
      app: this,
      neuralNet: model
    });
    controlPanel.domElement.className += " content-container-cell";
    row.appendChild(controlPanel.domElement);
    
    this.update();
  }

  update() {
    const model = this.model;
    const dataCanvas = this.dataCanvas;
    const trainOutput = model.train({
      learningRate: this.controlPanel.learningRate,
      regularization: this.controlPanel.regularization,
      iters: 10,
      dataCanvas: dataCanvas
    });

    const dataLoss = trainOutput.dataLoss;
    const regularizationLoss = trainOutput.regularizationLoss;
    
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

ui.init(() => {
  const divTitle = document.createElement("div");
  document.body.appendChild(divTitle);
  divTitle.className = "title-container";
  divTitle.textContent = "";

  const h1 = document.createElement("h1");
  h1.textContent = "ff-net";
  divTitle.appendChild(h1);

  const h2 = document.createElement("h2");
  h2.textContent = "feedforward neural network learning in real time";
  divTitle.appendChild(h2);

  const data = require("./data");
  const app = new App(data);
  document.body.appendChild(app.domElement);
  window.app = app;
});