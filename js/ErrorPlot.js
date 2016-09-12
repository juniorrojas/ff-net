var minTopError = 4;

var ErrorPlot = function() {	
	var canvas = this.domElement = document.createElement("canvas");
	canvas.id = "error-canvas";
	this.ctx = canvas.getContext("2d");	
	this.maxDataLength = canvas.width;
	this.data = [];
	this.topError = minTopError;
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
		this.data.shift();
	}
	var totalError = dataError + regularizationError;
	this.data.push({
		dataError: dataError,
		regularizationError: regularizationError,
		totalError: totalError
	});
	var maxTotalError = this.getMaxTotalError();
	if (maxTotalError > minTopError) this.topError = maxTotalError;
	else this.topError = minTopError;
	this.redraw();
}

p.redraw = function() {	
	var ctx = this.ctx;
	var width = this.domElement.width;
	var height = this.domElement.height;
	ctx.clearRect(0, 0, width, height);
	
	for (var i = 1; i < this.data.length; i++) {
		var item = this.data[i];
		var totalError = item.totalError;
		var x = i / (this.maxDataLength - 1) * width;
		var y = height * (1 - totalError / this.topError);
		ctx.beginPath();
		ctx.strokeStyle = "rgb(255, 221, 78)";
		ctx.moveTo(x, height);
		ctx.lineTo(x, y);
		ctx.stroke();
	}
}

module.exports = ErrorPlot;