var math = {};

math.roundToString = function(n, decimalDigits) {
	var factor = 1;
	for (var i = 0; i < decimalDigits; i++) {
		factor *= 10;
	}
	var str = (Math.round(n * factor) / factor).toString();
	
	if (decimalDigits == 0) return str;
	
	var dotPosition = str.indexOf(".");
	if (dotPosition === -1) {
		dotPosition = str.length;
		str += ".0";
	}
	for (var i = str.length - dotPosition - 1; i < decimalDigits; i++) {
		str += "0";
	}
	return str;
}

math.sigmoid = function(n) {
	return 1 / (1 + Math.exp(-n));
}

math.dSigmoid = function(n) {
	return math.sigmoid(n) * (1 - math.sigmoid(n));
}

module.exports = math;