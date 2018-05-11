// @flow

/* eslint consistent-this: ["error", "localExpress"] */

// expressApp.get('/api/room/create', (req, res) => apiRoomCreate(req, res, server));

import type {RequestCallBackType} from '../local-request';

const {LocalExpressRequest} = require('./request');
const {LocalExpressResponse} = require('./response');

type ExpressCallBackType = (req: LocalExpressRequest, res: LocalExpressResponse) => void;

type LocalExpressListenerType = {|
    +type: 'get' | 'post',
    +url: string,
    +callback: ExpressCallBackType
|};

type AttrType = {|
    +listenerList: Array<LocalExpressListenerType>
|};

class LocalExpress {
    attr: AttrType;

    constructor() {
        const localExpress = this;

        localExpress.attr = {
            listenerList: []
        };
    }

    onRequest(requestType: 'get' | 'post', url: string, form: mixed, requestCallBack: RequestCallBackType) {
        const localExpress = this;
        const {listenerList} = localExpress.attr;
        const req = new LocalExpressRequest();
        const res = new LocalExpressResponse({callBack: requestCallBack});

        // todo:
        // 1 - check needed type
        // 2 - check needed url
        // 3 - get params from url and pass they into req
        console.error('you stay here!');

        listenerList[0].callback(req, res);
    }

    addListener(type: 'get' | 'post', url: string, callback: ExpressCallBackType) {
        const localExpress = this;
        const {listenerList} = localExpress.attr;

        listenerList.push({
            type,
            url,
            callback
        });
    }

    get(url: string, callBack: ExpressCallBackType) {
        const localExpress = this;

        localExpress.addListener('get', url, callBack);
    }

    post(url: string, callBack: ExpressCallBackType) {
        const localExpress = this;

        localExpress.addListener('post', url, callBack);
    }
}

module.exports.LocalExpress = LocalExpress;
