const parseNumber = (val: unknown) => val && !isNaN(Number(val)) ? Number(val) : null; console.log(parseNumber(''));
