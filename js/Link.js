var Link;

Link = function(n0, nf, weight) {
	this.init(n0, nf, weight);
}

var p = Link.prototype;

p.init = function(n0, nf, weight) {
	this.n0 = n0;
	this.nf = nf;
	this.weight = weight;
	this.dw = 0;
}

module.exports = Link;
