var math = {};

math.round = function(n, decimalDigits) {
	var factor = 1;
	for (var i = 0; i < decimalDigits; i++) {
		factor *= 10;
	}
	return Math.round(n * factor) / factor;
}

module.exports = math;