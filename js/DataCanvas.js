var Color = require("./Color");
var DataPoint = require("./DataPoint");

var DataCanvas = function() {
	this.dataPoints = [];
	var canvas = this.domElement = document.createElement("canvas");
	canvas.width = 400;
	canvas.height = 400;
	canvas.style.border = "1px solid black";
	this.ctx = canvas.getContext("2d");
}

var p = DataCanvas.prototype;

p.addDataPoint = function(x, y, label) {
	this.dataPoints.push(new DataPoint(this, x, y, label));
}

p.redraw = function() {
	var ctx = this.ctx;
	var canvas = this.domElement;
	var width = canvas.width;
	var height = canvas.height;
	ctx.clearRect(0, 0, width, height);
	for (var i = 0; i < this.dataPoints.length; i++) {
		var dataPoint = this.dataPoints[i];
		dataPoint.redraw();
	}
}

module.exports = DataCanvas;