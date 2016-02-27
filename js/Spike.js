var Vector2 = require("./Vector2");

var Spike;

Spike = function(link) {
	this.link = link;
	this.pos = new Vector2(0, 0);
	this.radius = 0;
}

var p = Spike.prototype;

p.getMagnitude = function() {
	return this.link.n0.activation * this.link.weight;
}

module.exports = Spike;
