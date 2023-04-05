const LossPlot = require("./LossPlot");
const Slider = require("./Slider");

class Row {
  constructor() {
    const div = this.domElement = document.createElement("div");
    div.className = "control-row";
    this.cells = [];
    this.control = null;
  }

  addCell() {
    const cell = document.createElement("div");
    cell.className = "control-cell";
    this.domElement.appendChild(cell);
    this.cells.push(cell);
    return cell;
  }
}

class ControlPanel {
  constructor(args = {}) {    
    this.learningRate = 0.08;
    this.regularization = 0.001;
    
    const div = this.domElement = document.createElement("div");
    div.classList.add("control-panel");
    
    this.rows = [];
    
    let row;

    row = this.addFullRow();
    const btnRandomize = document.createElement("div");
    btnRandomize.textContent = "randomize network parameters";
    btnRandomize.className = "btn";
    row.cells[0].appendChild(btnRandomize);
    
    const model = args.model;
    btnRandomize.addEventListener("click", () => {
      model.randomizeParameters();
    });
    
    this.addControlRow(
      "slider",
      "learning rate",
      {
        min: 0.005,
        max: 0.5,
        step: 0.01,
        value: this.learningRate,
        onUpdate: (value) => {
          this.learningRate = value;
        }
      }
    );
    
    this.addControlRow(
      "slider",
      "regularization",
      {
        min: 0,
        max: 0.0051,
        step: 0.00001,
        value: this.regularization,
        onUpdate: (value) => {
          this.regularization = value;
        }
      }
    );
    
    row = this.addControlRow("text", "loss");
    row.control.className = "formatted-number";
    this.rowLoss = row;
    
    row = this.addFullRow();
    const lossPlot = this.lossPlot = new LossPlot();
    row.cells[0].appendChild(lossPlot.domElement);
  }

  addRow() {
    const row = new Row();
    this.domElement.appendChild(row.domElement);
    this.rows.push(row);
    return row;
  }

  addFullRow() {
    const row = this.addRow();
    const cell = document.createElement("div");
    cell.className = "control-cell-full";
    row.domElement.appendChild(cell);
    row.cells.push(cell);
    return row;
  }

  addControlRow(type, label, controlArgs = {}) {
    const row = this.addRow();
    
    let cell;
    
    cell = row.addCell();
    cell.textContent = label;
    
    cell = row.addCell();
    let control;
    switch (type) {
      case "slider":
        control = new Slider(controlArgs);
        break;
      case "text":
        control = cell;
        break;
      default:
        throw new Error(`invalid control type ${type}`);
    }
    if (control != cell) cell.appendChild(control.domElement);
    
    row.control = control;
    
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
    this.rowLoss.control.textContent = totalLoss.toFixed(10);
    this.lossPlot.push(totalLoss);
  }
}

module.exports = ControlPanel;
