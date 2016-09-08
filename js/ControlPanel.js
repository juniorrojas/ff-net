var math = require("./math");

var ControlPanel = function(neuralNet, controllableParameters) {
	var div = this.domElement = document.createElement("div");
	div.className = "control-panel";
	
	this.rows = [];
	this.rowsByLabel = {};
	var row;
	
	row = this.addRow("full");
	var btnRandomize = document.createElement("div");
	btnRandomize.innerHTML = "randomize network parameters";
	btnRandomize.className = "btn";
	row.cells[0].appendChild(btnRandomize);
	btnRandomize.addEventListener("click", function() {
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
	row.control.value = Math.round(controllableParameters.regularization * 100000);
	row.control.addEventListener("change", function() {
		controllableParameters.learningRate = this.value / 100000;
	}.bind(row.control));
	
	row = this.addRow("text", "total error");
	row.control.className = "formatted-number";
	
	row = this.addRow("text", "data error");
	row.control.className = "formatted-number";
	
	row = this.addRow("text", "regularization error");
	row.control.className = "formatted-number";
}

var p = ControlPanel.prototype;

p.addCell = function(row) {
	cell = document.createElement("div");
	cell.className = "control-cell";
	row.appendChild(cell);
	row.cells.push(cell);
	return cell;
}

p.addRow = function(type, label) {
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
				break;
		}
		if (control != cell && control != null) cell.appendChild(control);
		
		row.control = control;
	}
	
	return row;
}

p.update = function(data) {
	this.rowsByLabel["total error"].control.innerHTML =
		math.roundToString(data.totalError, 5);
	this.rowsByLabel["data error"].control.innerHTML =
		math.roundToString(data.dataError, 5);
	this.rowsByLabel["regularization error"].control.innerHTML =
		math.roundToString(data.regularizationError, 5);
}

module.exports = ControlPanel;
