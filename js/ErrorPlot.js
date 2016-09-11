var ErrorPlot = function() {
	this.maxDataLength = 500;
	this.data = [];
	this.maxTotalError = 0;
	
	var canvas = this.domElement = document.createElement("canvas");
	canvas.id = "error-canvas";
	canvas.width = this.maxDataLength;
	canvas.height = 100;
	this.ctx = canvas.getContext("2d");
}

var p = ErrorPlot.prototype;

p.getMaxTotalError = function() {
	var max = 0;
	for (var i = 0; i < this.data.length; i++) {
		var item = this.data[i];
		var totalError = item.totalError;
		if (totalError > max) max = totalError;
	}
	return max;
}

p.update = function(dataError, regularizationError) {
	if (this.data.length == this.maxDataLength) {
		var totalErrorToRemove = this.data[0].totalError;
		this.data.shift();
		if (totalErrorToRemove == this.maxTotalError) {
			this.maxTotalError = this.getMaxTotalError();
		}
	}
	var totalError = dataError + regularizationError;
	this.data.push({
		dataError: dataError,
		regularizationError: regularizationError,
		totalError: totalError
	});
	if (totalError > this.maxTotalError) this.maxTotalError = totalError;
	this.redraw();
}

p.redraw = function() {
	var maxTotalError;
	if (this.maxTotalError == 0) maxTotalError = 1;
	else maxTotalError = this.maxTotalError;
	
	var ctx = this.ctx;
	var width = this.domElement.width;
	var height = this.domElement.height;
	ctx.clearRect(0, 0, width, height);
	
	for (var i = 1; i < this.data.length; i++) {
		var item = this.data[i];
		var totalError = item.totalError;
		var x = i / (this.maxDataLength - 1) * width;
		var y = height * (1 - totalError / maxTotalError);
		ctx.beginPath();
		ctx.strokeStyle = "rgb(255, 221, 78)";
		ctx.moveTo(x, height);
		ctx.lineTo(x, y);
		ctx.stroke();
	}
}

module.exports = ErrorPlot;