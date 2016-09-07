var math = require("./math");

var ControlPanel = function(controllableParameters) {
	var div = this.domElement = document.createElement("div");
	div.className = "control-panel";
	
	this.rows = [];
	this.rowsByLabel = {};
	var row;
	
	row = this.addRow("slider", "learning rate");
	row.control.value = controllableParameters.learningRate * 100;
	row.control.addEventListener("change", function() {
		controllableParameters.learningRate = this.value / 100;
	}.bind(row.control));
	
	row = this.addRow("slider", "regularization");
	row.control.value = controllableParameters.regularization * 1000000;
	row.control.addEventListener("change", function() {
		controllableParameters.learningRate = this.value / 1000000;
	}.bind(row.control));
	
	row = this.addRow("text", "total error");
	row = this.addRow("text", "data error");
	row = this.addRow("text", "regularization error");
}

var p = ControlPanel.prototype;

p.addCell = function(row) {
	cell = document.createElement("div");
	cell.className = "control-cell";
	row.appendChild(cell);
	return cell;
}

p.addRow = function(type, label) {
	var row = document.createElement("div");
	row.className = "control-row";
	this.domElement.appendChild(row);
	this.rows.push(row);
	this.rowsByLabel[label] = row;
	
	var cell;
	
	cell = this.addCell(row);
	cell.innerText = label;
	
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
	if (control != cell) cell.appendChild(control);
	
	row.control = control;
	
	return row;
}

p.update = function(data) {
	this.rowsByLabel["total error"].control.innerText =
		math.round(data.totalError, 5);
	this.rowsByLabel["data error"].control.innerText =
		math.round(data.dataError, 5);
	this.rowsByLabel["regularization error"].control.innerText =
		math.round(data.regularizationError, 5);
}

module.exports = ControlPanel;