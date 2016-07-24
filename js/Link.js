var svg = require("./svg");

var Link = function(n0, nf, weight) {
	this.n0 = n0;
	this.nf = nf;
	this.weight = weight;
	this.dw = 0;

	this.svgElement = svg.createElement("path");
	this.redraw();
}

var p = Link.prototype;

p.redraw = function() {
	var path = this.svgElement;
	var p0 = this.n0.getPosition();
	var pf = this.nf.getPosition();
	path.setAttribute(
		"d",
		"M" + p0.x + " " + p0.y + " " +
		"L" + pf.x + " " + pf.y)
	;
	path.setAttribute("stroke", "black");
	path.setAttribute("stroke-width", 2);
}

p.setParameters = function(params) {
	this.weight = params.weight;
}

p.getParameters = function() {
	return {
		weight: this.weight
	};
}

module.exports = Link;
