// @flow

/* global setTimeout */

/* eslint consistent-this: ["error", "localSocketIoClient"] */

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

    constructor() {
        const localSocketIoClient = this;

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

        setTimeout((): void => localSocketIoClient.trigger('connect', null), 0);
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
        console.error('implement!!!!, get emit for current client ', data);
    }
}

module.exports.LocalSocketIoClient = LocalSocketIoClient;
