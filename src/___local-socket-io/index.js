// @flow

/* global setTimeout */

/* eslint consistent-this: ["error", "localSocketIo"] */

type AttrType = {|
|};

class LocalSocketIo {
    attr: AttrType;

    constructor() {
        const localSocketIo = this;

        // LocalSocketIo.attr = {
        //     listenerList: [],
        //     url: '',
        //     options: null
        // };
    }
}

module.exports.LocalSocketIo = LocalSocketIo;
