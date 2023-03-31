const ffnet = require("ff-net");
const LossPlot = ffnet.ui.LossPlot;
const Slider = require("./Slider");

class ControlPanel {
  constructor(args = {}) {
    this.app = args.app;
    
    this.learningRate = 0.2;
    this.regularization = 0.000009;
    
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
    
    const uiLearningRate = this.addRow("slider", "learning rate", { min: 1/100, max: 80/100, step: 1/100 });
    uiLearningRate.control.domElement.addEventListener("input", () => {
      this.learningRate = parseFloat(uiLearningRate.control.domElement.value);
    });
    
    const uiRegularization = this.addRow("slider", "regularization", { min: 0, max: 100/1000000, step: 1/1000000 });
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
    this.rowsByLabel["loss"].control.textContent = args.totalLoss.toFixed(10);
    this.lossPlot.push(args.dataLoss + args.regularizationLoss);
  }
}

module.exports = ControlPanel;
