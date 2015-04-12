var Spike;
(function() {
Spike = function(link) {
	this.init(link);
}

var p = Spike.prototype;

p.pos = null;
p.link = null;

p.init = function(link) {
	this.link = link;
	this.pos = new Vector2(0, 0);
}
})();
