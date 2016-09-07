var Color = require("./Color");

var DataPoint = function(canvas, x, y, label) {
	this.canvas = canvas;
	this.x = x;
	this.y = y;
	this.label = label;
}

var p = DataPoint.prototype;

p.redraw = function() {
	var ctx = this.canvas.ctx;
	var width = this.canvas.domElement.width;
	var height = this.canvas.domElement.height;
	
	var fillColor;
	if (this.label == 0) fillColor = Color.RED;
	else fillColor = Color.BLUE;
	var strokeColor = fillColor.blend(Color.BLACK, 0.6);
	
	ctx.beginPath();
	ctx.fillStyle = fillColor.toString();
	ctx.strokeStyle = strokeColor.toString();
	ctx.arc(
		this.x * width, this.y * height,
		3,
		0, 2 * Math.PI
	);
	ctx.fill();
	ctx.stroke();
}

module.exports = DataPoint;