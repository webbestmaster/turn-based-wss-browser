// @flow

function getPort(originalUrl: string): number { // eslint-disable-line complexity
    const matches = originalUrl.match(/^(([a-z]+:)?(\/\/)?[^/]+).*$/);
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

module.exports.getPort = getPort;
