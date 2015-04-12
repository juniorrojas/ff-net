var Vector2;

(function() {

Vector2 = function(x, y) {
	this.init(x, y);
}

var p = Vector2.prototype;

p.x = 0;
p.y = 0;

p.init = function(x, y) {
	this.x = x;
	this.y = y;
}

p.add = function(v) {
	return new Vector2(this.x + v.x, this.y + v.y);
}

p.subtract = function(v) {
	return new Vector2(this.x - v.x, this.y - v.y);
}

p.magnitude = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
}

p.times = function(n) {
	return new Vector2(this.x * n, this.y * n);
}

p.normalize = function() {
	var magnitude = this.magnitude();
	return this.times(1 / magnitude);
}

p.dot = function(v) {
	return this.x * v.x + this.y * v.y;
}

p.crossZ = function(v) {
	return - v.x * this.y + this.x * v.y;
}

p.equals = function(v) {
	return v.x = this.x && v.y == this.y;
}

p.toString = function() {
	return "(x: " + this.x + ", y: " + this.y + ")";
}

})();
