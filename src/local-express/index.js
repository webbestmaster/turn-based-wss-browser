// @flow

/* eslint consistent-this: ["error", "localExpress"] */

// expressApp.get('/api/room/create', (req, res) => apiRoomCreate(req, res, server));

import type {RequestCallBackType} from './../local-request';
import type {PushedStateType} from './../room';

const {LocalExpressRequest} = require('./request');
const {LocalExpressResponse} = require('./response');
const {UrlMask} = require('./url-mask');

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

    onRequest(requestType: 'get' | 'post', url: string, form: PushedStateType, requestCallBack: RequestCallBackType) {
        const localExpress = this;
        const {listenerList} = localExpress.attr;

        listenerList.forEach((listener: LocalExpressListenerType) => {
            if (listener.type !== requestType) {
                return;
            }

            const urlMask = new UrlMask({initialUrl: listener.url});

            if (!urlMask.isCover(url)) {
                return;
            }

            const params = urlMask.getParams(url);
            const req = new LocalExpressRequest({params, body: form});
            const res = new LocalExpressResponse({callBack: requestCallBack});

            listener.callback(req, res);
        });
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
