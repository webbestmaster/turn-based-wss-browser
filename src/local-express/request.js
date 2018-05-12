// @flow

/* eslint consistent-this: ["error", "localExpressRequest"] */

type ParamsType = { +[key: string]: string };
type ConstructorOptionsType = {|
    +params: ParamsType,
    +body: mixed
|};

class LocalExpressRequest {
    params: ParamsType;
    body: mixed;

    constructor(constructorOptions: ConstructorOptionsType) {
        const localExpressRequest = this;

        localExpressRequest.params = constructorOptions.params;
        localExpressRequest.body = constructorOptions.body;
    }
}

module.exports.LocalExpressRequest = LocalExpressRequest;
