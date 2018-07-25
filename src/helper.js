// @flow

function getPort(originalUrl: string): number { // eslint-disable-line complexity
    const matches = originalUrl.match(/^(([a-z]+:)?(\/{2})?[^/]+).*$/);
    const url = matches ? matches[1] : originalUrl;
    const parts = url.split(':');
    const port = parseInt(parts[parts.length - 1], 10);

    if (parts[0] === 'http' && (Number.isNaN(port) || parts.length < 3)) {
        return 80;
    }

    if (parts[0] === 'https' && (Number.isNaN(port) || parts.length < 3)) {
        return 443;
    }

    if (parts.length === 1 || Number.isNaN(port)) {
        return 80;
    }

    return port;
}


function isBoolean(value: mixed): boolean %checks {
    return value === true || value === false;
}

function isNotBoolean(value: mixed): boolean %checks {
    return value !== true && value !== false;
}

function isNumber(value: mixed): boolean %checks {
    return typeof value === 'number';
}

function isNotNumber(value: mixed): boolean %checks {
    return typeof value !== 'number';
}

function isString(value: mixed): boolean %checks {
    return typeof value === 'string';
}

function isNotString(value: mixed): boolean %checks {
    return typeof value !== 'string';
}

function isFunction(value: mixed): boolean %checks {
    return typeof value === 'function';
}

function isNotFunction(value: mixed): boolean %checks {
    return typeof value !== 'function';
}

module.exports = {
    getPort,
    isBoolean,
    isNumber,
    isString,
    isFunction,
    isNotBoolean,
    isNotNumber,
    isNotString,
    isNotFunction
};
