// @flow

/* eslint consistent-this: ["error", "localMaster"] */

const {LocalHttpServer} = require('./../local-http-server');
const {getPort} = require('./../helper');

import type {RequestCallBackType} from './../local-request';

type AttrType = {|
    +httpServerList: Array<LocalHttpServer>
|};

class LocalMaster {
    attr: AttrType;

    constructor() {
        const localMaster = this;

        localMaster.attr = {
            httpServerList: []
        };
    }

    addHttpServer(localHttpServer: LocalHttpServer) {
        const localMaster = this;
        const {httpServerList} = localMaster.attr;
        const indexOfLocalHttpServer = httpServerList.indexOf(localHttpServer);

        if (indexOfLocalHttpServer !== -1) {
            console.log('httpServerList already has localHttpServer', localMaster, localHttpServer);
            return;
        }

        httpServerList.push(localHttpServer);
    }

    removeHttpServer(localHttpServer: LocalHttpServer) {
        const localMaster = this;
        const {httpServerList} = localMaster.attr;
        const indexOfLocalHttpServer = httpServerList.indexOf(localHttpServer);

        if (indexOfLocalHttpServer === -1) {
            console.log('httpServerList has NO localHttpServer', localMaster, localHttpServer);
            return;
        }

        httpServerList.splice(indexOfLocalHttpServer, 1);
    }

    triggerHttp(requestType: 'get' | 'post', url: string, form: mixed, requestCallBack: RequestCallBackType) {
        const localMaster = this;
        const {httpServerList} = localMaster.attr;

        httpServerList
            .forEach((localHttpServer: LocalHttpServer) => {
                if (localHttpServer.attr.port !== getPort(url)) {
                    return;
                }

                localHttpServer.onRequest(requestType, url, form, requestCallBack);
            });
    }
}

module.exports.localMaster = new LocalMaster();
module.exports.LocalMaster = LocalMaster;
