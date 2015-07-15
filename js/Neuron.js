var Neuron;

(function() {
Neuron = function(pos, bias) {
	this.init(pos, bias);
}

var p = Neuron.prototype;

p.pos = null;
p.links = null;
p.backLinks = null;
p.preactivation = 0;
p.activation = 0;
p.bias = 0;
p.da = 0; // d activation
p.dz = 0; // d preactivation
p.db = 0; // d bias

p.init = function(pos, bias) {
	this.links = [];
	this.backLinks = [];
	this.pos = pos;
	this.bias = bias;
	this.preactivation = 0;
	this.activation = Neuron.sigmoid(this.bias);
	this.error = 0;
	this.da = 0;
	this.dz = 0;
	this.db = 0;
}

Neuron.sigmoid = function(x) {
	return 1 / (1 + Math.exp(-x));
}

p.update = function() {
	this.preactivation = 0;
	this.preactivation += this.bias;
	for (var i = 0; i < this.backLinks.length; i++) {
		var link = this.backLinks[i];
		this.preactivation += link.weight * link.n0.activation;
	}
	this.activation = Neuron.sigmoid(this.preactivation);
}

p.reset = function() {
	this.preactivation = 0;
	this.activation = Neuron.sigmoid(this.bias);
}

})();

module.exports = Neuron;
