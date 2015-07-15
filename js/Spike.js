var Vector2 = require("./Vector2");

var Spike;
(function() {
Spike = function(link) {
	this.init(link);
}

var p = Spike.prototype;

p.pos = null;
p.link = null;
p.radius = 0;

p.init = function(link) {
	this.link = link;
	this.pos = new Vector2(0, 0);
	this.radius = 0;
}

p.getMagnitude = function() {
	return this.link.n0.activation * this.link.weight;
}

})();

module.exports = Spike;
