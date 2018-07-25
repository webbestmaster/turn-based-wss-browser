// @flow

/* global setTimeout */

/* eslint consistent-this: ["error", "httpServer"] */
import type {RequestCallBackType} from './../local-request';
import type {PushedStateType} from './../room';
const {
    isBoolean,
    isNumber,
    isString,
    isFunction,
    isNotBoolean,
    isNotNumber,
    isNotString,
    isNotFunction
} = require('./../helper');

const {localMaster} = require('./../local-master');
const {LocalExpress} = require('./../local-express');
// const {LocalExpressRequest} = require('./request');
// const {LocalExpressResponse} = require('./response');

type AttrType = {|
    port: number,
    +expressApp: LocalExpress
|};

class LocalHttpServer {
    attr: AttrType;

    constructor(expressApp: LocalExpress) {
        const httpServer = this;

        httpServer.attr = {
            port: -1,
            expressApp
        };
    }

    onRequest(requestType: 'get' | 'post', url: string, form: PushedStateType, requestCallBack: RequestCallBackType) {
        const httpServer = this;
        const {expressApp} = httpServer.attr;

        expressApp.onRequest(requestType, url, form, requestCallBack);
    }

    bindEventListener() {
        const httpServer = this;

        localMaster.addHttpServer(httpServer);
    }

    unbindEventListener() {
        const httpServer = this;

        localMaster.removeHttpServer(httpServer);
    }

    listen(port: number, callback?: () => void) {
        const httpServer = this;

        httpServer.attr.port = port;

        httpServer.bindEventListener();

        if (isFunction(callback)) {
            setTimeout(callback, 0);
        }
    }

    close(callback?: () => void) {
        const httpServer = this;

        httpServer.unbindEventListener();

        if (isFunction(callback)) {
            setTimeout(callback, 0);
        }
    }
}

module.exports.LocalHttpServer = LocalHttpServer;
