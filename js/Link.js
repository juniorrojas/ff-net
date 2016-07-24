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
	path.setAttribute("d", "M10 10 L 40 40");
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
