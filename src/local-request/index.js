// @flow

/* eslint consistent-this: ["error", "localRequest"] */
const {localMaster} = require('./../local-master');

export type RequestCallBackType = (error: Error | null, response: mixed, body: string) => void;

function request(requestType: 'get' | 'post', url: string, form: mixed, requestCallBack: RequestCallBackType) {
    localMaster.triggerHttp(requestType, url, form, requestCallBack);
}

function get(url: string, requestCallBack: RequestCallBackType) {
    request('get', url, null, requestCallBack);
}

function post(url: string, form: mixed, requestCallBack: RequestCallBackType) {
    request('post', url, form, requestCallBack);
}

module.exports.localRequest = {get, post};