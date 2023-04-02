const ffnet = require("ff-net");
const LossPlot = ffnet.ui.LossPlot;
const Slider = require("./Slider");

class ControlPanel {
  constructor(args = {}) {
    this.app = args.app;
    
    this.learningRate = 0.2;
    this.regularization = 0.00002;
    
    const div = this.domElement = document.createElement("div");
    div.classList.add("control-panel");
    
    this.rows = [];
    this.rowsByLabel = {};
    
    let row;

    row = this.addRow("full");
    const btnRandomize = document.createElement("div");
    btnRandomize.textContent = "randomize network parameters";
    btnRandomize.className = "btn";
    row.cells[0].appendChild(btnRandomize);
    const model = args.neuralNet;
    btnRandomize.addEventListener("click", () => {
      model.randomizeParameters();
    });
    
    const uiLearningRate = this.addRow(
      "slider", "learning rate",
      {
        min: 0.01,
        max: 0.8,
        step: 0.01,
        value: this.learningRate
      }
    );
    uiLearningRate.control.domElement.addEventListener("input", () => {
      this.learningRate = parseFloat(uiLearningRate.control.domElement.value);
    });
    
    const uiRegularization = this.addRow(
      "slider", "regularization",
      {
        min: 0,
        max: 0.0001,
        step: 0.000001,
        value: this.regularization
      }
    );
    uiRegularization.control.domElement.addEventListener("input", () => {
      this.regularization = parseFloat(uiRegularization.control.domElement.value);
    });
    
    row = this.addRow("text", "loss");
    row.control.className = "formatted-number";
    
    row = this.addRow("full");
    const lossPlot = this.lossPlot = new LossPlot();
    lossPlot.domElement.className = "loss-plot-canvas";
    row.cells[0].appendChild(lossPlot.domElement);
  }

  addCell(row) {
    const cell = document.createElement("div");
    cell.className = "control-cell";
    row.appendChild(cell);
    row.cells.push(cell);
    return cell;
  }

  addRow(type, label, controlArgs = {}) {
    const row = document.createElement("div");
    row.cells = [];
    row.className = "control-row";
    this.domElement.appendChild(row);
    this.rows.push(row);
    this.rowsByLabel[label] = row;
    
    let cell;
    
    if (type == "full") {
      cell = document.createElement("div");
      cell.className = "control-cell-full";
      row.appendChild(cell);
      row.cells.push(cell);
    } else {
      cell = this.addCell(row);
      cell.textContent = label;
      
      cell = this.addCell(row);
      let control;
      switch (type) {
        case "slider":
          control = new Slider(controlArgs);
          break;
        case "text":
          control = cell;
          break;
      }
      if (control != cell && control != null) cell.appendChild(control.domElement);
      
      row.control = control;
    }
    
    return row;
  }

  update(args) {
    if (args.dataLoss == null) {
      throw new Error("dataLoss required to update panel");
    }
    if (args.regularizationLoss == null) {
      throw new Error("regularizationLoss required to update panel");
    }
    const totalLoss = args.dataLoss + args.regularizationLoss;
    this.rowsByLabel["loss"].control.textContent = totalLoss.toFixed(10);
    this.lossPlot.push(totalLoss);
  }
}

module.exports = ControlPanel;
