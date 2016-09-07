var math = {};

math.round = function(n, decimalDigits) {
	var factor = 1;
	for (var i = 0; i < decimalDigits; i++) {
		factor *= 10;
	}
	return Math.round(n * factor) / factor;
}

math.sigmoid = function(n) {
	return 1 / (1 + Math.exp(-n));
}

math.dSigmoid = function(n) {
	return math.sigmoid(n) * (1 - math.sigmoid(n));
}

module.exports = math;