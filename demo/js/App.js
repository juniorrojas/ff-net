const ffnet = require("ff-net");
const ControlPanel = require("./ControlPanel");
const nn = ffnet.nn;
const svg = ffnet.common.svg;
const ui = ffnet.ui;

class App {
  constructor(data) {
    const container = document.createElement("div");
    container.className = "content-container";
    this.domElement = container;
    
    let row;
    
    row = document.createElement("div");
    container.appendChild(row);
    row.className = "content-container-row";
    
    const model = this.model = nn.Sequential.fromData(
      data.model,
      {
        headless: false,
        createDomElement: true
      }
    );
    model.domElement.classList.add("content-container-cell");
    model.setRenderSize(300, 250);
    row.appendChild(model.domElement);
    
    const dataCanvas = this.dataCanvas = ui.DataCanvas.fromData(data.dataPoints);
    dataCanvas.domElement.classList.add("content-container-cell");
    dataCanvas.domElement.id = "data-canvas";
    row.appendChild(dataCanvas.domElement);
    
    row = document.createElement("div");
    container.appendChild(row);
    row.className = "content-container-row";
    
    const controlPanel = this.controlPanel = new ControlPanel({
      model: model
    });
    controlPanel.domElement.classList.add("content-container-cell");
    row.appendChild(controlPanel.domElement);

    this.paused = false;

    dataCanvas.xyToPixel = (x, y) => {
      model.getInputNeuronGroup().setActivations([x, y]);
      model.forward();
      return model.getOutputNeuronGroup().neurons[0].activation;
    }
    
    this.renderLoop();
    setInterval(() => { this.update() }, 1000 / 60);
  }

  update() {
    if (!this.paused) {
      const model = this.model;
      const dataCanvas = this.dataCanvas;

      const { dataLoss, regularizationLoss } = model.train({
        lr: this.controlPanel.learningRate,
        regularization: this.controlPanel.regularization,
        iters: 10,
        dataPoints: dataCanvas.dataPoints
      });

      this.controlPanel.update({
        dataLoss: dataLoss,
        regularizationLoss: regularizationLoss
      });
    }
  }

  renderLoop() {
    this.model.render();
    this.dataCanvas.render();

    requestAnimationFrame(() => {
      this.renderLoop();
    });
  }

  toData() {
    return {
      dataPoints: this.dataCanvas.toData(),
      model: this.model.toData()
    }
  }

  pause() {
    this.paused = true;
  }

  unpause() {
    this.paused = false;
  }
}

module.exports = App;