// @flow

/* eslint consistent-this: ["error", "localMaster"] */

const {LocalHttpServer} = require('./../local-http-server');
const {LocalSocketIoServer} = require('./../local-socket-io-server');
const {getPort} = require('./../helper');

import type {PushedStateType} from './../room';

import type {RequestCallBackType} from './../local-request';

type AttrType = {|
    +httpServerList: Array<LocalHttpServer>,
    +socketIoServerList: Array<LocalSocketIoServer>
|};

class LocalMaster {
    attr: AttrType;

    constructor() {
        const localMaster = this;

        localMaster.attr = {
            httpServerList: [],
            socketIoServerList: []
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

    addSocketIoServer(localSocketIoServer: LocalSocketIoServer) {
        const localMaster = this;
        const {socketIoServerList} = localMaster.attr;
        const indexOfLocalSocketIoServer = socketIoServerList.indexOf(localSocketIoServer);

        if (indexOfLocalSocketIoServer !== -1) {
            console.log('socketIoServerList already has localSocketIoServer', localMaster, localSocketIoServer);
            return;
        }

        socketIoServerList.push(localSocketIoServer);
    }

    removeSocketIoServer(localSocketIoServer: LocalSocketIoServer) {
        const localMaster = this;
        const {socketIoServerList} = localMaster.attr;
        const indexOfLocalSocketIoServer = socketIoServerList.indexOf(localSocketIoServer);

        if (indexOfLocalSocketIoServer === -1) {
            console.log('socketIoServerList has NO localSocketIoServer', localMaster, localSocketIoServer);
            return;
        }

        socketIoServerList.splice(indexOfLocalSocketIoServer, 1);
    }

    triggerHttp(requestType: 'get' | 'post', url: string, form: PushedStateType, requestCallBack: RequestCallBackType) {
        const localMaster = this;
        const {httpServerList} = localMaster.attr;

        httpServerList.forEach((localHttpServer: LocalHttpServer) => {
            if (localHttpServer.attr.port !== getPort(url)) {
                return;
            }

            localHttpServer.onRequest(requestType, url, form, requestCallBack);
        });
    }
}

module.exports.localMaster = new LocalMaster();
module.exports.LocalMaster = LocalMaster;
