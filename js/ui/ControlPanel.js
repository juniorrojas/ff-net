const ErrorPlot = require("./ErrorPlot");

class ControlPanel {
  constructor(neuralNet, controllableParameters) {
    const div = this.domElement = document.createElement("div");
    div.className = "control-panel";
    
    this.rows = [];
    this.rowsByLabel = {};
    
    let row;

    row = this.addRow("full");
    var btnRandomize = document.createElement("div");
    btnRandomize.innerHTML = "randomize network parameters";
    btnRandomize.className = "btn";
    row.cells[0].appendChild(btnRandomize);
    btnRandomize.addEventListener("click", () => {
      neuralNet.randomizeParameters();
    });
    
    row = this.addRow("slider", "learning rate");
    row.control.min = 1;
    row.control.max = 80;
    row.control.value = Math.round(controllableParameters.learningRate * 100);
    row.control.addEventListener("change", function() {
      controllableParameters.learningRate = this.value / 100;
    }.bind(row.control));
    
    row = this.addRow("slider", "regularization");
    row.control.min = 0;
    row.control.max = 100;
    row.control.value = Math.round(controllableParameters.regularization * 1000000);
    row.control.addEventListener("change", function() {
      controllableParameters.regularization = this.value / 1000000;
    }.bind(row.control));
    
    row = this.addRow("text", "loss");
    row.control.className = "formatted-number";
      
    row = this.addRow("full");
    var errorPlot = this.errorPlot = new ErrorPlot();
    row.cells[0].appendChild(errorPlot.domElement);
  }

  addCell(row) {
    const cell = document.createElement("div");
    cell.className = "control-cell";
    row.appendChild(cell);
    row.cells.push(cell);
    return cell;
  }

  addRow(type, label) {
    var row = document.createElement("div");
    row.cells = [];
    row.className = "control-row";
    this.domElement.appendChild(row);
    this.rows.push(row);
    this.rowsByLabel[label] = row;
    
    var cell;
    
    if (type == "full") {
      cell = document.createElement("div");
      cell.className = "control-cell-full";
      row.appendChild(cell);
      row.cells.push(cell);
    } else {
      cell = this.addCell(row);
      cell.innerHTML = label;
      
      cell = this.addCell(row);
      var control;
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

  update(data) {
    this.rowsByLabel["loss"].control.textContent = data.totalError.toFixed(10);
    this.errorPlot.update(data.dataError, data.regularizationError);
  }
}

module.exports = ControlPanel;
