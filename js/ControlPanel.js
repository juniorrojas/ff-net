var math = require("./math");

var ControlPanel = function() {
	var div = this.domElement = document.createElement("div");
	
	var lbLearningRate = document.createTextNode("learning rate");
	div.appendChild(lbLearningRate);
	
	var slLearningRate = document.createElement("input");
	slLearningRate.type = "range";
	div.appendChild(slLearningRate);
	
	var lbRegularization = document.createTextNode("regularization");
	div.appendChild(lbRegularization);
	
	var slRegularization = document.createElement("input");
	slRegularization.type = "range";
	div.appendChild(slRegularization);
	
	var lbDataError = document.createTextNode("data error");
	div.appendChild(lbDataError);
	
	var txtDataError = this.txtDataError =  document.createTextNode("");
	div.appendChild(txtDataError);
	
	var lbRegularizationError = document.createTextNode("regularization error");
	div.appendChild(lbRegularizationError);
	
	var txtRegularizationError = this.txtRegularizationError =  document.createTextNode("");
	div.appendChild(txtRegularizationError);
}

var p = ControlPanel.prototype;

p.update = function(data) {
	this.txtDataError.textContent = math.round(data.dataError, 5);
	this.txtRegularizationError.textContent = math.round(data.regularizationError, 5);
}

module.exports = ControlPanel;