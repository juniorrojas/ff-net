// r, g, b, a are numbers between 0 and 1
var Color = function(r, g, b, a) {
	if (a == null) a = 1;
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

Color.WHITE = new Color(1, 1, 1);
Color.BLACK = new Color(0, 0, 0);

Color.RED = new Color(226 / 255, 86 / 255, 86 / 255);
Color.BLUE = new Color(135 / 255, 173 / 255, 236 / 255);

Color.LIGHT_BLUE = new Color(186 / 255, 224 / 255, 251 / 255);
Color.LIGHT_RED = new Color(252 / 255, 163 / 255, 163 / 255);

var p = Color.prototype;

// t = 1 means replace this with color c
p.blend = function(c, t) {
	return new Color(
		this.r * (1 - t) + c.r * t,
		this.g * (1 - t) + c.g * t,
		this.b * (1 - t) + c.b * t
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