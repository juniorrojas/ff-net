var Neuron;

(function() {
Neuron = function(pos) {
	this.init(pos);
}

var p = Neuron.prototype;

p.pos = null;
p.links = null;
p.backLinks = null;
p.preactivation = 0;
p.activation = 0;

p.init = function(pos) {
	this.links = [];
	this.backLinks = [];
	this.pos = pos;
	this.preactivation = 0;
	this.activation = 0;
}

p.update = function() {
	this.preactivation = 0;
	for (var i = 0; i < this.backLinks.length; i++) {
		var link = this.backLinks[i];
		this.preactivation += link.weight * link.n0.activation;
	}
	this.activation = 1 / (1 + Math.exp(-this.preactivation));
}

})();
