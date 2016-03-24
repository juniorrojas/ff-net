var Link = function(n0, nf, weight) {
	this.n0 = n0;
	this.nf = nf;
	this.weight = weight;
	this.dw = 0;
}

var p = Link.prototype;

p.setParameters = function(params) {
	this.weight = params.weight;
}

p.getParameters = function() {
	return {
		weight: this.weight
	};
}

module.exports = Link;
