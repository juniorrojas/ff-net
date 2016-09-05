var Color = require("./Color");
var DataPoint = require("./DataPoint");

var DataCanvas = function() {
	this.dataPoints = [];
	var canvas = this.domElement = document.createElement("canvas");
	canvas.width = 400;
	canvas.height = 400;
	canvas.style.border = "1px solid black";
	this.ctx = canvas.getContext("2d");
	
	this.width = 50;
	this.height = 50;
	this.pixelColors = [];
	for (var i = 0; i < this.width; i++) {
		this.pixelColors.push([]);
		for (var j = 0; j < this.height; j++) {
			this.pixelColors[i].push(0);
		}
	}
}

var p = DataCanvas.prototype;

p.addDataPoint = function(x, y, label) {
	this.dataPoints.push(new DataPoint(this, x, y, label));
}

p.redraw = function(classify) {
	var ctx = this.ctx;
	var canvas = this.domElement;
	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;
	
	var width = this.width;
	var height = this.height;
	
	for (var i = 0; i < width; i++) {
		for (var j = 0; j < height; j++) {
			var label = classify(i / width, j / height);
			var color = Color.LIGHT_RED.blend(Color.LIGHT_BLUE, label);
			this.pixelColors[i][j] = color;
		}
	}

	var fWidth = canvasWidth / width;
	var fHeight = canvasHeight / height;
	var canvasImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	for (var i = 0; i < canvasImageData.data.length / 4; i++) {
		var y = Math.floor(i / canvasWidth);
		var x = i % canvasWidth;
		var ii = Math.floor(x / fWidth);
		var jj = Math.floor(y / fHeight);
		var color = this.pixelColors[ii][jj];
		canvasImageData.data[4 * i] = Math.round(color.r * 255);
		canvasImageData.data[4 * i + 1] = Math.round(color.g * 255);
		canvasImageData.data[4 * i + 2] = Math.round(color.b * 255);
		canvasImageData.data[4 * i + 3] = 255;
	}
	ctx.putImageData(canvasImageData, 0, 0);
	
	for (var i = 0; i < this.dataPoints.length; i++) {
		var dataPoint = this.dataPoints[i];
		dataPoint.redraw();
	}
}

DataCanvas.newFromData = function(data) {
	var dataCanvas = new DataCanvas();
	for (var i = 0; i < data.length; i++) {
		var item = data[i];
		dataCanvas.addDataPoint(item.x[0], item.x[1], item.y);
	}
	return dataCanvas;
}

module.exports = DataCanvas;