const LossPlot = require("./LossPlot");

class ControlPanel {
  constructor(app) {
    this.app = app;
    
    const div = this.domElement = document.createElement("div");
    div.className = "control-panel";
    
    this.rows = [];
    this.rowsByLabel = {};
    
    let row;

    row = this.addRow("full");
    const btnRandomize = document.createElement("div");
    btnRandomize.innerHTML = "randomize network parameters";
    btnRandomize.className = "btn";
    row.cells[0].appendChild(btnRandomize);
    const model = this.app.model;
    btnRandomize.addEventListener("click", () => {
      model.randomizeParameters();
    });
    
    row = this.addRow("slider", "learning rate");
    row.control.min = 1;
    row.control.max = 80;
    row.control.value = Math.round(this.app.learningRate * 100);
    row.control.addEventListener("change", function() {
      this.app.learningRate = this.value / 100;
    }.bind(row.control));
    
    row = this.addRow("slider", "regularization");
    row.control.min = 0;
    row.control.max = 100;
    row.control.value = Math.round(this.app.regularization * 1000000);
    row.control.addEventListener("change", function() {
      this.app.regularization = this.value / 1000000;
    }.bind(row.control));
    
    row = this.addRow("text", "loss");
    row.control.className = "formatted-number";
      
    row = this.addRow("full");
    const lossPlot = this.lossPlot = new LossPlot();
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
      cell.innerHTML = label;
      
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
    this.lossPlot.update(args.dataLoss, args.regularizationLoss);
  }
}

module.exports = ControlPanel;
