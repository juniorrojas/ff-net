const LossPlot = require("./LossPlot");

class ControlPanel {
  constructor(args = {}) {
    this.app = args.app;
    
    this.learningRate = 0.2;
    this.regularization = 0.000009;
    
    const div = this.domElement = document.createElement("div");
    div.className = "control-panel";
    
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
    
    const uiLearningRate = this.addRow("slider", "learning rate");
    uiLearningRate.control.min = 1;
    uiLearningRate.control.max = 80;
    uiLearningRate.control.value = Math.round(this.learningRate * 100);
    uiLearningRate.control.addEventListener("change", () => {
      this.learningRate = uiLearningRate.control.value / 100;
    });
    
    const uiRegularization = this.addRow("slider", "regularization");
    uiRegularization.control.min = 0;
    uiRegularization.control.max = 100;
    uiRegularization.control.value = Math.round(this.regularization * 1000000);
    uiRegularization.control.addEventListener("change", () => {
      this.regularization = uiRegularization.control.value / 1000000;
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

  addRow(type, label) {
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
          control = document.createElement("input");
          control.type = "range";
          break;
        case "text":
          control = cell;
          break;
      }
      if (control != cell && control != null) cell.appendChild(control);
      
      row.control = control;
    }
    
    return row;
  }

  update(args) {
    this.rowsByLabel["loss"].control.textContent = args.totalLoss.toFixed(10);
    this.lossPlot.update(args.dataLoss + args.regularizationLoss);
  }
}

module.exports = ControlPanel;
