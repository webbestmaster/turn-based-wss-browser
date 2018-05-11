// @flow

/* eslint consistent-this: ["error", "localExpressRequest"] */

type ParamsType = {|
    roomId?: string,
    userId?: string,
    socketId?: string,
    count?: string,
    hash?: string,
    key?: string
|};

class LocalExpressRequest {
    params: ParamsType;

    constructor() {
        // const localExpressRequest = this;

        // localExpressRequest.params = {};
    }
}

module.exports.LocalExpressRequest = LocalExpressRequest;
