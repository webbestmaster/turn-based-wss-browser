// @flow

/* global setTimeout, URL */

/* eslint consistent-this: ["error", "localSocketIoClient"] */
const {localMaster} = require('./../local-master');
const {LocalSocketIoServer} = require('./../local-socket-io-server');

type EventNameType = 'message' | 'connect' | 'disconnect';

type ListenerType = {|
    +eventName: EventNameType,
    +callBack: (data: mixed) => void
|};

type AttrType = {|
    +listenerList: Array<ListenerType>,
    url: string,
    options: mixed
|};

class LocalSocketIoClient {
    attr: AttrType;
    id: string;

    constructor() {
        const localSocketIoClient = this;

        localSocketIoClient.id = 'local-socket-id-' + Math.random();

        localSocketIoClient.attr = {
            listenerList: [],
            url: '',
            options: null
        };
    }

    connect(url: string, options?: mixed) {
        const localSocketIoClient = this;

        localSocketIoClient.attr.url = url;
        localSocketIoClient.attr.options = options;

        localMaster.attr.socketIoServerList.forEach((socketIoServer: LocalSocketIoServer) => {
            const urlObject = new URL(url);

            if (parseInt(urlObject.port, 10) === parseInt(socketIoServer.attr.localHttpServer.attr.port, 10)) {
                socketIoServer.connectSocket(localSocketIoClient);
            }
        });

        setTimeout((): void => localSocketIoClient.trigger('connect', null), 0);
    }

    disconnect() {
        const localSocketIoClient = this;

        // localSocketIoClient.attr.url = url;
        // localSocketIoClient.attr.options = options;

        // localMaster.attr.socketIoServerList.forEach((socketIoServer: LocalSocketIoServer) => {
        //     localSocketIoClient.removeAllListeners();
        //     socketIoServer.disconnectSocket(localSocketIoClient);
        // });

        setTimeout((): void => localSocketIoClient.trigger('disconnect', null), 0);
    }

    on(eventName: EventNameType, callBack: (message?: mixed) => void) { // eslint-disable-line id-length
        const localSocketIoClient = this;
        const {listenerList} = localSocketIoClient.attr;

        listenerList.push({eventName, callBack});
    }

    trigger(eventName: EventNameType, data: mixed) {
        const localSocketIoClient = this;
        const {listenerList} = localSocketIoClient.attr;

        listenerList
            .forEach((listener: ListenerType) => {
                if (listener.eventName === eventName) {
                    listener.callBack(data);
                }
            });
    }

    removeAllListeners() {
        const localSocketIoClient = this;
        const {listenerList} = localSocketIoClient.attr;

        listenerList.splice(0, listenerList.length);
    }

    emit(eventName: 'message', data: mixed) {
        const localSocketIoClient = this;

        localSocketIoClient.trigger('message', data);
    }
}

module.exports.LocalSocketIoClient = LocalSocketIoClient;
