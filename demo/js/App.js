const ffnet = require("ff-net");
const nn = ffnet.nn;
const svg = ffnet.ui.svg;
const ui = ffnet.ui2;

class App {
  constructor(data) {
    const container = document.createElement("div");
    container.className = "content-container";
    this.domElement = container;
    
    let row;
    
    row = document.createElement("div");
    container.appendChild(row);
    row.className = "content-container-row";
    
    const svgModel = svg.createElement("svg");
    svgModel.class = "content-container-cell";
    svgModel.id = "neural-net";
    row.appendChild(svgModel);
    
    const model = this.model = nn.Sequential.fromData({
      data: data.model,
      headless: false
    });
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

    this.paused = false;
    
    this.update();
  }

  update() {
    if (!this.paused) {
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
      const classify = (x, y) => {
        model.neuronGroups[0].neurons[0].activation = x;
        model.neuronGroups[0].neurons[1].activation = y;
        model.forward();
        return model.neuronGroups[model.neuronGroups.length - 1].neurons[0].activation;
      }
      this.classify = classify;
      dataCanvas.render(classify);
      this.controlPanel.update({
        totalLoss: dataLoss + regularizationLoss,
        dataLoss: dataLoss,
        regularizationLoss: regularizationLoss
      });
    }

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

  pause() {
    this.paused = true;
  }

  unpause() {
    this.paused = false;
  }
}

module.exports = App;