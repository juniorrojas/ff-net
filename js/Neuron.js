var Neuron;
(function() {
Neuron = function(pos) {
	this.init(pos);
}

var p = Neuron.prototype;

p.pos = null;
p.links = null;

p.init = function(pos) {
	this.links = [];
	this.pos = pos;
}

})();
