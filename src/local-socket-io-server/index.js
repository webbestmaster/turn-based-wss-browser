// @flow

/* global setTimeout */

/* eslint consistent-this: ["error", "localSocketIoServer"] */

const {LocalHttpServer} = require('./../local-http-server');

type AttrType = {|
    +localHttpServer: LocalHttpServer
|};

class LocalSocketIoServer {
    attr: AttrType;

    constructor(localHttpServer: LocalHttpServer) {
        const localSocketIoServer = this;

        localSocketIoServer.attr = {
            localHttpServer
        };
    }

    close(callback?: () => void) {
        const localSocketIoServer = this;

        if (typeof callback === 'function') {
            setTimeout(callback, 0);
        }
    }
}

module.exports.LocalSocketIoServer = LocalSocketIoServer;
