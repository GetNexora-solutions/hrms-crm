var parseNumber = function (val) { return val && !isNaN(Number(val)) ? Number(val) : null; };
console.log(parseNumber(''));
