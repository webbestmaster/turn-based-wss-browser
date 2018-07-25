// @flow

/* eslint consistent-this: ["error", "localExpressResponse"] */

import type {RequestCallBackType} from './../local-request';

type AttrType = {|
    +callBack: RequestCallBackType
|};

type ConstructorOptionsType = {|
    +callBack: RequestCallBackType
|};

class LocalExpressResponse {
    attr: AttrType;

    constructor(constructorOptions: ConstructorOptionsType) {
        const localExpressResponse = this;

        localExpressResponse.attr = {
            callBack: constructorOptions.callBack
        };
    }

    json(data: { [key: string]: mixed }) {
        const localExpressResponse = this;
        const {callBack} = localExpressResponse.attr;

        callBack(null, null, JSON.stringify(data));
    }
}

module.exports.LocalExpressResponse = LocalExpressResponse;
