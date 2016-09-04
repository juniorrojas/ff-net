// r, g, b, a are numbers between 0 and 1
var Color = function(r, g, b, a) {
	if (a == null) a = 1;
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

Color.RED = Color(1, 0, 0);
Color.GREEN = Color(0, 1, 0);
Color.BLUE = Color(0, 0, 1);
Color.WHITE = Color(1, 1, 1);
Color.BLACK = Color(0, 0, 0);

var p = Color.prototype;

// t = 1 means replace this with color c
p.blend = function(c, t) {
	return new Color(
		this.r * (1 - t) + c.r,
		this.
	);
}

p.toString = function() {
	return "rgba(" +
		Math.floor(255 * this.r) + ", " +
		Math.floor(255 * this.g) + ", " +
		Math.floor(255 * this.b) + ", " +
		this.a
		+ ")";
}

module.exports = Color;